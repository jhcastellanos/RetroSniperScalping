"use client";

import { useActionState } from "react";
import { registerWithEmail, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: ActionState = {};

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerWithEmail, initial);

  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input name="firstName" label="Nombre" autoComplete="given-name" required />
        <Input name="lastName" label="Apellido" autoComplete="family-name" required />
      </div>
      <Input name="email" type="email" label="Correo" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="new-password"
        required
      />
      <Input
        name="confirmPassword"
        type="password"
        label="Confirmar contraseña"
        autoComplete="new-password"
        required
      />
      {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Creando cuenta..." : "Crear cuenta"}
      </Button>
    </form>
  );
}
