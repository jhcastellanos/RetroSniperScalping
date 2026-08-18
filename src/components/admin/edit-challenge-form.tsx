"use client";

import { useActionState } from "react";
import { updateChallenge } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

type Props = {
  challengeId: string;
  name: string;
  startingBalance: string;
  targetBalance: string;
  totalTradingDays: number;
  plannedStartDate: string;
  isActive: boolean;
};

export function EditChallengeForm({
  challengeId,
  name,
  startingBalance,
  targetBalance,
  totalTradingDays,
  plannedStartDate,
  isActive,
}: Props) {
  const [state, action, pending] = useActionState(updateChallenge, {} as { error?: string; success?: boolean; id?: string });

  return (
    <Card className="space-y-4 p-5">
      <div>
        <h2 className="text-xl font-semibold">Editar reto</h2>
        <p className="mt-1 text-sm text-muted">
          Los cambios aplican a todos los participantes. Las cuentas de usuario no se modifican.
        </p>
      </div>
      {isActive ? (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 p-3 text-sm">
          Este reto ya está activo. Cambiar el balance inicial, el objetivo o los días puede alterar estadísticas e historial.
        </p>
      ) : null}
      <form action={action} className="space-y-4">
        <input type="hidden" name="challengeId" value={challengeId} />
        <Input name="name" label="Nombre del reto" defaultValue={name} required />
        <Input
          name="startingBalance"
          type="number"
          step="0.01"
          min="0"
          label="Balance inicial"
          defaultValue={startingBalance}
          required
        />
        <Input
          name="targetBalance"
          type="number"
          step="0.01"
          min="0"
          label="Balance objetivo"
          defaultValue={targetBalance}
          required
        />
        <Input
          name="totalTradingDays"
          type="number"
          min="1"
          label="Días de trading"
          defaultValue={totalTradingDays}
          required
        />
        <Input
          name="plannedStartDate"
          type="date"
          label="Fecha estimada (opcional)"
          defaultValue={plannedStartDate}
        />
        {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
        {state.success ? <p className="text-sm text-positive">Cambios guardados.</p> : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar cambios"}
        </Button>
      </form>
    </Card>
  );
}
