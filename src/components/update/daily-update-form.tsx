"use client";

import { useActionState } from "react";
import { saveDailyBalance, type SaveBalanceResult } from "@/actions/balance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { formatMoney, formatPercent, formatSignedMoney, money } from "@/lib/money";

const initial: SaveBalanceResult = {};

export function DailyUpdateForm({
  challengeId,
  canSubmit,
  marketClosed,
  alreadyUpdated,
  locked,
}: {
  challengeId: string;
  canSubmit: boolean;
  marketClosed: boolean;
  alreadyUpdated: boolean;
  locked: boolean;
}) {
  const [state, action, pending] = useActionState(saveDailyBalance, initial);

  if (locked) {
    return (
      <Card className="p-5 text-center">
        <p className="text-lg font-semibold">🔒 Disponible cuando el reto comience</p>
        <p className="mt-2 text-sm text-muted">
          El registro de balances se habilita el día en que el administrador inicie el reto.
        </p>
      </Card>
    );
  }

  if (marketClosed) {
    return (
      <Card className="p-5 text-center">
        <p className="text-lg font-semibold">Mercado cerrado</p>
        <p className="mt-2 text-sm text-muted">Hoy no es un día de trading.</p>
      </Card>
    );
  }

  if (!canSubmit) {
    return (
      <Card className="p-5 text-center text-sm text-muted">
        El reto ya no acepta nuevos resultados.
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <form action={action} className="space-y-4">
        <input type="hidden" name="challengeId" value={challengeId} />
        <Input
          name="balance"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          label="Balance de cierre de hoy"
          placeholder="127.32"
          required
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : alreadyUpdated ? "Actualizar resultado" : "Guardar resultado"}
        </Button>
      </form>
      {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
      {state.success ? <SaveFeedback state={state} /> : null}
    </div>
  );
}

function SaveFeedback({ state }: { state: SaveBalanceResult }) {
  const change = money(state.change ?? 0);
  const positive = change.isPositive();
  const negative = change.isNegative();
  const tone = positive ? "text-positive" : negative ? "text-negative" : "text-foreground";
  const rankChange =
    state.previousRank && state.newRank ? state.previousRank - state.newRank : 0;

  return (
    <Card className="space-y-2 p-5 text-center">
      <p className={`text-3xl font-semibold ${tone}`}>{formatSignedMoney(change)} hoy</p>
      <p className={`text-lg ${tone}`}>{formatPercent(state.dailyReturn ?? 0)}</p>
      <p className="text-sm text-muted">Nuevo balance: {formatMoney(state.newBalance ?? 0)}</p>
      {state.previousRank && state.newRank ? (
        <p className="text-sm text-muted">
          Ranking: #{state.previousRank} → #{state.newRank}
          {rankChange > 0 ? ` · ▲ ${rankChange}` : rankChange < 0 ? ` · ▼ ${Math.abs(rankChange)}` : ""}
        </p>
      ) : null}
    </Card>
  );
}
