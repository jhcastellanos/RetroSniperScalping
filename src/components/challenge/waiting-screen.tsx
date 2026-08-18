import { ChallengeStatus } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { formatMoney } from "@/lib/money";
import { JoinChallengeButton } from "@/components/challenge/join-challenge-button";

export function WaitingScreen({
  challenge,
  participantCount,
}: {
  challenge: {
    id: string;
    name: string;
    startingBalance: { toString(): string };
    targetBalance: { toString(): string };
    totalTradingDays: number;
    status: ChallengeStatus;
  };
  participantCount: number;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {challenge.name}
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Ya estás inscrito</h1>
        <p className="mt-2 text-sm text-muted">El reto todavía no ha comenzado.</p>
      </div>

      <Card className="space-y-4 p-5">
        <p className="text-center text-lg font-semibold tracking-wide text-accent">
          ESPERANDO EL INICIO DEL RETO
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="Balance inicial" value={formatMoney(challenge.startingBalance.toString())} />
          <Stat label="Objetivo" value={formatMoney(challenge.targetBalance.toString())} />
          <Stat label="Días de trading" value={String(challenge.totalTradingDays)} />
          <Stat label="Participantes" value={String(participantCount)} />
        </div>
        <p className="text-center text-sm text-muted">
          Tu cuenta está lista. Los resultados diarios se habilitarán cuando el administrador inicie el reto, no en una fecha automática.
        </p>
      </Card>
    </div>
  );
}

export function JoinableChallengeCard({
  challenge,
  participantCount,
}: {
  challenge: {
    id: string;
    name: string;
    startingBalance: { toString(): string };
    targetBalance: { toString(): string };
    totalTradingDays: number;
  };
  participantCount: number;
}) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Reto abierto</p>
        <h2 className="mt-1 text-2xl font-semibold">{challenge.name}</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Stat label="Inicio" value={formatMoney(challenge.startingBalance.toString())} />
        <Stat label="Objetivo" value={formatMoney(challenge.targetBalance.toString())} />
        <Stat label="Duración" value={`${challenge.totalTradingDays} días`} />
        <Stat label="Inscritos" value={String(participantCount)} />
      </div>
      <p className="text-sm text-muted">
        Puedes inscribirte ahora. El administrador iniciará el reto cuando todos estén listos.
      </p>
      <JoinChallengeButton challengeId={challenge.id} />
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-foreground/5 p-3">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

export function LockedState({ message = "Disponible cuando el reto comience" }: { message?: string }) {
  return (
    <Card className="border-dashed p-6 text-center text-sm text-muted">
      🔒 {message}
    </Card>
  );
}
