"use client";

import { openRegistration } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function OpenRegistrationButton({ challengeId }: { challengeId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          const result = await openRegistration(challengeId);
          if (result.error) setError(result.error);
          setPending(false);
        }}
      >
        {pending ? "Abriendo..." : "Abrir inscripción"}
      </Button>
      {error ? <p className="text-sm text-negative">{error}</p> : null}
    </div>
  );
}
