import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Photo } from "@/components/media";
import { Container, Eyebrow } from "@/components/ui";
import type { Crumb } from "@/lib/seo";

/** Dark, photo-backed header used by every section landing page. */
export function PageHero({
  eyebrow,
  title,
  text,
  image,
  breadcrumbs,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: ReactNode;
  image: { src: string; alt: string };
  breadcrumbs?: Crumb[];
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-ink text-white">
      <Photo
        src={image.src}
        alt=""
        priority
        sizes="100vw"
        className="-z-20 opacity-30"
      />

      <div className="absolute inset-0 -z-10 bg-linear-to-r from-ink via-ink/85 to-ink/40" />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-ink via-transparent to-transparent" />

      <Container className="relative py-14 sm:py-20 md:py-24">
        {breadcrumbs && (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbs} tone="light" />
          </div>
        )}

        <div className="max-w-3xl">
          <Eyebrow tone="light">{eyebrow}</Eyebrow>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
            {title}
          </h1>

          {text && (
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              {text}
            </p>
          )}

          {children && <div className="mt-8">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
