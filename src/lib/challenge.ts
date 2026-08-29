import { ChallengeStatus, ParticipantStatus, Prisma, Role } from "@prisma/client";
import { dateToYmd, todayInNewYork, type Ymd } from "@/lib/dates";
import { money } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { classifyDay, dailyReturn, goalProgress, totalReturn } from "@/lib/stats";
import {
  getEstimatedCompletionDate,
  getTradingDayNumber,
  isTradingDay,
  nyseTradingDayHasEnded,
} from "@/lib/trading-calendar";

export function challengeStartYmd(challenge: { actualStartDate: Date | null }): Ymd | null {
  return challenge.actualStartDate ? dateToYmd(challenge.actualStartDate) : null;
}

export function effectiveBalance(
  participant: { currentBalance: Prisma.Decimal | null },
  startingBalance: Prisma.Decimal | string | number,
) {
  return participant.currentBalance ?? money(startingBalance);
}

export type LeaderboardRow = {
  position: number;
  participantId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  googleImage: string | null;
  image: string | null;
  currentBalance: Prisma.Decimal;
  totalReturn: Prisma.Decimal;
  goalProgress: Prisma.Decimal;
  status: ParticipantStatus;
  completedAt: Date | null;
  isYou: boolean;
};

export async function getLeaderboard(challengeId: string, currentUserId?: string): Promise<LeaderboardRow[]> {
  const challenge = await prisma.challenge.findUniqueOrThrow({
    where: { id: challengeId },
  });

  const participants = await prisma.challengeParticipant.findMany({
    where: {
      challengeId,
      status: { in: [ParticipantStatus.ACTIVE, ParticipantStatus.COMPLETED] },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          googleImage: true,
          image: true,
        },
      },
    },
    orderBy: [
      { currentBalance: { sort: "desc", nulls: "last" } },
      { currentBalanceRecordedAt: { sort: "asc", nulls: "last" } },
      { joinedAt: "asc" },
      { id: "asc" },
    ],
  });

  const starting = money(challenge.startingBalance);

  const ranked = [...participants].sort((a, b) => {
    const balanceA = effectiveBalance(a, starting);
    const balanceB = effectiveBalance(b, starting);
    const balanceCmp = balanceB.comparedTo(balanceA);
    if (balanceCmp !== 0) return balanceCmp;

    const timeA = a.currentBalanceRecordedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const timeB = b.currentBalanceRecordedAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (timeA !== timeB) return timeA - timeB;

    const joined = a.joinedAt.getTime() - b.joinedAt.getTime();
    if (joined !== 0) return joined;
    return a.id.localeCompare(b.id);
  });

  return ranked.map((participant, index) => {
    const current = effectiveBalance(participant, starting);
    return {
      position: index + 1,
      participantId: participant.id,
      userId: participant.user.id,
      firstName: participant.user.firstName,
      lastName: participant.user.lastName,
      profileImage: participant.user.profileImage,
      googleImage: participant.user.googleImage,
      image: participant.user.image,
      currentBalance: current,
      totalReturn: totalReturn(current, starting),
      goalProgress: goalProgress(current, starting, challenge.targetBalance),
      status: participant.status,
      completedAt: participant.completedAt,
      isYou: participant.userId === currentUserId,
    };
  });
}

export async function getParticipantRank(challengeId: string, userId: string) {
  const rows = await getLeaderboard(challengeId, userId);
  return rows.find((row) => row.isYou) ?? null;
}

export type DailyPoint = {
  dayNumber: number;
  tradingDate: Ymd;
  balance: Prisma.Decimal;
  dailyReturn: Prisma.Decimal | null;
  kind: "positive" | "negative" | "flat" | null;
};

export async function getParticipantHistory(participantId: string, challengeId: string): Promise<DailyPoint[]> {
  const challenge = await prisma.challenge.findUniqueOrThrow({ where: { id: challengeId } });
  const start = challengeStartYmd(challenge);
  const balances = await prisma.dailyBalance.findMany({
    where: { participantId, challengeId },
    orderBy: { tradingDate: "asc" },
  });

  const starting = money(challenge.startingBalance);
  let previous = starting;

  return balances.map((entry) => {
    const ymd = dateToYmd(entry.tradingDate);
    const ret = dailyReturn(entry.balance, previous);
    const point: DailyPoint = {
      dayNumber: entry.dayNumber > 0 ? entry.dayNumber : start ? getTradingDayNumber(start, ymd) : 0,
      tradingDate: ymd,
      balance: entry.balance,
      dailyReturn: ret,
      kind: classifyDay(entry.balance, previous),
    };
    previous = money(entry.balance);
    return point;
  });
}

export function buildChallengeProgress(challenge: {
  status: ChallengeStatus;
  actualStartDate: Date | null;
  totalTradingDays: number;
  currentDayNumber?: number;
  currentDayDate?: Date | null;
}, today = todayInNewYork()) {
  const start = challengeStartYmd(challenge);
  if (!start || challenge.status === ChallengeStatus.DRAFT || challenge.status === ChallengeStatus.REGISTRATION) {
    return {
      tradingDayNumber: 0,
      tradingDaysElapsed: 0,
      tradingDaysRemaining: challenge.totalTradingDays,
      estimatedCompletionDate: null as Ymd | null,
      canSubmitToday: false,
      officialDate: null as Ymd | null,
      officialDateIsTradingDay: false,
      tradingDayEnded: false,
    };
  }

  const officialDate = challenge.currentDayDate ? dateToYmd(challenge.currentDayDate) : start;
  const tradingDayNumber = challenge.currentDayNumber && challenge.currentDayNumber > 0
    ? challenge.currentDayNumber
    : 1;
  const remaining = Math.max(0, challenge.totalTradingDays - tradingDayNumber);

  return {
    tradingDayNumber,
    tradingDaysElapsed: tradingDayNumber,
    tradingDaysRemaining: remaining,
    estimatedCompletionDate: getEstimatedCompletionDate(officialDate, remaining + 1),
    canSubmitToday:
      challenge.status === ChallengeStatus.ACTIVE &&
      tradingDayNumber >= 1 &&
      tradingDayNumber <= challenge.totalTradingDays,
    officialDate,
    officialDateIsTradingDay: isTradingDay(officialDate),
    tradingDayEnded: nyseTradingDayHasEnded(officialDate, today),
  };
}

export function challengeAcceptsResults(status: ChallengeStatus) {
  return status === ChallengeStatus.ACTIVE;
}

export function userIsAdmin(role: Role) {
  return role === Role.ADMIN;
}
