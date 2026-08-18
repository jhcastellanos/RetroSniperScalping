"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createChallenge } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChallengeForm() {
  const router = useRouter();
  const [state, action, pending] = useActionState(createChallenge, {} as { error?: string; success?: boolean; id?: string });

  useEffect(() => {
    if (state.id) router.push(`/admin/retos/${state.id}`);
  }, [state.id, router]);

  return (
    <form action={action} className="space-y-4">
      <Input name="name" label="Nombre del reto" placeholder="$100 Scalping Challenge" required />
      <Input name="startingBalance" type="number" step="0.01" min="0" label="Balance inicial" placeholder="100" required />
      <Input name="targetBalance" type="number" step="0.01" min="0" label="Balance objetivo" placeholder="10000" required />
      <Input name="totalTradingDays" type="number" min="1" label="Días de trading" placeholder="120" required />
      <Input name="plannedStartDate" type="date" label="Fecha estimada (opcional)" />
      <p className="text-xs text-muted">
        Esta fecha es solo una referencia. Las personas podrán inscribirse de inmediato y tú decides cuándo iniciar el reto, aunque esa fecha ya haya pasado.
      </p>
      {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando..." : "Crear reto y abrir inscripción"}
      </Button>
    </form>
  );
}
