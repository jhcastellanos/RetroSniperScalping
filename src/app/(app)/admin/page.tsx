import Link from "next/link";
import { ChallengeStatus } from "@prisma/client";
import { requireAdminPage } from "@/lib/session";
import { getAdminChallenges } from "@/lib/queries";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";

export const dynamic = "force-dynamic";

const statusLabel: Record<ChallengeStatus, string> = {
  DRAFT: "BORRADOR",
  REGISTRATION: "INSCRIPCIÓN ABIERTA",
  ACTIVE: "ACTIVO",
  COMPLETED: "COMPLETADO",
  ARCHIVED: "ARCHIVADO",
};

export default async function AdminPage() {
  await requireAdminPage();
  const challenges = await getAdminChallenges();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-semibold">Admin</h1>
        <Link href="/admin/retos/nuevo" className="text-sm font-semibold text-accent">
          Nuevo reto
        </Link>
      </div>

      {challenges.length === 0 ? (
        <Card className="space-y-4 p-5">
          <p className="text-sm text-muted">Todavía no hay retos. Crea el primero para abrir inscripciones.</p>
          <Link href="/admin/retos/nuevo">
            <Button type="button">Crear reto</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {challenges.map((challenge) => (
            <Link key={challenge.id} href={`/admin/retos/${challenge.id}`}>
              <Card className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{challenge.name}</h2>
                  <StatusBadge tone={challenge.status === "REGISTRATION" ? "warning" : challenge.status === "ACTIVE" ? "positive" : "neutral"}>
                    {statusLabel[challenge.status]}
                  </StatusBadge>
                </div>
                <p className="text-sm text-muted">
                  {formatMoney(challenge.startingBalance)} → {formatMoney(challenge.targetBalance)}
                </p>
                <p className="text-sm text-muted">
                  {challenge.totalTradingDays} días · {challenge._count.participants} participantes
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
