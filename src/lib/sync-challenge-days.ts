import { ChallengeStatus } from "@prisma/client";
import { dateToYmd, todayInNewYork, ymdToUtcDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { nextAutoChallengeStep } from "@/lib/trading-calendar";

const MAX_STEPS = 400;

export async function syncChallengeDays(challengeId: string, today = todayInNewYork()) {
  for (let step = 0; step < MAX_STEPS; step += 1) {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge || challenge.status !== ChallengeStatus.ACTIVE) {
      return challenge;
    }
    if (!challenge.currentDayDate || challenge.currentDayNumber < 1) {
      return challenge;
    }

    const decision = nextAutoChallengeStep({
      officialDate: dateToYmd(challenge.currentDayDate),
      currentDayNumber: challenge.currentDayNumber,
      totalTradingDays: challenge.totalTradingDays,
      today,
    });

    if (decision.action === "stay") {
      return challenge;
    }

    if (decision.action === "complete") {
      await prisma.challenge.updateMany({
        where: { id: challengeId, status: ChallengeStatus.ACTIVE },
        data: { status: ChallengeStatus.COMPLETED, completedAt: new Date() },
      });
      return prisma.challenge.findUnique({ where: { id: challengeId } });
    }

    await prisma.challenge.updateMany({
      where: {
        id: challengeId,
        status: ChallengeStatus.ACTIVE,
        currentDayNumber: challenge.currentDayNumber,
      },
      data: {
        currentDayNumber: decision.nextNumber,
        currentDayDate: ymdToUtcDate(decision.nextDate),
      },
    });
  }

  return prisma.challenge.findUnique({ where: { id: challengeId } });
}

export async function syncAllActiveChallengeDays(today = todayInNewYork()) {
  const active = await prisma.challenge.findMany({
    where: { status: ChallengeStatus.ACTIVE },
    select: { id: true },
  });

  for (const challenge of active) {
    await syncChallengeDays(challenge.id, today);
  }
}
