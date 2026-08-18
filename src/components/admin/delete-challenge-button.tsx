"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteChallenge } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";

export function DeleteChallengeButton({
  challengeId,
  challengeName,
  participantCount,
}: {
  challengeId: string;
  challengeName: string;
  participantCount: number;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <>
      <Card className="space-y-3 border-negative/40 p-5">
        <h2 className="text-xl font-semibold">Eliminar reto</h2>
        <p className="text-sm text-muted">
          Esta acción no se puede deshacer. Se cancelará la inscripción de todas las personas y se borrarán sus resultados de este reto. Sus cuentas seguirán existiendo.
        </p>
        <Button type="button" variant="danger" onClick={() => setOpen(true)}>
          Eliminar reto
        </Button>
      </Card>
      <Modal open={open} title="¿Eliminar el reto?" onClose={() => setOpen(false)}>
        <div className="space-y-3 text-sm text-muted">
          <p className="text-foreground font-semibold">{challengeName}</p>
          <p>
            {participantCount === 1
              ? "1 persona inscrita saldrá del reto."
              : `${participantCount} personas inscritas saldrán del reto.`}
          </p>
          <p>También se eliminarán los balances diarios asociados.</p>
          {error ? <p className="text-negative">{error}</p> : null}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                setError(null);
                const result = await deleteChallenge(challengeId);
                if (result.error) {
                  setError(result.error);
                  setPending(false);
                  return;
                }
                router.push("/admin");
                router.refresh();
              }}
            >
              {pending ? "Eliminando..." : "Confirmar eliminación"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
