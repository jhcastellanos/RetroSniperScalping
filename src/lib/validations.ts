import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/constants";

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "El nombre es obligatorio.").max(50),
    lastName: z.string().trim().min(1, "El apellido es obligatorio.").max(50),
    email: z.string().trim().email("El correo no es válido.").toLowerCase(),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres.`)
      .regex(/[A-Za-z]/, "La contraseña debe incluir al menos una letra.")
      .regex(/[0-9]/, "La contraseña debe incluir al menos un número."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().email("El correo no es válido.").toLowerCase(),
  password: z.string().min(1, "La contraseña es obligatoria."),
});

export const profileSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio.").max(50),
  lastName: z.string().trim().min(1, "El apellido es obligatorio.").max(50),
});

export const challengeSchema = z.object({
  name: z.string().trim().min(3, "El nombre del reto es obligatorio.").max(80),
  startingBalance: z.coerce.number().positive("El balance inicial debe ser mayor a 0."),
  targetBalance: z.coerce.number().positive("El objetivo debe ser mayor a 0."),
  totalTradingDays: z.coerce.number().int().min(1).max(1000),
  plannedStartDate: z.string().optional(),
}).refine((data) => data.targetBalance > data.startingBalance, {
  message: "El objetivo debe ser mayor que el balance inicial.",
  path: ["targetBalance"],
});

export const dailyBalanceSchema = z.object({
  challengeId: z.string().min(1),
  balance: z.coerce.number().min(0, "El balance debe ser mayor o igual a $0."),
});
