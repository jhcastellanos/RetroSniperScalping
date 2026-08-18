"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, formatPercent, money } from "@/lib/money";
import { formatShortDate } from "@/lib/dates";
import type { DailyPoint } from "@/lib/challenge";

type Point = {
  day: number;
  date: string;
  balance: number;
  dailyReturn: number | null;
};

export function AccountGrowthChart({
  startingBalance,
  history,
}: {
  startingBalance: string;
  history: DailyPoint[];
}) {
  const data: Point[] = [
    {
      day: 0,
      date: "Inicio",
      balance: money(startingBalance).toNumber(),
      dailyReturn: null,
    },
    ...history.map((point) => ({
      day: point.dayNumber,
      date: formatShortDate(point.tradingDate),
      balance: money(point.balance).toNumber(),
      dailyReturn: point.dailyReturn ? money(point.dailyReturn).toNumber() : null,
    })),
  ];

  if (data.length === 1) {
    return (
      <div className="rounded-3xl border border-dashed border-border p-6 text-center text-sm text-muted">
        Tu recorrido empieza aquí. Registra el balance de cierre de hoy.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fill: "var(--muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            tick={{ fill: "var(--muted)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={56}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const point = payload[0].payload as Point;
              return (
                <div className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
                  <p>Día {point.day}</p>
                  <p>{point.date}</p>
                  <p className="font-semibold">{formatMoney(point.balance)}</p>
                  {point.dailyReturn !== null ? (
                    <p>{formatPercent(point.dailyReturn)}</p>
                  ) : null}
                </div>
              );
            }}
          />
          <Line type="monotone" dataKey="balance" stroke="var(--accent)" strokeWidth={2.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
