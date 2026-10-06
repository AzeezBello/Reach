import type { ReactNode } from "react";

import { Container } from "@/components/ui";

/** Two-column body: long description plus a sticky facts panel. */
export function DetailBody({
  eyebrow,
  heading,
  description,
  emptyText,
  children,
  aside,
}: {
  eyebrow: string;
  heading: string;
  description?: string | null;
  emptyText: string;
  children?: ReactNode;
  aside: ReactNode;
}) {
  return (
    <Container className="py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:gap-14">
        <article>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-700">
            {eyebrow}
          </p>

          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {heading}
          </h2>

          {description ? (
            <div className="mt-6 whitespace-pre-line text-base leading-8 text-slate-700">
              {description}
            </div>
          ) : (
            <p className="mt-6 text-slate-500">{emptyText}</p>
          )}

          {children}
        </article>

        <aside>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
            {aside}
          </div>
        </aside>
      </div>
    </Container>
  );
}

/** Dark call-to-action band used at the bottom of content pages. */
export function CtaBand({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-ink">
      <Container className="py-14 text-center md:py-16">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-400">
          {eyebrow}
        </p>

        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white text-balance md:text-4xl">
          {title}
        </h2>

        <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-300">
          {text}
        </p>

        <div className="mt-7 flex flex-wrap justify-center gap-3">{children}</div>
      </Container>
    </section>
  );
}
