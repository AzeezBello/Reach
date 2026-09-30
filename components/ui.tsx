import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import type { Tone } from "@/lib/format";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typography                                                          */
/* ------------------------------------------------------------------ */

const eyebrowTone = {
  brand: "text-brand-700",
  light: "text-brand-300",
  gold: "text-gold-600",
};

export function Eyebrow({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof eyebrowTone;
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-extrabold uppercase tracking-[0.2em] ${eyebrowTone[tone]} ${className}`}
    >
      {children}
    </p>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  text,
  action,
  tone = "dark",
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  action?: ReactNode;
  tone?: "dark" | "light";
  align?: "left" | "center";
}) {
  const light = tone === "light";

  return (
    <div
      className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:justify-center" : ""
      }`}
    >
      <div className={`max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
        {eyebrow && (
          <Eyebrow tone={light ? "light" : "brand"}>{eyebrow}</Eyebrow>
        )}

        <h2
          className={`mt-3 text-3xl font-extrabold tracking-tight text-balance sm:text-4xl md:text-5xl ${
            light ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </h2>

        {text && (
          <p
            className={`mt-4 text-base leading-7 sm:text-lg sm:leading-8 ${
              light ? "text-slate-300" : "text-slate-600"
            }`}
          >
            {text}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */

const buttonVariant = {
  primary:
    "bg-brand-600 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-700",
  gold: "bg-gold-400 text-ink hover:bg-gold-300",
  dark: "bg-ink text-white hover:bg-ink-soft",
  light: "bg-white text-ink hover:bg-brand-50",
  outline:
    "border border-slate-300 bg-white text-slate-800 hover:border-brand-400 hover:text-brand-800",
  outlineLight:
    "border border-white/25 bg-white/10 text-white backdrop-blur hover:bg-white/20",
  ghost: "text-brand-800 hover:bg-brand-50",
};

const buttonSize = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-3 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export type ButtonVariant = keyof typeof buttonVariant;

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: keyof typeof buttonSize = "md",
  className = ""
) {
  return `inline-flex items-center justify-center gap-2 rounded-xl font-bold transition active:scale-[0.98] ${buttonVariant[variant]} ${buttonSize[size]} ${className}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  arrow = false,
  external = false,
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: keyof typeof buttonSize;
  className?: string;
  arrow?: boolean;
  external?: boolean;
}) {
  const classes = buttonClasses(variant, size, className);
  const content = (
    <>
      {children}
      {arrow && <ArrowRight size={size === "lg" ? 18 : 16} />}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

export function TextLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-2 text-sm font-bold text-brand-700 transition hover:text-brand-900 ${className}`}
    >
      {children}
      <ArrowRight
        size={16}
        className="transition group-hover:translate-x-0.5"
      />
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Badges                                                              */
/* ------------------------------------------------------------------ */

const badgeTone: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-800",
  gold: "bg-gold-100 text-gold-700",
  slate: "bg-slate-100 text-slate-700",
  ink: "bg-ink text-white",
};

export function Badge({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ${badgeTone[tone]}`}
    >
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Empty state                                                         */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center sm:py-16">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm ring-1 ring-slate-200">
        {icon}
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-ink">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
        {text}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Small meta rows                                                     */
/* ------------------------------------------------------------------ */

export function MetaItem({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
      <span className="text-brand-700">{icon}</span>
      {children}
    </span>
  );
}

export function FactRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
