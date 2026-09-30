import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema, type Crumb } from "@/lib/seo";

/**
 * Visible breadcrumb trail plus matching BreadcrumbList structured data.
 * `items` excludes the home crumb; the last item is the current page.
 */
export function Breadcrumbs({
  items,
  tone = "dark",
}: {
  items: Crumb[];
  tone?: "dark" | "light";
}) {
  const trail: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const light = tone === "light";

  return (
    <nav aria-label="Breadcrumb">
      <ol
        className={`flex flex-wrap items-center gap-1 text-xs font-semibold sm:text-sm ${
          light ? "text-slate-300" : "text-slate-500"
        }`}
      >
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;

          return (
            <li key={crumb.href} className="flex min-w-0 items-center gap-1">
              {index > 0 && (
                <ChevronRight size={14} className="shrink-0 opacity-60" />
              )}

              {last ? (
                <span
                  aria-current="page"
                  className={`truncate ${light ? "text-white" : "text-ink"}`}
                >
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className={`inline-flex items-center gap-1 transition ${
                    light ? "hover:text-white" : "hover:text-brand-800"
                  }`}
                >
                  {index === 0 && <Home size={14} />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>

      <JsonLd data={breadcrumbSchema(trail)} />
    </nav>
  );
}
