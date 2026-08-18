"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessages } from "@/lib/errors";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError(ErrorMessages.invalidCredentials);
        setPending(false);
        return;
      }

      window.location.replace(`${window.location.origin}/`);
    } catch {
      setError("No se pudo iniciar sesión. Recarga la página e inténtalo de nuevo.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" label="Correo" autoComplete="email" required />
      <Input
        name="password"
        type="password"
        label="Contraseña"
        autoComplete="current-password"
        required
      />
      {error ? <p className="text-sm text-negative">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Entrando..." : "Iniciar sesión"}
      </Button>
    </form>
  );
}
