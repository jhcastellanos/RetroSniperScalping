import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-3xl border border-border bg-card p-4 shadow-[0_10px_40px_rgba(0,0,0,0.18)] ${className}`}>
      {children}
    </section>
  );
}
