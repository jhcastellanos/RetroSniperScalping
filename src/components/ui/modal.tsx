"use client";

import { ReactNode, useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <button className="absolute inset-0" aria-label="Cerrar" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-2xl">
        <h2 className="font-display text-xl font-semibold">{title}</h2>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
