"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validations";
import { saveProfilePhoto } from "@/lib/storage";
import { getErrorMessage } from "@/lib/errors";

type ProfileState = {
  error?: string;
  success?: boolean;
};

export async function updateProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  try {
    const user = await requireUser();
    const parsed = profileSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Revisa los datos." };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      },
    });

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function uploadProfilePhoto(formData: FormData) {
  try {
    const user = await requireUser();
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return { error: "Selecciona una imagen." };
    }

    const url = await saveProfilePhoto(file, user.id);
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: url },
    });

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true, url };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}

export async function clearCustomPhoto() {
  try {
    const user = await requireUser();
    await prisma.user.update({
      where: { id: user.id },
      data: { profileImage: null },
    });
    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { error: getErrorMessage(error) };
  }
}
