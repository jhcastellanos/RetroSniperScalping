"use client";

import { useState } from "react";
import { startChallengeToday } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatMoney } from "@/lib/money";
import { formatLongDate } from "@/lib/dates";

export function StartChallengeButton({
  challengeId,
  participantCount,
  startingBalance,
  targetBalance,
  totalTradingDays,
  today,
  plannedStartDate,
}: {
  challengeId: string;
  participantCount: number;
  startingBalance: string;
  targetBalance: string;
  totalTradingDays: number;
  today: string;
  plannedStartDate?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Iniciar reto hoy
      </Button>
      <Modal open={open} title="¿Iniciar el reto?" onClose={() => setOpen(false)}>
        <div className="space-y-3 text-sm text-muted">
          <p>Participantes inscritos: {participantCount}</p>
          <p>Balance inicial: {formatMoney(startingBalance)}</p>
          <p>Objetivo: {formatMoney(targetBalance)}</p>
          <p>Duración: {totalTradingDays} días de trading</p>
          <p>Hoy: {formatLongDate(today)}</p>
          {plannedStartDate ? (
            <p>
              Fecha estimada: {formatLongDate(plannedStartDate)}. Es solo una referencia y no impide iniciar ahora.
            </p>
          ) : null}
          <p>
            Hoy se convertirá en el día 1. Ese día se cierra solo cuando termina la sesión de bolsa en Nueva York. Si inicias en fin de semana, el día 1 sigue abierto hasta que cierre el primer día hábil; el siguiente día hábil será el día 2.
          </p>
          {error ? <p className="text-negative">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                setError(null);
                const result = await startChallengeToday(challengeId);
                if (result.error) setError(result.error);
                else setOpen(false);
                setPending(false);
              }}
            >
              {pending ? "Iniciando..." : "Confirmar inicio"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
