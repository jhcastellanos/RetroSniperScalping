import { Prisma } from "@prisma/client";
import { money } from "@/lib/money";

export type DayKind = "positive" | "negative" | "flat";

export function dailyReturn(todayBalance: Prisma.Decimal | string | number, previousBalance: Prisma.Decimal | string | number) {
  const today = money(todayBalance);
  const previous = money(previousBalance);
  if (previous.isZero()) return money(0);
  return today.minus(previous).div(previous).times(100);
}

export function totalReturn(currentBalance: Prisma.Decimal | string | number, startingBalance: Prisma.Decimal | string | number) {
  const current = money(currentBalance);
  const starting = money(startingBalance);
  if (starting.isZero()) return money(0);
  return current.minus(starting).div(starting).times(100);
}

export function goalProgress(
  currentBalance: Prisma.Decimal | string | number,
  startingBalance: Prisma.Decimal | string | number,
  targetBalance: Prisma.Decimal | string | number,
) {
  const current = money(currentBalance);
  const starting = money(startingBalance);
  const target = money(targetBalance);
  const span = target.minus(starting);
  if (span.isZero()) return money(0);
  return current.minus(starting).div(span).times(100);
}

export function classifyDay(todayBalance: Prisma.Decimal | string | number, previousBalance: Prisma.Decimal | string | number): DayKind {
  const today = money(todayBalance);
  const previous = money(previousBalance);
  if (today.gt(previous)) return "positive";
  if (today.lt(previous)) return "negative";
  return "flat";
}

export function reachedTarget(
  currentBalance: Prisma.Decimal | string | number,
  targetBalance: Prisma.Decimal | string | number,
) {
  return money(currentBalance).gte(money(targetBalance));
}

export function countDayKinds(returns: Array<{ today: Prisma.Decimal; previous: Prisma.Decimal }>) {
  let positiveDays = 0;
  let negativeDays = 0;
  let flatDays = 0;

  for (const entry of returns) {
    const kind = classifyDay(entry.today, entry.previous);
    if (kind === "positive") positiveDays += 1;
    else if (kind === "negative") negativeDays += 1;
    else flatDays += 1;
  }

  return { positiveDays, negativeDays, flatDays };
}
