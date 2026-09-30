import type { Metadata } from "next";

import { ActionForm } from "@/components/action-form";
import {
  ActiveBadge,
  AdminHeader,
  CheckboxField,
  Field,
  Panel,
  SelectField,
  Table,
  TextareaField,
  cell,
  labelOptions,
} from "@/components/admin";
import {
  OFFICE_TYPES,
  getJurisdictions,
  getOffices,
  getOrganizations,
  requireSuperadmin,
} from "@/lib/admin";
import { formatDate, humanize } from "@/lib/format";

import { createOffice, setOfficeActive } from "../actions";

export const metadata: Metadata = { title: "Offices" };

export default async function OfficesPage() {
  await requireSuperadmin();

  const [offices, organizations, jurisdictions] = await Promise.all([
    getOffices(),
    getOrganizations(),
    getJurisdictions(),
  ]);

  const organizationNames = new Map(organizations.map((o) => [o.id, o.name]));
  const jurisdictionNames = new Map(jurisdictions.map((j) => [j.id, j.name]));

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Service points"
        title="Offices"
        text="An office links an organization to the jurisdiction it serves. The first active office decides which jurisdiction residents see."
      />

      <Panel title="All offices" text={`${offices.length} configured`}>
        <Table
          head={["Office", "Organization", "Jurisdiction", "Status", "Created", ""]}
          rows={offices.length}
          empty="No offices yet. Create one below."
        >
          {offices.map((office) => (
            <tr key={office.id}>
              <td className={cell}>
                <span className="block font-bold text-ink">{office.name}</span>
                <span className="text-xs text-slate-500">{humanize(office.type, "Office")}</span>
              </td>
              <td className={cell}>{organizationNames.get(office.organization_id) ?? "—"}</td>
              <td className={cell}>
                {office.jurisdiction_id
                  ? jurisdictionNames.get(office.jurisdiction_id) ?? "—"
                  : "—"}
              </td>
              <td className={cell}><ActiveBadge active={office.is_active} /></td>
              <td className={cell}>{formatDate(office.created_at)}</td>
              <td className={`${cell} text-right`}>
                <ActionForm
                  action={setOfficeActive}
                  inline
                  variant="outline"
                  submitLabel={office.is_active ? "Deactivate" : "Activate"}
                  pendingLabel="…"
                  className="justify-end"
                >
                  <input type="hidden" name="id" value={office.id} />
                  <input type="hidden" name="is_active" value={office.is_active ? "false" : "true"} />
                </ActionForm>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Create an office">
        <ActionForm action={createOffice} submitLabel="Create office" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name" name="name" required placeholder="e.g. Surulere II Constituency Office" />
            <SelectField
              label="Type"
              name="type"
              required
              options={labelOptions(OFFICE_TYPES)}
              placeholder="Select a type"
            />
            <SelectField
              label="Organization"
              name="organization_id"
              required
              options={organizations.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Select an organization"
            />
            <SelectField
              label="Jurisdiction"
              name="jurisdiction_id"
              options={jurisdictions.map((j) => ({ value: j.id, label: j.name }))}
              placeholder="None yet"
            />
          </div>
          <TextareaField label="Description" name="description" placeholder="What residents can get from this office." />
          <CheckboxField label="Active" name="is_active" defaultChecked />
        </ActionForm>
      </Panel>
    </div>
  );
}
