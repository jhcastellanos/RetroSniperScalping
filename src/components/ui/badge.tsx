import { ReactNode } from "react";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "positive" | "warning" | "gold";
}) {
  const tones = {
    neutral: "bg-foreground/8 text-foreground",
    positive: "bg-positive/15 text-positive",
    warning: "bg-accent/15 text-accent",
    gold: "bg-accent/15 text-accent",
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
