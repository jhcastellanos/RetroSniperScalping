import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { syncAllActiveChallengeDays } from "@/lib/sync-challenge-days";
import { isDatabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (secret) {
    return auth === `Bearer ${secret}`;
  }
  return process.env.NODE_ENV !== "production";
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  await syncAllActiveChallengeDays();
  revalidatePath("/");
  revalidatePath("/actualizar");
  revalidatePath("/progreso");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true });
}
