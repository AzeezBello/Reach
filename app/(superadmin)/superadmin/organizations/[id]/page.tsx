import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardList, FolderKanban, GraduationCap, Sparkles } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  ActiveBadge,
  AdminHeader,
  CheckboxField,
  Field,
  Panel,
  StatCard,
  Table,
  TextareaField,
  cell,
} from "@/components/admin";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getContentCounts,
  getJurisdictions,
  getOffices,
  getOrganization,
  requireSuperadmin,
} from "@/lib/admin";
import { humanize } from "@/lib/format";

import { updateOrganization } from "../../actions";

type Params = { params: Promise<{ id: string }> };

export const metadata: Metadata = { title: "Edit organization" };

export default async function OrganizationDetailPage({ params }: Params) {
  await requireSuperadmin();

  const { id } = await params;
  const organization = await getOrganization(id);

  if (!organization) {
    notFound();
  }

  const [counts, offices, jurisdictions] = await Promise.all([
    getContentCounts(id),
    getOffices(),
    getJurisdictions(),
  ]);

  const orgOffices = offices.filter((office) => office.organization_id === id);
  const jurisdictionNames = new Map(jurisdictions.map((j) => [j.id, j.name]));

  return (
    <div className="space-y-8">
      <Breadcrumbs
        items={[
          { label: "Console", href: "/superadmin" },
          { label: "Organizations", href: "/superadmin/organizations" },
          { label: organization.name, href: `/superadmin/organizations/${id}` },
        ]}
      />

      <AdminHeader
        eyebrow="Organization"
        title={organization.name}
        text={`Slug: ${organization.slug}`}
        action={<ActiveBadge active={organization.is_active} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<GraduationCap size={20} />} label="Programmes" value={counts.programmes} />
        <StatCard icon={<Sparkles size={20} />} label="Opportunities" value={counts.opportunities} />
        <StatCard icon={<FolderKanban size={20} />} label="Projects" value={counts.projects} />
        <StatCard icon={<ClipboardList size={20} />} label="Requests" value={counts.requests} />
      </div>

      <Panel title="Details & branding" text="Changes are visible to residents immediately.">
        <ActionForm action={updateOrganization} submitLabel="Save changes">
          <input type="hidden" name="id" value={organization.id} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" required defaultValue={organization.name} />
            <Field label="Slug" name="slug" defaultValue={organization.slug} hint="Changing the slug changes the tenant URL." />
          </div>
          <TextareaField label="Description" name="description" defaultValue={organization.description} />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary colour" name="primary_color" defaultValue={organization.primary_color} placeholder="#15803d" />
            <Field label="Secondary colour" name="secondary_color" defaultValue={organization.secondary_color} placeholder="#06130b" />
            <Field label="Logo URL" name="logo_url" type="url" defaultValue={organization.logo_url} hint="Leave empty to use the built-in brand logo." />
            <Field label="Website" name="website" type="url" defaultValue={organization.website} />
            <Field label="Email" name="email" type="email" defaultValue={organization.email} />
            <Field label="Phone" name="phone" type="tel" defaultValue={organization.phone} />
            <Field label="WhatsApp number" name="whatsapp_number" type="tel" defaultValue={organization.whatsapp_number} />
          </div>
          <CheckboxField label="Active" name="is_active" defaultChecked={organization.is_active} hint="Inactive organizations are hidden from residents." />
        </ActionForm>
      </Panel>

      <Panel title="Offices" text="Offices operated by this organization.">
        <Table
          head={["Office", "Type", "Jurisdiction", "Status"]}
          rows={orgOffices.length}
          empty="No offices yet. Add one from the Offices page."
        >
          {orgOffices.map((office) => (
            <tr key={office.id}>
              <td className={`${cell} font-bold text-ink`}>{office.name}</td>
              <td className={cell}>{humanize(office.type, "—")}</td>
              <td className={cell}>
                {office.jurisdiction_id
                  ? jurisdictionNames.get(office.jurisdiction_id) ?? "—"
                  : "—"}
              </td>
              <td className={cell}><ActiveBadge active={office.is_active} /></td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
