"use server";

import { ChallengeStatus, ParticipantStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { dailyBalanceSchema } from "@/lib/validations";
import { AppError, ErrorMessages, getErrorMessage } from "@/lib/errors";
import { money } from "@/lib/money";
import { dateToYmd, ymdToUtcDate } from "@/lib/dates";
import { dailyReturn, reachedTarget } from "@/lib/stats";
import { getLeaderboard } from "@/lib/challenge";
import { syncChallengeDays } from "@/lib/sync-challenge-days";

export type SaveBalanceResult = {
  error?: string;
  success?: boolean;
  previousBalance?: string;
  newBalance?: string;
  change?: string;
  dailyReturn?: string;
  previousRank?: number | null;
  newRank?: number | null;
};

async function maybeCompleteChallenge(challengeId: string) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.status !== ChallengeStatus.ACTIVE) return;
  if (challenge.currentDayNumber > challenge.totalTradingDays) {
    await prisma.challenge.updateMany({
      where: { id: challengeId, status: ChallengeStatus.ACTIVE },
      data: { status: ChallengeStatus.COMPLETED, completedAt: new Date() },
    });
  }
}

export async function saveDailyBalance(_prev: SaveBalanceResult, formData: FormData): Promise<SaveBalanceResult> {
  try {
    const user = await requireUser();
    const parsed = dailyBalanceSchema.safeParse({
      challengeId: formData.get("challengeId"),
      balance: formData.get("balance"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? ErrorMessages.invalidBalance };
    }

    const challenge = await prisma.challenge.findUnique({
      where: { id: parsed.data.challengeId },
    });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");

    if (challenge.status === ChallengeStatus.ACTIVE) {
      await syncChallengeDays(challenge.id);
    }

    const current = await prisma.challenge.findUnique({
      where: { id: parsed.data.challengeId },
    });
    if (!current) throw new AppError("El reto no existe.", "NOT_FOUND");

    if (current.status !== ChallengeStatus.ACTIVE) {
      throw new AppError(ErrorMessages.challengeNotStarted, "NOT_STARTED");
    }
    if (!current.actualStartDate || !current.currentDayDate || current.currentDayNumber < 1) {
      throw new AppError(ErrorMessages.dayNotOpen, "DAY_NOT_OPEN");
    }
    if (current.currentDayNumber > current.totalTradingDays) {
      await maybeCompleteChallenge(current.id);
      throw new AppError(ErrorMessages.challengeCompleted, "COMPLETED");
    }

    const officialDate = dateToYmd(current.currentDayDate);

    const participant = await prisma.challengeParticipant.findUnique({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId: current.id,
        },
      },
    });
    if (!participant || participant.status === ParticipantStatus.REMOVED) {
      throw new AppError(ErrorMessages.notRegistered, "NOT_REGISTERED");
    }

    const previousRank = (await getLeaderboard(current.id, user.id)).find((row) => row.isYou)?.position ?? null;
    const tradingDate = ymdToUtcDate(officialDate);
    const newBalance = money(parsed.data.balance);

    const previousEntry = await prisma.dailyBalance.findFirst({
      where: {
        participantId: participant.id,
        challengeId: current.id,
        tradingDate: { lt: tradingDate },
      },
      orderBy: { tradingDate: "desc" },
    });
    const previousBalance = previousEntry?.balance ?? money(current.startingBalance);

    const result = await prisma.$transaction(async (tx) => {
      const saved = await tx.dailyBalance.upsert({
        where: {
          participantId_challengeId_tradingDate: {
            participantId: participant.id,
            challengeId: current.id,
            tradingDate,
          },
        },
        create: {
          participantId: participant.id,
          challengeId: current.id,
          balance: newBalance,
          tradingDate,
          dayNumber: current.currentDayNumber,
        },
        update: {
          balance: newBalance,
          dayNumber: current.currentDayNumber,
        },
      });

      const shouldUpdateTimestamp =
        !participant.currentBalance || !money(participant.currentBalance).eq(newBalance);

      const completedNow =
        !participant.completedAt && reachedTarget(newBalance, current.targetBalance);

      await tx.challengeParticipant.update({
        where: { id: participant.id },
        data: {
          currentBalance: newBalance,
          currentBalanceRecordedAt: shouldUpdateTimestamp ? new Date() : participant.currentBalanceRecordedAt,
          completedAt: completedNow ? new Date() : participant.completedAt,
          status: completedNow || participant.completedAt
            ? ParticipantStatus.COMPLETED
            : participant.status,
        },
      });

      return saved;
    });

    const newRank = (await getLeaderboard(current.id, user.id)).find((row) => row.isYou)?.position ?? null;

    revalidatePath("/");
    revalidatePath("/actualizar");
    revalidatePath("/progreso");
    revalidatePath("/admin");

    return {
      success: true,
      previousBalance: previousBalance.toFixed(2),
      newBalance: result.balance.toFixed(2),
      change: newBalance.minus(previousBalance).toFixed(2),
      dailyReturn: dailyReturn(newBalance, previousBalance).toFixed(2),
      previousRank,
      newRank,
    };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
