import { ParticipantStatus } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { LeaderboardRow } from "@/lib/challenge";
import { clampPercent, formatMoney, formatPercent } from "@/lib/money";
import { displayName } from "@/lib/profile-image";

function medal(position: number) {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return `#${position}`;
}

export function Leaderboard({
  rows,
  started,
  participantCount,
  hasResults = true,
}: {
  rows: LeaderboardRow[];
  started: boolean;
  participantCount: number;
  hasResults?: boolean;
}) {
  if (!started) {
    return (
      <Card className="space-y-2 p-5 text-center">
        <p className="text-lg font-semibold">{participantCount} participantes inscritos</p>
        <p className="text-sm text-muted">
          El ranking estará disponible cuando el reto comience.
        </p>
      </Card>
    );
  }

  if (!hasResults) {
    return (
      <Card className="p-5 text-center text-sm text-muted">
        Todavía no se han enviado resultados.
      </Card>
    );
  }

  const top10 = rows.slice(0, 10);
  const me = rows.find((row) => row.isYou);
  const showMeOutside = Boolean(me && me.position > 10);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Top 10</h2>
        <p className="text-xs text-muted">{participantCount} participantes</p>
      </div>
      <div className="space-y-2">
        {top10.map((row) => (
          <LeaderboardCard key={row.participantId} row={row} />
        ))}
      </div>
      {showMeOutside && me ? (
        <div className="pt-2">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">Tu posición</p>
          <LeaderboardCard row={me} />
        </div>
      ) : null}
    </div>
  );
}

function LeaderboardCard({ row }: { row: LeaderboardRow }) {
  const progress = clampPercent(row.goalProgress);

  return (
    <article
      className={`rounded-3xl border p-3 ${
        row.isYou ? "border-accent/40 bg-accent/10" : "border-border bg-card"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="w-8 text-center text-sm font-semibold">{medal(row.position)}</span>
        <Avatar user={row} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold">{displayName(row)}</p>
            {row.isYou ? <StatusBadge tone="positive">TÚ</StatusBadge> : null}
            {row.status === ParticipantStatus.COMPLETED ? (
              <StatusBadge tone="positive">COMPLETADO</StatusBadge>
            ) : null}
          </div>
          <p className="text-sm text-muted">{formatPercent(row.totalReturn)}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{formatMoney(row.currentBalance)}</p>
          <p className="text-xs text-muted">{Math.round(progress)}% meta</p>
        </div>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-foreground/8">
        <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
    </article>
  );
}
