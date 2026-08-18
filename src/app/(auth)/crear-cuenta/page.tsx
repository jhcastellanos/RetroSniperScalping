import { AuthShell, AuthSwitch } from "@/components/auth/auth-shell";
import { GoogleButton } from "@/components/auth/google-button";
import { RegisterForm } from "@/components/auth/register-form";
import { isGoogleAuthConfigured } from "@/lib/env";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para unirte al reto. El administrador lo iniciará cuando todos estén listos."
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
      <RegisterForm />
      <AuthSwitch
        question="¿Ya tienes una cuenta?"
        href="/iniciar-sesion"
        label="Iniciar sesión"
      />
    </AuthShell>
  );
}
