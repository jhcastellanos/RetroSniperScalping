import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleAuthConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Entra para ver tu ranking, registrar tu balance y seguir el reto."
    >
      {isGoogleAuthConfigured() ? (
        <>
          <GoogleButton />
          <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wider text-muted">
            <span className="h-px flex-1 bg-border" />
            o con correo
            <span className="h-px flex-1 bg-border" />
          </div>
        </>
      ) : null}
      <LoginForm />
      <AuthSwitch
        question="¿No tienes una cuenta?"
        href="/crear-cuenta"
        label="Crear cuenta"
      />
    </AuthShell>
  );
}
