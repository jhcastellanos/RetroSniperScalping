import { ymdToUtcDate, type Ymd } from "@/lib/dates";
import { Card } from "@/components/ui/card";

function formatBannerDate(ymd: Ymd) {
  const formatted = new Intl.DateTimeFormat("es-MX", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(ymdToUtcDate(ymd));
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function DayBanner({
  dayNumber,
  totalDays,
  remaining,
  officialDate,
}: {
  dayNumber: number;
  totalDays: number;
  remaining: number;
  officialDate?: string | null;
}) {
  const remainingLabel =
    remaining === 0
      ? "Último día de trading"
      : remaining === 1
        ? "Queda 1 día de trading"
        : `Quedan ${remaining} días de trading`;

  return (
    <Card className="overflow-hidden p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">Hoy estamos en</p>
      <p className="font-display mt-3 text-7xl font-semibold leading-none text-accent">
        {dayNumber}
      </p>
      <p className="mt-4 text-xl font-semibold">Día {dayNumber} de {totalDays}</p>
      {officialDate ? (
        <p className="mt-1 text-sm text-muted">{formatBannerDate(officialDate)}</p>
      ) : null}
      <p className="mt-3 text-sm text-muted">{remainingLabel}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-foreground/8">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${Math.min(100, (dayNumber / totalDays) * 100)}%` }}
        />
      </div>
    </Card>
  );
}
