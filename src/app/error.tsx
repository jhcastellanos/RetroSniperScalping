"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 text-center">
      <h1 className="text-2xl font-semibold">No se pudo cargar la página</h1>
      <p className="mt-2 text-sm text-muted">
        Recarga e inténtalo de nuevo. Si el problema continúa, cierra la app del teléfono y vuelve a abrirla.
      </p>
      <div className="mt-6">
        <Button type="button" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    </div>
  );
}
