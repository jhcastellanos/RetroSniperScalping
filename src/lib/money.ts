import { Prisma } from "@prisma/client";

export type Money = Prisma.Decimal;

export function money(value: Prisma.Decimal | string | number): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function moneyToNumber(value: Prisma.Decimal | string | number): number {
  return money(value).toNumber();
}

export function formatMoney(value: Prisma.Decimal | string | number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(moneyToNumber(value));
}

export function formatSignedMoney(value: Prisma.Decimal | string | number): string {
  const amount = money(value);
  const formatted = formatMoney(amount.abs());
  if (amount.isZero()) return formatted;
  return amount.isPositive() ? `+${formatted}` : `-${formatted}`;
}

export function formatPercent(value: Prisma.Decimal | string | number): string {
  const amount = money(value);
  const formatted = `${amount.abs().toFixed(2)}%`;
  if (amount.isZero()) return formatted;
  return amount.isPositive() ? `+${formatted}` : `-${formatted}`;
}

export function clampPercent(value: Prisma.Decimal, min = 0, max = 100): number {
  const n = moneyToNumber(value);
  return Math.min(max, Math.max(min, n));
}
