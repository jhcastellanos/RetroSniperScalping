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
