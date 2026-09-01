import { ReactNode } from "react";
import { BottomNav } from "@/components/layout/bottom-nav";
import { BrandLogo } from "@/components/brand/brand-logo";
import { requireUser } from "@/lib/session";
import { Role } from "@prisma/client";
import { isDatabaseConfigured } from "@/lib/env";
import { syncAllActiveChallengeDays } from "@/lib/sync-challenge-days";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  if (isDatabaseConfigured()) {
    await syncAllActiveChallengeDays();
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-4 safe-top safe-bottom">
      <header className="mb-6 flex shrink-0 justify-center">
        <BrandLogo size={72} />
      </header>
      <div className="flex-1 pb-4">{children}</div>
      <BottomNav isAdmin={user.role === Role.ADMIN} />
    </div>
  );
}
