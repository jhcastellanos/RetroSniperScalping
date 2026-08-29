import { ChallengeStatus, ParticipantStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCurrentParticipation(userId: string) {
  const participations = await prisma.challengeParticipant.findMany({
    where: {
      userId,
      status: { in: [ParticipantStatus.ACTIVE, ParticipantStatus.COMPLETED] },
    },
    include: { challenge: true },
    orderBy: { joinedAt: "desc" },
  });

  const active = participations.find((item) => item.challenge.status === ChallengeStatus.ACTIVE);
  if (active) return active;

  const registration = participations.find(
    (item) => item.challenge.status === ChallengeStatus.REGISTRATION,
  );
  if (registration) return registration;

  const completed = participations.find(
    (item) =>
      item.challenge.status === ChallengeStatus.COMPLETED ||
      item.challenge.status === ChallengeStatus.ARCHIVED,
  );
  return completed ?? null;
}

export async function getJoinableChallenges(userId: string) {
  const joined = await prisma.challengeParticipant.findMany({
    where: { userId },
    select: { challengeId: true },
  });
  const joinedIds = joined.map((item) => item.challengeId);

  return prisma.challenge.findMany({
    where: {
      status: { in: [ChallengeStatus.REGISTRATION, ChallengeStatus.ACTIVE] },
      ...(joinedIds.length ? { id: { notIn: joinedIds } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getAdminChallenges() {
  return prisma.challenge.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          participants: {
            where: { status: { in: [ParticipantStatus.ACTIVE, ParticipantStatus.COMPLETED] } },
          },
        },
      },
    },
  });
}

export async function getChallengeWithParticipants(challengeId: string) {
  return prisma.challenge.findUnique({
    where: { id: challengeId },
    include: {
      participants: {
        where: { status: { not: ParticipantStatus.REMOVED } },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              profileImage: true,
              googleImage: true,
              image: true,
            },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}
