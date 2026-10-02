import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  ActiveBadge,
  AdminHeader,
  CheckboxField,
  Field,
  Panel,
  Table,
  TextareaField,
  cell,
} from "@/components/admin";
import { getOrganizations, requireSuperadmin } from "@/lib/admin";
import { formatDate } from "@/lib/format";

import { createOrganization, setOrganizationActive } from "../actions";

export const metadata: Metadata = { title: "Organizations" };

export default async function OrganizationsPage() {
  await requireSuperadmin();
  const organizations = await getOrganizations();

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Tenants"
        title="Organizations"
        text="Each organization is a separate civic office with its own branding, offices and content."
      />

      <Panel title="All organizations" text={`${organizations.length} on the platform`}>
        <Table
          head={["Organization", "Slug", "Contact", "Status", "Created", ""]}
          rows={organizations.length}
          empty="No organizations yet. Create the first one below."
        >
          {organizations.map((org) => (
            <tr key={org.id}>
              <td className={cell}>
                <span className="block font-bold text-ink">{org.name}</span>
                {org.description && (
                  <span className="block max-w-xs truncate text-xs text-slate-500">
                    {org.description}
                  </span>
                )}
              </td>
              <td className={`${cell} font-mono text-xs`}>{org.slug}</td>
              <td className={`${cell} text-xs`}>
                {org.email || org.phone || org.whatsapp_number || "—"}
              </td>
              <td className={cell}><ActiveBadge active={org.is_active} /></td>
              <td className={cell}>{formatDate(org.created_at)}</td>
              <td className={`${cell} text-right`}>
                <div className="flex items-center justify-end gap-3">
                  <ActionForm
                    action={setOrganizationActive}
                    inline
                    variant="outline"
                    submitLabel={org.is_active ? "Deactivate" : "Activate"}
                    pendingLabel="…"
                  >
                    <input type="hidden" name="id" value={org.id} />
                    <input type="hidden" name="is_active" value={org.is_active ? "false" : "true"} />
                  </ActionForm>

                  <Link
                    href={`/superadmin/organizations/${org.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-700 hover:text-brand-900"
                  >
                    Edit <ArrowRight size={14} />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel
        title="Create an organization"
        text="Set up a new civic office tenant. Offices, jurisdictions and content are added afterwards."
      >
        <ActionForm action={createOrganization} submitLabel="Create organization" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" required placeholder="e.g. Surulere Connect" />
            <Field label="Slug" name="slug" placeholder="Generated from the name if left empty" hint="Lowercase letters, numbers and hyphens." />
          </div>
          <TextareaField label="Description" name="description" placeholder="One sentence residents will see on the homepage." />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Primary colour" name="primary_color" placeholder="#15803d" />
            <Field label="Secondary colour" name="secondary_color" placeholder="#06130b" />
            <Field label="Logo URL" name="logo_url" type="url" placeholder="https://…" />
            <Field label="Website" name="website" type="url" placeholder="https://…" />
            <Field label="Email" name="email" type="email" />
            <Field label="Phone" name="phone" type="tel" />
            <Field label="WhatsApp number" name="whatsapp_number" type="tel" placeholder="+234…" />
          </div>
          <CheckboxField label="Active" name="is_active" defaultChecked hint="Inactive organizations are hidden from residents." />
        </ActionForm>
      </Panel>
    </div>
  );
}
