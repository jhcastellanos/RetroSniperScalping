import { notFound } from "next/navigation";
import { ChallengeStatus } from "@prisma/client";
import { requireAdminPage } from "@/lib/session";
import { getChallengeWithParticipants } from "@/lib/queries";
import { buildChallengeProgress, getLeaderboard } from "@/lib/challenge";
import { money, formatMoney } from "@/lib/money";
import { dateToYmd, todayInNewYork } from "@/lib/dates";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { StartChallengeButton } from "@/components/admin/start-challenge-button";
import { CloseDayButton } from "@/components/admin/close-day-button";
import { OpenRegistrationButton } from "@/components/admin/open-registration-button";
import { EditChallengeForm } from "@/components/admin/edit-challenge-form";
import { DeleteChallengeButton } from "@/components/admin/delete-challenge-button";
import { ParticipantList } from "@/components/admin/participant-list";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const statusLabel: Record<ChallengeStatus, string> = {
  DRAFT: "BORRADOR",
  REGISTRATION: "INSCRIPCIÓN ABIERTA",
  ACTIVE: "ACTIVO",
  COMPLETED: "COMPLETADO",
  ARCHIVED: "ARCHIVADO",
};

export default async function ChallengeAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminPage();
  const { id } = await params;
  const challenge = await getChallengeWithParticipants(id);
  if (!challenge) notFound();

  const progress = buildChallengeProgress(challenge);
  const completedCount = challenge.participants.filter((item) => item.completedAt).length;
  const average = challenge.participants.length
    ? challenge.participants.reduce((sum, item) => sum.add(item.currentBalance ?? challenge.startingBalance), money(0))
        .div(challenge.participants.length)
    : money(0);
  const rows = challenge.status === ChallengeStatus.ACTIVE || challenge.status === ChallengeStatus.COMPLETED
    ? await getLeaderboard(challenge.id)
    : [];
  const resultCount = await prisma.dailyBalance.count({ where: { challengeId: challenge.id } });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Reto</p>
        <h1 className="mt-2 text-3xl font-semibold">{challenge.name}</h1>
        <div className="mt-2">
          <StatusBadge tone={challenge.status === "REGISTRATION" ? "warning" : "positive"}>
            {statusLabel[challenge.status]}
          </StatusBadge>
        </div>
      </div>

      <Card className="grid grid-cols-2 gap-3 p-4">
        <Stat label="Balance inicial" value={formatMoney(challenge.startingBalance)} />
        <Stat label="Objetivo" value={formatMoney(challenge.targetBalance)} />
        <Stat label="Días de trading" value={String(challenge.totalTradingDays)} />
        <Stat label="Participantes" value={String(challenge.participants.length)} />
        <Stat
          label="Fecha estimada"
          value={challenge.plannedStartDate ? dateToYmd(challenge.plannedStartDate) : "Sin fecha"}
        />
        {challenge.status === ChallengeStatus.REGISTRATION ? (
          <p className="col-span-2 text-sm text-muted">
            La inscripción está abierta. El reto no comienza solo, aunque la fecha estimada ya haya pasado. Tú lo inicias con el botón de abajo.
          </p>
        ) : null}
        {challenge.status === ChallengeStatus.ACTIVE ? (
          <>
            <Stat label="Día actual" value={String(progress.tradingDayNumber)} />
            <Stat label="Días restantes" value={String(progress.tradingDaysRemaining)} />
            <Stat
              label="Fecha oficial"
              value={progress.officialDate ?? "—"}
            />
            <Stat label="Completaron" value={String(completedCount)} />
            <Stat label="Balance promedio" value={formatMoney(average)} />
            <p className="col-span-2 text-sm text-muted">
              El día solo cambia cuando tú lo cierras. Un sábado o feriado no cierra el día.
            </p>
          </>
        ) : null}
      </Card>

      {challenge.status === ChallengeStatus.DRAFT ? (
        <OpenRegistrationButton challengeId={challenge.id} />
      ) : null}

      {challenge.status === ChallengeStatus.REGISTRATION ? (
        <StartChallengeButton
          challengeId={challenge.id}
          participantCount={challenge.participants.length}
          startingBalance={challenge.startingBalance.toString()}
          targetBalance={challenge.targetBalance.toString()}
          totalTradingDays={challenge.totalTradingDays}
          today={todayInNewYork()}
          plannedStartDate={challenge.plannedStartDate ? dateToYmd(challenge.plannedStartDate) : null}
        />
      ) : null}

      {challenge.status === ChallengeStatus.ACTIVE && progress.officialDate ? (
        <CloseDayButton
          challengeId={challenge.id}
          currentDayNumber={progress.tradingDayNumber}
          officialDate={progress.officialDate}
          officialDateIsTradingDay={progress.officialDateIsTradingDay}
          tradingDayEnded={progress.tradingDayEnded}
          totalTradingDays={challenge.totalTradingDays}
        />
      ) : null}

      <EditChallengeForm
        challengeId={challenge.id}
        name={challenge.name}
        startingBalance={challenge.startingBalance.toFixed(2)}
        targetBalance={challenge.targetBalance.toFixed(2)}
        totalTradingDays={challenge.totalTradingDays}
        plannedStartDate={challenge.plannedStartDate ? dateToYmd(challenge.plannedStartDate) : ""}
        isActive={challenge.status === ChallengeStatus.ACTIVE || challenge.status === ChallengeStatus.COMPLETED}
      />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Participantes inscritos</h2>
        {challenge.participants.length === 0 ? (
          <p className="text-sm text-muted">Todavía no hay participantes.</p>
        ) : (
          <ParticipantList
            participants={challenge.participants}
            challengeActive={challenge.status === ChallengeStatus.ACTIVE}
          />
        )}
      </section>

      {challenge.status === ChallengeStatus.ACTIVE || challenge.status === ChallengeStatus.COMPLETED ? (
        <Leaderboard
          rows={rows}
          started
          participantCount={challenge.participants.length}
          hasResults={resultCount > 0}
        />
      ) : null}

      <DeleteChallengeButton
        challengeId={challenge.id}
        challengeName={challenge.name}
        participantCount={challenge.participants.length}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
