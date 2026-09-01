import { ChallengeStatus } from "@prisma/client";
import { dateToYmd, todayInNewYork, ymdToUtcDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";
import { deriveChallengeDayState } from "@/lib/trading-calendar";

export async function syncChallengeDays(challengeId: string, today = todayInNewYork()) {
  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge || challenge.status !== ChallengeStatus.ACTIVE) {
    return challenge;
  }
  if (!challenge.actualStartDate || challenge.currentDayNumber < 1) {
    return challenge;
  }

  const derived = deriveChallengeDayState({
    startDate: dateToYmd(challenge.actualStartDate),
    totalTradingDays: challenge.totalTradingDays,
    today,
  });

  if (derived.status === "completed") {
    await prisma.challenge.updateMany({
      where: { id: challengeId, status: ChallengeStatus.ACTIVE },
      data: {
        currentDayNumber: derived.dayNumber,
        currentDayDate: ymdToUtcDate(derived.officialDate),
        status: ChallengeStatus.COMPLETED,
        completedAt: challenge.completedAt ?? new Date(),
      },
    });
    return prisma.challenge.findUnique({ where: { id: challengeId } });
  }

  const currentDate = challenge.currentDayDate ? dateToYmd(challenge.currentDayDate) : null;
  if (
    challenge.currentDayNumber === derived.dayNumber &&
    currentDate === derived.officialDate
  ) {
    return challenge;
  }

  await prisma.challenge.updateMany({
    where: { id: challengeId, status: ChallengeStatus.ACTIVE },
    data: {
      currentDayNumber: derived.dayNumber,
      currentDayDate: ymdToUtcDate(derived.officialDate),
    },
  });

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
