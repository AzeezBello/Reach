import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminHeader } from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ContentEditor } from "@/components/content-editor";
import { getAdminLeaders, getJurisdictions, getOffices, getOrganizations, requireSuperadmin } from "@/lib/admin";
import { CONTENT_KINDS, isContentKind } from "@/lib/content-admin";
import { DEFAULT_TENANT_SLUG } from "@/lib/config";

export const metadata: Metadata = { title: "New content" };

export default async function NewContentPage({
  params,
}: {
  params: Promise<{ kind: string }>;
}) {
  await requireSuperadmin();

  const { kind } = await params;

  if (!isContentKind(kind)) {
    notFound();
  }

  const config = CONTENT_KINDS[kind];

  const [organizations, jurisdictions, offices, leaders] = await Promise.all([
    getOrganizations(),
    getJurisdictions(),
    getOffices(),
    getAdminLeaders(),
  ]);

  const defaultOrganization = organizations.find((org) => org.slug === DEFAULT_TENANT_SLUG);

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Content", href: `/superadmin/content?kind=${kind}` },
          { label: `New ${config.label.toLowerCase()}`, href: `/superadmin/content/${kind}/new` },
        ]}
      />

      <AdminHeader
        eyebrow={config.plural}
        title={`New ${config.label.toLowerCase()}`}
        text="Save as a draft first, then publish when the details are ready."
      />

      <ContentEditor
        kind={kind}
        item={null}
        organizations={organizations}
        jurisdictions={jurisdictions}
        offices={offices}
        leaders={leaders.filter((leader) => leader.is_active !== false)}
        credits={new Map()}
        defaultOrganizationId={defaultOrganization?.id ?? null}
      />
    </div>
  );
}
