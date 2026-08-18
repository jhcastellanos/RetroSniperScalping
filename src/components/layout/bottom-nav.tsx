"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartLine, Plus, Trophy, UserRound, Settings } from "lucide-react";

const items = [
  { href: "/", label: "Ranking", icon: Trophy },
  { href: "/actualizar", label: "Actualizar", icon: Plus },
  { href: "/progreso", label: "Progreso", icon: ChartLine },
  { href: "/perfil", label: "Perfil", icon: UserRound },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-nav backdrop-blur-xl">
      <div className="mx-auto grid max-w-lg grid-cols-4 px-2 pb-[env(safe-area-inset-bottom)] pt-2">
        {items.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium ${
                active ? "text-accent" : "text-muted"
              }`}
            >
              <Icon size={22} />
              {item.label}
            </Link>
          );
        })}
      </div>
      {isAdmin ? (
        <div className="absolute -top-12 right-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-heading"
          >
            <Settings size={14} />
            Admin
          </Link>
        </div>
      ) : null}
    </nav>
  );
}
