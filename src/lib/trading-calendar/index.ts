import { addDays, compareYmd, weekdayUtc, type Ymd } from "@/lib/dates";
import { isMarketHoliday } from "@/lib/trading-calendar/holidays";

export { isMarketHoliday, nyseHolidays } from "@/lib/trading-calendar/holidays";

export function isWeekend(date: Ymd): boolean {
  const weekday = weekdayUtc(date);
  return weekday === 0 || weekday === 6;
}

export function isTradingDay(date: Ymd): boolean {
  return !isWeekend(date) && !isMarketHoliday(date);
}

export function previousTradingDay(date: Ymd): Ymd {
  let cursor = addDays(date, -1);
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, -1);
  }
  return cursor;
}

export function nextTradingDay(date: Ymd): Ymd {
  let cursor = addDays(date, 1);
  while (!isTradingDay(cursor)) {
    cursor = addDays(cursor, 1);
  }
  return cursor;
}

export function countTradingDaysInclusive(from: Ymd, to: Ymd): number {
  if (compareYmd(to, from) < 0) return 0;
  let count = 0;
  let cursor = from;
  while (compareYmd(cursor, to) <= 0) {
    if (isTradingDay(cursor)) count += 1;
    cursor = addDays(cursor, 1);
  }
  return count;
}

export function getTradingDayNumber(actualStartDate: Ymd, date: Ymd): number {
  if (compareYmd(date, actualStartDate) < 0) return 0;
  return countTradingDaysInclusive(actualStartDate, date);
}

export function getTradingDaysElapsed(actualStartDate: Ymd, today: Ymd, totalTradingDays: number): number {
  const elapsed = getTradingDayNumber(actualStartDate, today);
  return Math.min(Math.max(elapsed, 0), totalTradingDays);
}

export function getTradingDaysRemaining(
  actualStartDate: Ymd,
  today: Ymd,
  totalTradingDays: number,
): number {
  return Math.max(0, totalTradingDays - getTradingDaysElapsed(actualStartDate, today, totalTradingDays));
}

export function getNthTradingDay(start: Ymd, n: number): Ymd {
  if (n <= 1) {
    return isTradingDay(start) ? start : nextTradingDay(start);
  }

  let remaining = isTradingDay(start) ? n - 1 : n;
  let cursor = start;
  while (remaining > 0) {
    cursor = nextTradingDay(cursor);
    remaining -= 1;
  }
  return cursor;
}

export function getEstimatedCompletionDate(actualStartDate: Ymd, totalTradingDays: number): Ymd {
  return getNthTradingDay(actualStartDate, totalTradingDays);
}

export function hasChallengeEnded(actualStartDate: Ymd, today: Ymd, totalTradingDays: number): boolean {
  return getTradingDaysElapsed(actualStartDate, today, totalTradingDays) >= totalTradingDays &&
    compareYmd(today, getEstimatedCompletionDate(actualStartDate, totalTradingDays)) > 0;
}

export function isWithinChallengeWindow(actualStartDate: Ymd, today: Ymd, totalTradingDays: number): boolean {
  if (compareYmd(today, actualStartDate) < 0) return false;
  const lastDay = getEstimatedCompletionDate(actualStartDate, totalTradingDays);
  return compareYmd(today, lastDay) <= 0;
}

export function nyseTradingDayHasEnded(officialDate: Ymd, today: Ymd): boolean {
  return compareYmd(today, officialDate) > 0 && isTradingDay(officialDate);
}

export function nextOfficialChallengeDate(closedDate: Ymd): Ymd {
  return nextTradingDay(closedDate);
}

export function challengeSessionDate(officialDate: Ymd): Ymd {
  return isTradingDay(officialDate) ? officialDate : nextTradingDay(officialDate);
}

export type AutoChallengeDayStep =
  | { action: "stay" }
  | { action: "complete" }
  | { action: "advance"; nextDate: Ymd; nextNumber: number };

export function nextAutoChallengeStep(input: {
  officialDate: Ymd;
  currentDayNumber: number;
  totalTradingDays: number;
  today: Ymd;
}): AutoChallengeDayStep {
  const sessionDate = challengeSessionDate(input.officialDate);
  if (compareYmd(input.today, sessionDate) <= 0) {
    return { action: "stay" };
  }

  if (input.currentDayNumber >= input.totalTradingDays) {
    return { action: "complete" };
  }

  const nextDate = nextTradingDay(sessionDate);
  if (compareYmd(nextDate, input.today) > 0) {
    return { action: "stay" };
  }

  return {
    action: "advance",
    nextDate,
    nextNumber: input.currentDayNumber + 1,
  };
}

export function deriveChallengeDayState(input: {
  startDate: Ymd;
  totalTradingDays: number;
  today: Ymd;
}): { status: "active" | "completed"; officialDate: Ymd; dayNumber: number } {
  let officialDate = input.startDate;
  let dayNumber = 1;

  for (let step = 0; step < 400; step += 1) {
    const decision = nextAutoChallengeStep({
      officialDate,
      currentDayNumber: dayNumber,
      totalTradingDays: input.totalTradingDays,
      today: input.today,
    });

    if (decision.action === "stay") {
      return { status: "active", officialDate, dayNumber };
    }

    if (decision.action === "complete") {
      return { status: "completed", officialDate, dayNumber };
    }

    officialDate = decision.nextDate;
    dayNumber = decision.nextNumber;
  }

  return { status: "active", officialDate, dayNumber };
}
