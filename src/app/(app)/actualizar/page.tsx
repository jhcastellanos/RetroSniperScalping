import { ChallengeStatus } from "@prisma/client";
import { requireUser } from "@/lib/session";
import { getCurrentParticipation } from "@/lib/queries";
import { buildChallengeProgress } from "@/lib/challenge";
import { prisma } from "@/lib/prisma";
import { formatLongDate, ymdToUtcDate } from "@/lib/dates";
import { DailyUpdateForm } from "@/components/update/daily-update-form";
import { LockedState } from "@/components/challenge/waiting-screen";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function UpdatePage() {
  const user = await requireUser();
  const participation = await getCurrentParticipation(user.id);

  if (!participation) {
    return (
      <Card className="p-5">
        <h1 className="text-2xl font-semibold">Actualización diaria</h1>
        <p className="mt-2 text-sm text-muted">Primero únete a un reto desde Ranking.</p>
      </Card>
    );
  }

  const { challenge } = participation;
  const locked = challenge.status !== ChallengeStatus.ACTIVE;
  const progress = buildChallengeProgress(challenge);
  const officialDate = progress.officialDate;

  const existing = challenge.status === ChallengeStatus.ACTIVE && officialDate
    ? await prisma.dailyBalance.findUnique({
        where: {
          participantId_challengeId_tradingDate: {
            participantId: participation.id,
            challengeId: challenge.id,
            tradingDate: ymdToUtcDate(officialDate),
          },
        },
      })
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Actualización diaria</h1>
          <p className="mt-1 text-sm text-muted">
            Introduce el balance de cierre del día {progress.tradingDayNumber}
            {officialDate ? ` (${formatLongDate(officialDate)})` : ""}. La fecha oficial la controla el administrador.
          </p>
        </div>
        {challenge.status === ChallengeStatus.ACTIVE ? (
          existing ? <StatusBadge tone="positive">Actualizado</StatusBadge> : (
            progress.canSubmitToday ? <StatusBadge tone="warning">Pendiente</StatusBadge> : null
          )
        ) : null}
      </div>
      {locked ? <LockedState /> : (
        <DailyUpdateForm
          challengeId={challenge.id}
          canSubmit={progress.canSubmitToday}
          alreadyUpdated={Boolean(existing)}
          locked={false}
          dayNumber={progress.tradingDayNumber}
        />
      )}
    </div>
  );
}
