"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es">
      <body className="min-h-dvh bg-[#0A0E1A] px-5 py-16 text-center text-[#F1D592]">
        <h1 className="text-2xl font-semibold">Algo salió mal</h1>
        <p className="mt-2 text-sm text-white/70">Recarga la página o vuelve a abrir la app.</p>
        <button
          type="button"
          className="mt-6 min-h-12 rounded-2xl bg-[#D4AF37] px-4 font-semibold text-[#0A0E1A]"
          onClick={reset}
        >
          Reintentar
        </button>
      </body>
    </html>
  );
}
