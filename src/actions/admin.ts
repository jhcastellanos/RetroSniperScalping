"use server";

import { ChallengeStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminAction } from "@/lib/session";
import { challengeSchema } from "@/lib/validations";
import { AppError, ErrorMessages, getErrorMessage } from "@/lib/errors";
import { money } from "@/lib/money";
import { todayInNewYork, ymdToUtcDate, dateToYmd } from "@/lib/dates";
import { nextOfficialChallengeDate } from "@/lib/trading-calendar";

function revalidateChallenge(id?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/actualizar");
  revalidatePath("/progreso");
  if (id) revalidatePath(`/admin/retos/${id}`);
}

type ChallengeFormState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createChallenge(_prev: ChallengeFormState, formData: FormData): Promise<ChallengeFormState> {
  try {
    await requireAdminAction();
    const parsed = challengeSchema.safeParse({
      name: formData.get("name"),
      startingBalance: formData.get("startingBalance"),
      targetBalance: formData.get("targetBalance"),
      totalTradingDays: formData.get("totalTradingDays"),
      plannedStartDate: formData.get("plannedStartDate") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del reto." };
    }

    const challenge = await prisma.challenge.create({
      data: {
        name: parsed.data.name,
        startingBalance: money(parsed.data.startingBalance),
        targetBalance: money(parsed.data.targetBalance),
        totalTradingDays: parsed.data.totalTradingDays,
        plannedStartDate: parsed.data.plannedStartDate
          ? ymdToUtcDate(parsed.data.plannedStartDate)
          : null,
        status: ChallengeStatus.REGISTRATION,
      },
    });

    revalidateChallenge(challenge.id);
    return { success: true, id: challenge.id };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function openRegistration(challengeId: string) {
  try {
    await requireAdminAction();
    const updated = await prisma.challenge.updateMany({
      where: { id: challengeId, status: ChallengeStatus.DRAFT },
      data: { status: ChallengeStatus.REGISTRATION },
    });
    if (updated.count === 0) {
      throw new AppError("El reto no se puede abrir para inscripción.", "INVALID_STATUS");
    }
    revalidateChallenge(challengeId);
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function startChallengeToday(challengeId: string) {
  try {
    await requireAdminAction();
    const today = todayInNewYork();

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");

    // plannedStartDate is informational only. Admin can start any calendar day,
    // including weekends. After midnight in New York the day counter moves to
    // the next NYSE trading day on its own.
    if (challenge.status === ChallengeStatus.ACTIVE || challenge.actualStartDate) {
      return {
        success: false,
        alreadyStarted: true,
        error: ErrorMessages.challengeAlreadyStarted,
      };
    }

    if (challenge.status !== ChallengeStatus.REGISTRATION) {
      throw new AppError(ErrorMessages.challengeNotRegistration, "INVALID_STATUS");
    }

    const participants = await prisma.challengeParticipant.count({
      where: {
        challengeId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
    });
    if (participants < 1) {
      throw new AppError(ErrorMessages.noParticipants, "NO_PARTICIPANTS");
    }

    const updated = await prisma.challenge.updateMany({
      where: {
        id: challengeId,
        status: ChallengeStatus.REGISTRATION,
        actualStartDate: null,
      },
      data: {
        status: ChallengeStatus.ACTIVE,
        actualStartDate: ymdToUtcDate(today),
        currentDayNumber: 1,
        currentDayDate: ymdToUtcDate(today),
      },
    });

    if (updated.count === 0) {
      return {
        success: false,
        alreadyStarted: true,
        error: ErrorMessages.challengeAlreadyStarted,
      };
    }

    revalidateChallenge(challengeId);
    return { success: true, alreadyStarted: false };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function closeChallengeDay(challengeId: string) {
  try {
    await requireAdminAction();
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");
    if (challenge.status !== ChallengeStatus.ACTIVE) {
      throw new AppError(ErrorMessages.challengeNotActive, "INVALID_STATUS");
    }
    if (!challenge.currentDayDate || challenge.currentDayNumber < 1) {
      throw new AppError(ErrorMessages.dayNotOpen, "DAY_NOT_OPEN");
    }

    if (challenge.currentDayNumber >= challenge.totalTradingDays) {
      await prisma.challenge.update({
        where: { id: challengeId },
        data: {
          status: ChallengeStatus.COMPLETED,
          completedAt: new Date(),
        },
      });
      revalidateChallenge(challengeId);
      return { success: true, completed: true, closedDay: challenge.currentDayNumber };
    }

    const closedDate = dateToYmd(challenge.currentDayDate);
    const nextDate = nextOfficialChallengeDate(closedDate);
    const nextNumber = challenge.currentDayNumber + 1;

    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        currentDayNumber: nextNumber,
        currentDayDate: ymdToUtcDate(nextDate),
      },
    });

    revalidateChallenge(challengeId);
    return {
      success: true,
      completed: false,
      closedDay: challenge.currentDayNumber,
      nextDay: nextNumber,
      nextDate,
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function completeChallenge(challengeId: string) {
  try {
    await requireAdminAction();
    await prisma.challenge.updateMany({
      where: {
        id: challengeId,
        status: ChallengeStatus.ACTIVE,
      },
      data: {
        status: ChallengeStatus.COMPLETED,
        completedAt: new Date(),
      },
    });
    revalidateChallenge(challengeId);
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function updateChallenge(_prev: ChallengeFormState, formData: FormData): Promise<ChallengeFormState> {
  try {
    await requireAdminAction();
    const challengeId = String(formData.get("challengeId") ?? "");
    const parsed = challengeSchema.safeParse({
      name: formData.get("name"),
      startingBalance: formData.get("startingBalance"),
      targetBalance: formData.get("targetBalance"),
      totalTradingDays: formData.get("totalTradingDays"),
      plannedStartDate: formData.get("plannedStartDate") || undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del reto." };
    }

    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");

    await prisma.challenge.update({
      where: { id: challengeId },
      data: {
        name: parsed.data.name,
        startingBalance: money(parsed.data.startingBalance),
        targetBalance: money(parsed.data.targetBalance),
        totalTradingDays: parsed.data.totalTradingDays,
        plannedStartDate: parsed.data.plannedStartDate
          ? ymdToUtcDate(parsed.data.plannedStartDate)
          : null,
      },
    });

    revalidateChallenge(challengeId);
    return { success: true, id: challengeId };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function deleteChallenge(challengeId: string) {
  try {
    await requireAdminAction();
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: { _count: { select: { participants: true } } },
    });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");

    await prisma.$transaction(async (tx) => {
      await tx.dailyBalance.deleteMany({ where: { challengeId } });
      await tx.challengeParticipant.deleteMany({ where: { challengeId } });
      await tx.challenge.delete({ where: { id: challengeId } });
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/actualizar");
    revalidatePath("/progreso");
    return { success: true, removedParticipants: challenge._count.participants };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
