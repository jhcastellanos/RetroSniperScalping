import { ChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCurrentParticipation, getJoinableChallenges } from "@/lib/queries";
import { buildChallengeProgress, getLeaderboard } from "@/lib/challenge";
import { formatMoney } from "@/lib/money";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { JoinableChallengeCard, WaitingScreen } from "@/components/challenge/waiting-screen";
import { Card } from "@/components/ui/card";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isDatabaseConfigured()) {
    return (
      <Card className="p-5">
        <h1 className="text-2xl font-semibold">Configura Neon para continuar</h1>
        <p className="mt-2 text-sm text-muted">
          Falta `DATABASE_URL`. Sigue las instrucciones del README para crear el proyecto en Neon y volver a cargar la app.
        </p>
      </Card>
    );
  }

  const user = await requireUser();
  const participation = await getCurrentParticipation(user.id);

  if (!participation) {
    const joinable = await getJoinableChallenges(user.id);
    if (joinable.length === 0) {
      return (
        <Card className="p-5">
          <h1 className="text-2xl font-semibold">Aún no hay un reto abierto</h1>
          <p className="mt-2 text-sm text-muted">
            Cuando el administrador abra la inscripción, podrás unirte desde aquí.
          </p>
        </Card>
      );
    }

    const counts = await Promise.all(
      joinable.map((challenge) =>
        prisma.challengeParticipant.count({
          where: { challengeId: challenge.id, status: { in: ["ACTIVE", "COMPLETED"] } },
        }),
      ),
    );

    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Únete al reto</h1>
        {joinable.map((challenge, index) => (
          <JoinableChallengeCard
            key={challenge.id}
            challenge={challenge}
            participantCount={counts[index]}
          />
        ))}
      </div>
    );
  }

  const { challenge } = participation;
  const participantCount = await prisma.challengeParticipant.count({
    where: { challengeId: challenge.id, status: { in: ["ACTIVE", "COMPLETED"] } },
  });

  if (challenge.status === ChallengeStatus.REGISTRATION) {
    return <WaitingScreen challenge={challenge} participantCount={participantCount} />;
  }

  const progress = buildChallengeProgress(challenge);
  const rows = await getLeaderboard(challenge.id, user.id);
  const started = challenge.status === ChallengeStatus.ACTIVE || challenge.status === ChallengeStatus.COMPLETED || challenge.status === ChallengeStatus.ARCHIVED;
  const resultCount = await prisma.dailyBalance.count({ where: { challengeId: challenge.id } });

  return (
    <div className="space-y-5">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {challenge.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">
          Día {progress.tradingDayNumber} / {challenge.totalTradingDays}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {progress.tradingDaysRemaining} días de trading restantes
        </p>
        <p className="mt-3 text-sm text-muted">
          Inicial {formatMoney(challenge.startingBalance)} · Objetivo {formatMoney(challenge.targetBalance)}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/8">
          <div
            className="h-full rounded-full bg-accent"
            style={{
              width: `${Math.min(100, (progress.tradingDaysElapsed / challenge.totalTradingDays) * 100)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {progress.tradingDaysElapsed} / {challenge.totalTradingDays} días de trading
        </p>
      </header>
      <Leaderboard
        rows={rows}
        started={started}
        participantCount={participantCount}
        hasResults={resultCount > 0}
      />
    </div>
  );
}
