import { ChallengeStatus } from "@prisma/client";
import { requireUser } from "@/lib/session";
import { getCurrentParticipation } from "@/lib/queries";
import { buildChallengeProgress, getLeaderboard, getParticipantHistory } from "@/lib/challenge";
import { countDayKinds, goalProgress, totalReturn } from "@/lib/stats";
import { clampPercent, formatMoney, formatPercent, money } from "@/lib/money";
import { AccountGrowthChart } from "@/components/progress/account-growth-chart";
import { DailyPerformance } from "@/components/progress/daily-performance";
import { LockedState } from "@/components/challenge/waiting-screen";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await requireUser();
  const participation = await getCurrentParticipation(user.id);

  if (!participation) {
    return (
      <Card className="p-5">
        <h1 className="text-2xl font-semibold">Mi progreso</h1>
        <p className="mt-2 text-sm text-muted">Únete a un reto para ver tu evolución.</p>
      </Card>
    );
  }

  const { challenge } = participation;
  if (challenge.status === ChallengeStatus.REGISTRATION || challenge.status === ChallengeStatus.DRAFT) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold">Mi progreso</h1>
        <LockedState message="Las estadísticas se activan cuando el reto comience" />
      </div>
    );
  }

  const history = await getParticipantHistory(participation.id, challenge.id);
  const current = participation.currentBalance ?? money(challenge.startingBalance);
  const rank = (await getLeaderboard(challenge.id, user.id)).find((row) => row.isYou);
  const progress = buildChallengeProgress(challenge);
  const dayKinds = countDayKinds(
    history.map((point, index) => ({
      today: money(point.balance),
      previous: index === 0 ? money(challenge.startingBalance) : money(history[index - 1].balance),
    })),
  );
  const goal = goalProgress(current, challenge.startingBalance, challenge.targetBalance);

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-semibold">Mi progreso</h1>
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Balance inicial" value={formatMoney(challenge.startingBalance)} />
        <Stat label="Balance actual" value={formatMoney(current)} />
        <Stat label="Objetivo" value={formatMoney(challenge.targetBalance)} />
        <Stat label="Retorno total" value={formatPercent(totalReturn(current, challenge.startingBalance))} />
        <Stat label="Ranking" value={rank ? `#${rank.position}` : "—"} />
        <Stat label="Días registrados" value={String(history.length)} />
        <Stat label="Días transcurridos" value={String(progress.tradingDaysElapsed)} />
        <Stat label="Días restantes" value={String(progress.tradingDaysRemaining)} />
        <Stat label="Días positivos" value={String(dayKinds.positiveDays)} />
        <Stat label="Días negativos" value={String(dayKinds.negativeDays)} />
        <Stat label="Días planos" value={String(dayKinds.flatDays)} />
        <Stat label="Progreso a la meta" value={`${Math.round(clampPercent(goal))}%`} />
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/8">
        <div className="h-full rounded-full bg-accent" style={{ width: `${clampPercent(goal)}%` }} />
      </div>
      <Card className="p-4">
        <h2 className="mb-3 text-lg font-semibold">Crecimiento de la cuenta</h2>
        <AccountGrowthChart startingBalance={challenge.startingBalance.toString()} history={history} />
      </Card>
      <div>
        <h2 className="mb-3 text-lg font-semibold">Rendimiento diario</h2>
        <DailyPerformance history={history} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-border bg-card p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
