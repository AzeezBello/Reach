import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/media";
import { Container } from "@/components/ui";
import type { Crumb } from "@/lib/seo";

/** Shared header for programme, opportunity and project detail pages. */
export function DetailHero({
  breadcrumbs,
  image,
  imageAlt,
  fallbackIcon,
  badges,
  title,
  summary,
}: {
  breadcrumbs: Crumb[];
  image?: string | null;
  imageAlt: string;
  fallbackIcon: ReactNode;
  badges: ReactNode;
  title: string;
  summary?: string | null;
}) {
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <Container className="py-8 sm:py-10 md:py-14">
        <Breadcrumbs items={breadcrumbs} />

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200 sm:mt-8 md:aspect-[21/9]">
          {image ? (
            <Photo
              src={image}
              alt={imageAlt}
              priority
              sizes="(min-width: 1280px) 1152px, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-brand-100 via-brand-50 to-gold-100">
              <span className="flex size-20 items-center justify-center rounded-3xl bg-brand-600 text-white shadow-lg shadow-brand-900/20">
                {fallbackIcon}
              </span>
            </div>
          )}
        </div>

        <div className="mt-8 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">{badges}</div>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-ink text-balance sm:text-4xl md:text-6xl">
            {title}
          </h1>

          {summary && (
            <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 md:text-xl">
              {summary}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}

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
