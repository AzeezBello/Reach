import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContentAccountability } from "@/components/content/content-accountability";
import { Photo } from "@/components/media";
import { Container } from "@/components/ui";
import type { Crumb } from "@/lib/seo";
import type { ContentAttribution } from "@/lib/types";

/**
 * Shared header for programme, opportunity, project and event pages:
 * breadcrumbs, hero image, badges, title, summary and the accountability
 * panel that answers "who is responsible for this?".
 */
export function ContentDetailHeader({
  breadcrumbs,
  image,
  imageAlt,
  fallbackIcon,
  badges,
  title,
  summary,
  attribution,
}: {
  breadcrumbs: Crumb[];
  image?: string | null;
  imageAlt: string;
  fallbackIcon: ReactNode;
  badges: ReactNode;
  title: string;
  summary?: string | null;
  attribution?: ContentAttribution;
}) {
  return (
    <section className="border-b border-slate-100 bg-slate-50">
      <Container className="py-8 sm:py-10 md:py-14">
        <Breadcrumbs items={breadcrumbs} />

        <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-3xl bg-slate-100 shadow-sm ring-1 ring-slate-200 sm:mt-8 md:aspect-[21/9]">
          {image ? (
            <Photo src={image} alt={imageAlt} priority sizes="(min-width: 1280px) 1152px, 100vw" />
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

        {attribution && (
          <div className="mt-8">
            <ContentAccountability {...attribution} />
          </div>
        )}
      </Container>
    </section>
  );
}
