import type { LeaderboardRow } from "@/lib/challenge";
import { LeaderboardClient } from "@/components/leaderboard/leaderboard-client";

export function Leaderboard({
  rows,
  started,
  participantCount,
  hasResults = true,
}: {
  rows: LeaderboardRow[];
  started: boolean;
  participantCount: number;
  hasResults?: boolean;
}) {
  return (
    <LeaderboardClient
      started={started}
      participantCount={participantCount}
      hasResults={hasResults}
      rows={rows.map((row) => ({
        position: row.position,
        participantId: row.participantId,
        userId: row.userId,
        firstName: row.firstName,
        lastName: row.lastName,
        profileImage: row.profileImage,
        googleImage: row.googleImage,
        image: row.image,
        currentBalance: row.currentBalance.toString(),
        totalReturn: row.totalReturn.toString(),
        goalProgress: row.goalProgress.toString(),
        status: row.status,
        isYou: row.isYou,
      }))}
    />
  );
}
