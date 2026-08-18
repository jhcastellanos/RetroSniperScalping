import { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, className = "", id, ...props }: Props) {
  const inputId = id ?? props.name;
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-muted">{label}</span>
      <input
        id={inputId}
        className={`min-h-12 w-full rounded-2xl border bg-input px-4 text-base text-foreground outline-none placeholder:text-muted/70 ${
          error ? "border-negative" : "border-border focus:border-accent"
        } ${className}`}
        {...props}
      />
      {error ? <span className="text-sm text-negative">{error}</span> : null}
    </label>
  );
}
