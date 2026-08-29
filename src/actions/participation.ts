"use server";

import { ChallengeStatus, ParticipantStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { AppError, ErrorMessages, getErrorMessage } from "@/lib/errors";

export async function joinChallenge(challengeId: string) {
  try {
    const user = await requireUser();
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw new AppError("El reto no existe.", "NOT_FOUND");

    if (
      challenge.status !== ChallengeStatus.REGISTRATION &&
      challenge.status !== ChallengeStatus.ACTIVE
    ) {
      throw new AppError(ErrorMessages.cannotJoin, "CANNOT_JOIN");
    }

    await prisma.challengeParticipant.upsert({
      where: {
        userId_challengeId: { userId: user.id, challengeId },
      },
      update: {},
      create: {
        userId: user.id,
        challengeId,
        status: ParticipantStatus.ACTIVE,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
