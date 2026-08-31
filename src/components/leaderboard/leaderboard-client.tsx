"use client";

import { useMemo, useState } from "react";
import { ParticipantStatus } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { clampPercent, formatMoney, formatPercent } from "@/lib/money";
import { displayName } from "@/lib/profile-image";

const PAGE_SIZE = 10;

export type SerializableLeaderboardRow = {
  position: number;
  participantId: string;
  userId: string;
  firstName: string;
  lastName: string;
  profileImage: string | null;
  googleImage: string | null;
  image: string | null;
  currentBalance: string;
  totalReturn: string;
  goalProgress: string;
  status: ParticipantStatus;
  isYou: boolean;
};

function medal(position: number) {
  if (position === 1) return "🥇";
  if (position === 2) return "🥈";
  if (position === 3) return "🥉";
  return `#${position}`;
}

export function LeaderboardClient({
  rows,
  started,
  participantCount,
  hasResults = true,
}: {
  rows: SerializableLeaderboardRow[];
  started: boolean;
  participantCount: number;
  hasResults?: boolean;
}) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);

  const pageRows = useMemo(
    () => rows.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE),
    [rows, currentPage],
  );

  const from = rows.length === 0 ? 0 : currentPage * PAGE_SIZE + 1;
  const to = Math.min(rows.length, (currentPage + 1) * PAGE_SIZE);
  const me = rows.find((row) => row.isYou);
  const meOnThisPage = pageRows.some((row) => row.isYou);

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

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-semibold">Ranking</h2>
        <p className="text-xs text-muted">{participantCount} participantes</p>
      </div>
      {totalPages > 1 ? (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setPage((value) => Math.max(0, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
        />
      ) : null}
      <div className="space-y-2">
        {pageRows.map((row) => (
          <LeaderboardCard key={row.participantId} row={row} />
        ))}
      </div>
      {rows.length > 0 ? (
        <p className="text-center text-xs text-muted">
          Mostrando {from}–{to} de {rows.length}
        </p>
      ) : null}
      {totalPages > 1 ? (
        <PaginationBar
          currentPage={currentPage}
          totalPages={totalPages}
          onPrev={() => setPage((value) => Math.max(0, value - 1))}
          onNext={() => setPage((value) => Math.min(totalPages - 1, value + 1))}
        />
      ) : null}
      {me && !meOnThisPage ? (
        <div className="pt-2">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">Tu posición</p>
          <LeaderboardCard row={me} />
        </div>
      ) : null}
    </div>
  );
}

function PaginationBar({
  currentPage,
  totalPages,
  onPrev,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage === 0}
        onClick={onPrev}
      >
        Anterior
      </button>
      <p className="text-sm text-muted">
        {currentPage + 1} / {totalPages}
      </p>
      <button
        type="button"
        className="inline-flex min-h-11 min-w-24 items-center justify-center rounded-2xl border border-border px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        disabled={currentPage >= totalPages - 1}
        onClick={onNext}
      >
        Siguiente
      </button>
    </div>
  );
}

function LeaderboardCard({ row }: { row: SerializableLeaderboardRow }) {
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
