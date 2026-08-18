import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppError, ErrorMessages } from "@/lib/errors";

export async function getSessionUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({ where: { id: session.user.id } });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/iniciar-sesion");
  return user;
}

export async function requireAdminPage() {
  const user = await requireUser();
  if (user.role !== Role.ADMIN) redirect("/");
  return user;
}

export async function requireAdminAction() {
  const user = await getCurrentUser();
  if (!user) throw new AppError(ErrorMessages.notAuthenticated, "UNAUTHENTICATED");
  if (user.role !== Role.ADMIN) {
    throw new AppError(ErrorMessages.notAuthorized, "FORBIDDEN");
  }
  return user;
}
