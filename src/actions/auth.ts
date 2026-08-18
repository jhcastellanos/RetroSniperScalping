"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { AppError, ErrorMessages, getErrorMessage } from "@/lib/errors";

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function registerWithEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del formulario." };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: ErrorMessages.emailTaken };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      email: parsed.data.email,
      passwordHash,
    },
  });

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: ErrorMessages.invalidCredentials };
    }
    throw error;
  }

  return { success: true };
}

export async function loginWithEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: ErrorMessages.invalidCredentials };
    }
    throw error;
  }
  return { success: true };
}

export async function loginWithGoogle() {
  await signIn("google", { redirectTo: "/" });
}

export async function logout() {
  const { signOut } = await import("@/auth");
  await signOut({ redirectTo: "/iniciar-sesion" });
}

export async function assertUniqueEmail(email: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError(ErrorMessages.emailTaken, "EMAIL_TAKEN");
}

export { getErrorMessage, redirect };
