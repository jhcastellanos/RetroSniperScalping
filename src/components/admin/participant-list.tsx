import { ParticipantStatus } from "@prisma/client";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/money";
import { displayName } from "@/lib/profile-image";

type Participant = {
  id: string;
  joinedAt: Date;
  status: ParticipantStatus;
  completedAt: Date | null;
  currentBalance: { toString(): string } | null;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
    googleImage: string | null;
    image: string | null;
  };
};

export function ParticipantList({
  participants,
  challengeActive,
}: {
  participants: Participant[];
  challengeActive: boolean;
}) {
  return (
    <div className="space-y-2">
      {participants.map((participant) => (
        <article key={participant.id} className="rounded-3xl border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <Avatar user={participant.user} size={44} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{displayName(participant.user)}</p>
              <p className="truncate text-xs text-muted">{participant.user.email}</p>
              <p className="text-xs text-muted">
                Inscrito el {participant.joinedAt.toLocaleDateString("es-MX")}
              </p>
            </div>
            <div className="text-right">
              <StatusBadge tone={participant.status === "COMPLETED" ? "positive" : "neutral"}>
                {participant.status}
              </StatusBadge>
              {challengeActive && participant.currentBalance ? (
                <p className="mt-1 text-sm font-semibold">
                  {formatMoney(participant.currentBalance.toString())}
                </p>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
