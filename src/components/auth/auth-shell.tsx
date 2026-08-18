import Link from "next/link";
import { ReactNode } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-start px-5 pb-10 safe-top">
      <div className="mb-8 flex flex-col items-center">
        <BrandLogo size={112} showName />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>
      </div>
      {children}
      <div className="mt-8">
        <ThemeToggle />
      </div>
    </div>
  );
}

export function AuthSwitch({
  question,
  href,
  label,
}: {
  question: string;
  href: string;
  label: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-muted">
      {question}{" "}
      <Link href={href} className="font-semibold text-accent">
        {label}
      </Link>
    </p>
  );
}
