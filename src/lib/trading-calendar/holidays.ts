import { addDays, weekdayUtc, type Ymd } from "@/lib/dates";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function ymd(year: number, month: number, day: number): Ymd {
  return `${year}-${pad(month)}-${pad(day)}`;
}

function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Ymd {
  const first = ymd(year, month, 1);
  const firstWeekday = weekdayUtc(first);
  const offset = (weekday - firstWeekday + 7) % 7;
  return ymd(year, month, 1 + offset + (n - 1) * 7);
}

function lastWeekdayOfMonth(year: number, month: number, weekday: number): Ymd {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const last = ymd(year, month, lastDay);
  const lastWeekday = weekdayUtc(last);
  const offset = (lastWeekday - weekday + 7) % 7;
  return ymd(year, month, lastDay - offset);
}

function observed(date: Ymd): Ymd {
  const weekday = weekdayUtc(date);
  if (weekday === 6) return addDays(date, -1);
  if (weekday === 0) return addDays(date, 1);
  return date;
}

function westernEasterSunday(year: number): Ymd {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return ymd(year, month, day);
}

export function nyseHolidays(year: number): Ymd[] {
  const easter = westernEasterSunday(year);
  const goodFriday = addDays(easter, -2);

  const holidays = [
    observed(ymd(year, 1, 1)),
    nthWeekdayOfMonth(year, 1, 1, 3),
    nthWeekdayOfMonth(year, 2, 1, 3),
    goodFriday,
    lastWeekdayOfMonth(year, 5, 1),
    observed(ymd(year, 6, 19)),
    observed(ymd(year, 7, 4)),
    nthWeekdayOfMonth(year, 9, 1, 1),
    nthWeekdayOfMonth(year, 11, 4, 4),
    observed(ymd(year, 12, 25)),
  ];

  return [...new Set(holidays)].sort();
}

const holidayCache = new Map<number, Set<Ymd>>();

export function isMarketHoliday(date: Ymd): boolean {
  const year = Number(date.slice(0, 4));
  let set = holidayCache.get(year);
  if (!set) {
    set = new Set(nyseHolidays(year));
    holidayCache.set(year, set);
  }
  return set.has(date);
}
