"use client";

import { useState } from "react";
import { joinChallenge } from "@/actions/participation";
import { Button } from "@/components/ui/button";

export function JoinChallengeButton({ challengeId }: { challengeId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await joinChallenge(challengeId);
          if (result.error) setError(result.error);
          setPending(false);
        }}
      >
        {pending ? "Inscribiendo..." : "Unirme al reto"}
      </Button>
      {error ? <p className="text-sm text-negative">{error}</p> : null}
    </div>
  );
}
