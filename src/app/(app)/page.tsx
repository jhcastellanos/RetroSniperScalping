import { ChallengeStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getCurrentParticipation, getJoinableChallenges } from "@/lib/queries";
import { buildChallengeProgress, getLeaderboard } from "@/lib/challenge";
import { formatMoney } from "@/lib/money";
import { Leaderboard } from "@/components/leaderboard/leaderboard";
import { JoinableChallengeCard, WaitingScreen } from "@/components/challenge/waiting-screen";
import { DayBanner } from "@/components/challenge/day-banner";
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
            Cuando el administrador tenga un reto en inscripción o en curso, podrás unirte desde aquí.
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

    const extras = await Promise.all(
      joinable.map(async (challenge) => {
        if (challenge.status !== ChallengeStatus.ACTIVE) {
          return { rows: [], resultCount: 0, progress: null };
        }

        const [rows, resultCount] = await Promise.all([
          getLeaderboard(challenge.id, user.id),
          prisma.dailyBalance.count({ where: { challengeId: challenge.id } }),
        ]);

        return {
          rows,
          resultCount,
          progress: buildChallengeProgress(challenge),
        };
      }),
    );

    return (
      <div className="space-y-8">
        {joinable.map((challenge, index) => {
          const extra = extras[index];

          return (
            <div key={challenge.id} className="space-y-5">
              {extra.progress ? (
                <DayBanner
                  dayNumber={extra.progress.tradingDayNumber}
                  totalDays={challenge.totalTradingDays}
                  remaining={extra.progress.tradingDaysRemaining}
                  officialDate={extra.progress.officialDate}
                />
              ) : (
                <h1 className="text-3xl font-semibold">Únete al reto</h1>
              )}
              <JoinableChallengeCard
                challenge={challenge}
                participantCount={counts[index]}
              />
              {challenge.status === ChallengeStatus.ACTIVE ? (
                <Leaderboard
                  rows={extra.rows}
                  started
                  participantCount={counts[index]}
                  hasResults={extra.resultCount > 0}
                />
              ) : null}
            </div>
          );
        })}
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
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
        {challenge.name}
      </p>
      <DayBanner
        dayNumber={progress.tradingDayNumber}
        totalDays={challenge.totalTradingDays}
        remaining={progress.tradingDaysRemaining}
        officialDate={progress.officialDate}
      />
      <p className="text-sm text-muted">
        Inicial {formatMoney(challenge.startingBalance)} · Objetivo {formatMoney(challenge.targetBalance)}
      </p>
      <Leaderboard
        rows={rows}
        started={started}
        participantCount={participantCount}
        hasResults={resultCount > 0}
      />
    </div>
  );
}
