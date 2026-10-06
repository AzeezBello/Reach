import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminHeader, StatusBadge } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContentEditor } from "@/components/content-editor";
import { ButtonLink } from "@/components/ui";
import { getAdminLeaders, getJurisdictions, getOffices, getOrganizations, requireSuperadmin } from "@/lib/admin";
import { CONTENT_KINDS, getContent, getContentCredits, isContentKind } from "@/lib/content-admin";

export const metadata: Metadata = { title: "Edit content" };

export default async function EditContentPage({
  params,
  searchParams,
}: {
  params: Promise<{ kind: string; id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  await requireSuperadmin();

  const [{ kind, id }, { created }] = await Promise.all([params, searchParams]);

  if (!isContentKind(kind)) {
    notFound();
  }

  const config = CONTENT_KINDS[kind];
  const item = await getContent(kind, id);

  if (!item) {
    notFound();
  }

  const [organizations, jurisdictions, offices, leaders, credits] = await Promise.all([
    getOrganizations(),
    getJurisdictions(),
    getOffices(),
    getAdminLeaders(),
    getContentCredits(kind, id),
  ]);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Content", href: `/superadmin/content?kind=${kind}` },
          { label: item.title, href: `/superadmin/content/${kind}/${id}` },
        ]}
      />

      <AdminHeader
        eyebrow={config.plural}
        title={item.title}
        text={`Last updated ${new Date(item.updated_at ?? item.created_at).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={item.status} fallback="Draft" />
            {kind === "event" && (
              <ButtonLink href={`/superadmin/events/${id}`} variant="outline" size="sm">
                Manage RSVPs
              </ButtonLink>
            )}
          </div>
        }
      />

      {created && (
        <p role="status" className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm font-semibold text-brand-800">
          {config.label} created. Review the details below and publish when ready.
        </p>
      )}

      <ContentEditor
        kind={kind}
        item={item}
        organizations={organizations}
        jurisdictions={jurisdictions}
        offices={offices}
        leaders={leaders.filter((leader) => leader.is_active !== false || credits.has(leader.id ?? ""))}
        credits={credits}
      />
    </div>
  );
}
