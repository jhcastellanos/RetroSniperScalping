import { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

const variants = {
  primary:
    "bg-accent text-on-accent hover:bg-accent-strong disabled:bg-accent/40",
  secondary:
    "bg-transparent text-heading border border-border hover:bg-accent/10 disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:bg-accent/10 disabled:opacity-50",
  danger: "bg-negative text-white hover:opacity-90 disabled:opacity-50",
};

export function Button({ variant = "primary", className = "", ...props }: Props) {
  return (
    <button
      className={`inline-flex min-h-12 w-full items-center justify-center rounded-2xl px-4 text-base font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
