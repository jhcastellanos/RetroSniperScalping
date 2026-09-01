"use client";

import { useState } from "react";
import { closeChallengeDay } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatLongDate } from "@/lib/dates";

export function CloseDayButton({
  challengeId,
  currentDayNumber,
  officialDate,
  officialDateIsTradingDay,
  tradingDayEnded,
  totalTradingDays,
}: {
  challengeId: string;
  currentDayNumber: number;
  officialDate: string;
  officialDateIsTradingDay: boolean;
  tradingDayEnded: boolean;
  totalTradingDays: number;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isLastDay = currentDayNumber >= totalTradingDays;

  return (
    <>
      {tradingDayEnded ? (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-sm">
          Ya pasó la medianoche de Nueva York para el día {currentDayNumber} ({formatLongDate(officialDate)}). El siguiente día hábil aún no llega; el contador avanzará solo cuando ese día comience. También puedes cerrarlo ahora.
        </p>
      ) : officialDateIsTradingDay ? (
        <p className="text-sm text-muted">
          El día {currentDayNumber} está abierto. Al pasar la medianoche en Nueva York avanzará solo al siguiente día hábil. También puedes cerrarlo ahora si quieres adelantarlo.
        </p>
      ) : (
        <p className="text-sm text-muted">
          El día {currentDayNumber} no es hábil de la bolsa (fin de semana o feriado). Sigue abierto hasta el próximo día hábil, o ciérralo ahora para adelantar el contador.
        </p>
      )}
      <Button type="button" variant={tradingDayEnded ? "primary" : "secondary"} onClick={() => setOpen(true)}>
        {isLastDay ? `Cerrar día ${currentDayNumber} y terminar el reto` : `Cerrar día ${currentDayNumber}`}
      </Button>
      <Modal open={open} title={isLastDay ? "¿Cerrar el último día?" : "¿Cerrar este día?"} onClose={() => setOpen(false)}>
        <div className="space-y-3 text-sm text-muted">
          <p>
            Día oficial: {currentDayNumber} · {formatLongDate(officialDate)}
          </p>
          {isLastDay ? (
            <p className="font-semibold text-heading">Al confirmar, el reto queda completado.</p>
          ) : (
            <p className="font-semibold text-heading">
              El contador pasará al día {currentDayNumber + 1}. La siguiente fecha oficial será el próximo día hábil de NYSE.
            </p>
          )}
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
                const result = await closeChallengeDay(challengeId);
                if (result.error) setError(result.error);
                else setOpen(false);
                setPending(false);
              }}
            >
              {pending ? "Cerrando..." : "Confirmar cierre"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
