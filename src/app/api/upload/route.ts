import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { saveProfilePhoto } from "@/lib/storage";
import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "@/lib/errors";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("photo");
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
    }

    const url = await saveProfilePhoto(file, session.user.id);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { profileImage: url },
    });

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
