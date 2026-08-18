import type { DailyPoint } from "@/lib/challenge";
import { formatMoney, formatPercent } from "@/lib/money";
import { formatShortDate } from "@/lib/dates";

export function DailyPerformance({ history }: { history: DailyPoint[] }) {
  const rows = [...history].reverse();

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted">Todavía no hay resultados diarios.</p>
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border">
      <div className="grid grid-cols-4 bg-foreground/5 px-4 py-2 text-xs uppercase tracking-wider text-muted">
        <span>Día</span>
        <span>Fecha</span>
        <span className="text-right">Balance</span>
        <span className="text-right">Retorno</span>
      </div>
      {rows.map((row) => {
        const tone =
          row.kind === "positive"
            ? "text-positive"
            : row.kind === "negative"
              ? "text-negative"
              : "text-foreground";
        return (
          <div key={row.tradingDate} className="grid grid-cols-4 border-t border-border px-4 py-3 text-sm">
            <span>{row.dayNumber}</span>
            <span className="text-muted">{formatShortDate(row.tradingDate)}</span>
            <span className="text-right">{formatMoney(row.balance)}</span>
            <span className={`text-right ${tone}`}>
              {row.dailyReturn ? formatPercent(row.dailyReturn) : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
