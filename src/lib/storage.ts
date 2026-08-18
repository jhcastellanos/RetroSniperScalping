import { put } from "@vercel/blob";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALLOWED_IMAGE_TYPES, MAX_PROFILE_IMAGE_BYTES } from "@/lib/constants";
import { AppError, ErrorMessages } from "@/lib/errors";
import { isBlobConfigured } from "@/lib/env";

const MAX_INLINE_BYTES = 220 * 1024;

function extensionFor(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

function isVercelRuntime() {
  return Boolean(process.env.VERCEL);
}

export async function saveProfilePhoto(file: File, userId: string): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    throw new AppError(ErrorMessages.imageType, "IMAGE_TYPE");
  }
  if (file.size > MAX_PROFILE_IMAGE_BYTES) {
    throw new AppError(ErrorMessages.imageSize, "IMAGE_SIZE");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const filename = `avatars/${userId}-${Date.now()}.${extensionFor(file.type)}`;

  if (isBlobConfigured()) {
    const blob = await put(filename, bytes, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  if (!isVercelRuntime()) {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });
    const relative = `/uploads/${path.basename(filename)}`;
    await writeFile(path.join(process.cwd(), "public", relative), bytes);
    return relative;
  }

  if (bytes.byteLength > MAX_INLINE_BYTES) {
    throw new AppError(
      "La imagen es demasiado grande para guardarse ahora. Elige una foto más liviana.",
      "IMAGE_SIZE",
    );
  }

  return `data:${file.type};base64,${bytes.toString("base64")}`;
}
