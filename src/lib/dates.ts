import { TIMEZONE } from "@/lib/constants";

export type Ymd = string;

export function todayInNewYork(now = new Date()): Ymd {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function ymdToUtcDate(ymd: Ymd): Date {
  const [year, month, day] = ymd.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function dateToYmd(date: Date): Ymd {
  return date.toISOString().slice(0, 10);
}

export function weekdayUtc(ymd: Ymd): number {
  return ymdToUtcDate(ymd).getUTCDay();
}

export function addDays(ymd: Ymd, days: number): Ymd {
  const date = ymdToUtcDate(ymd);
  date.setUTCDate(date.getUTCDate() + days);
  return dateToYmd(date);
}

export function compareYmd(a: Ymd, b: Ymd): number {
  return a.localeCompare(b);
}

export function formatLongDate(ymd: Ymd, locale = "es-MX"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ymdToUtcDate(ymd));
}

export function formatShortDate(ymd: Ymd, locale = "es-MX"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "short",
  }).format(ymdToUtcDate(ymd));
}
