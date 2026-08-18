"use client";

import { useActionState } from "react";
import { loginWithEmail, type ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const initial: ActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(loginWithEmail, initial);

  return (
    <form action={action} className="space-y-4">
      <Input name="email" type="email" label="Correo" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        required
      />
      {state.error ? <p className="text-sm text-negative">{state.error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
