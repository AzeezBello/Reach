import type { Metadata } from "next";

import { ActionForm } from "@/components/action-form";
import {
  AdminHeader,
  Field,
  Panel,
  SelectField,
  Table,
  cell,
  labelOptions,
} from "@/components/admin";
import { Badge } from "@/components/ui";
import {
  STAFF_ROLES,
  getOfficeMembers,
  getOffices,
  getProfilesByIds,
  requireSuperadmin,
} from "@/lib/admin";
import { formatDate, humanize } from "@/lib/format";

import { addOfficeMember, removeOfficeMember } from "../actions";

export const metadata: Metadata = { title: "Staff" };

export default async function StaffPage() {
  await requireSuperadmin();

  const [members, offices] = await Promise.all([getOfficeMembers(), getOffices()]);
  const profiles = await getProfilesByIds([...new Set(members.map((m) => m.user_id))]);
  const officeNames = new Map(offices.map((o) => [o.id, o.name]));

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="People"
        title="Office staff"
        text="Staff and admins attached to each office. A person must already have a resident account before they can be added."
      />

      <Panel title="Members" text={`${members.length} assignments`}>
        <Table
          head={["Person", "Office", "Role", "Added", ""]}
          rows={members.length}
          empty="No staff assigned yet. Add someone below."
        >
          {members.map((member) => {
            const profile = profiles.get(member.user_id);

            return (
              <tr key={`${member.office_id}-${member.user_id}`}>
                <td className={cell}>
                  <span className="block font-bold text-ink">
                    {profile?.full_name || "Unnamed account"}
                  </span>
                  <span className="text-xs text-slate-500">
                    {profile?.email || member.user_id}
                  </span>
                </td>
                <td className={cell}>{officeNames.get(member.office_id) ?? "—"}</td>
                <td className={cell}>
                  <Badge tone={member.role === "admin" ? "gold" : "slate"}>
                    {humanize(member.role, "Staff")}
                  </Badge>
                </td>
                <td className={cell}>{formatDate(member.created_at)}</td>
                <td className={`${cell} text-right`}>
                  <ActionForm
                    action={removeOfficeMember}
                    inline
                    variant="outline"
                    submitLabel="Remove"
                    pendingLabel="…"
                    className="justify-end"
                  >
                    <input type="hidden" name="office_id" value={member.office_id} />
                    <input type="hidden" name="user_id" value={member.user_id} />
                  </ActionForm>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      <Panel title="Add a staff member" text="Find the person by the email they used to create their account.">
        <ActionForm action={addOfficeMember} submitLabel="Add to office" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Email" name="email" type="email" required placeholder="person@example.com" />
            <SelectField
              label="Office"
              name="office_id"
              required
              options={offices.map((o) => ({ value: o.id, label: o.name }))}
              placeholder="Select an office"
            />
            <SelectField
              label="Role"
              name="role"
              required
              options={labelOptions(STAFF_ROLES)}
              defaultValue="staff"
            />
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}
