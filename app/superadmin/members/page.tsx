import type { Metadata } from "next";

import {
  AdminHeader,
  Field,
  Panel,
  SelectField,
  Table,
  cell,
  labelOptions,
} from "@/components/admin";

import { ActionForm } from "@/components/action-form";

import {
  getOrganizationMembers,
  getOrganizations,
  getOffices,
  getProfilesByIds,
  requireSuperadmin,
} from "@/lib/admin";

import {
  assignOrganizationRole,
  assignOfficeRole,
  removeOrganizationRole,
} from "../actions";

export const metadata: Metadata = {
  title: "Staff & Roles",
};

export default async function MembersPage() {
  await requireSuperadmin();

  const [
    organizations,
    offices,
    memberships,
  ] = await Promise.all([
    getOrganizations(),
    getOffices(),
    getOrganizationMembers(),
  ]);

  const profiles = await getProfilesByIds(
    memberships.map(
      (member) => member.user_id
    )
  );

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Access control"
        title="Staff & roles"
        text="Assign organization and office-level access to REACH users."
      />

      <div className="grid gap-8 xl:grid-cols-2">
        <Panel
          title="Organization access"
          text="Assign platform users to an organization."
        >
          <ActionForm
            action={assignOrganizationRole}
            submitLabel="Assign organization role"
          >
            <div className="space-y-5">
              <SelectField
                label="Organization"
                name="organization_id"
                required
                placeholder="Select organization"
                options={organizations.map(
                  (organization) => ({
                    value: organization.id,
                    label: organization.name,
                  })
                )}
              />

              <Field
                label="User email"
                name="email"
                type="email"
                required
                placeholder="staff@example.com"
              />

              <SelectField
                label="Role"
                name="role"
                required
                options={labelOptions([
                  "org_admin",
                  "staff",
                  "admin",
                  "superadmin",
                ])}
              />
            </div>
          </ActionForm>
        </Panel>

        <Panel
          title="Office access"
          text="Assign staff to a specific public office."
        >
          <ActionForm
            action={assignOfficeRole}
            submitLabel="Assign office role"
          >
            <div className="space-y-5">
              <SelectField
                label="Office"
                name="office_id"
                required
                placeholder="Select office"
                options={offices.map(
                  (office) => ({
                    value: office.id,
                    label: office.name,
                  })
                )}
              />

              <Field
                label="User email"
                name="email"
                type="email"
                required
                placeholder="staff@example.com"
              />

              <SelectField
                label="Role"
                name="role"
                required
                options={labelOptions([
                  "office_admin",
                  "staff",
                  "admin",
                ])}
              />
            </div>
          </ActionForm>
        </Panel>
      </div>

      <Panel
        title="Organization memberships"
        text={`${memberships.length} membership records`}
      >
        <Table
          head={[
            "User",
            "Organization",
            "Role",
            "",
          ]}
          rows={memberships.length}
          empty="No organization memberships yet."
        >
          {memberships.map((member) => {
            const profile =
              profiles.get(member.user_id);

            const organization =
              organizations.find(
                (item) =>
                  item.id ===
                  member.organization_id
              );

            return (
              <tr
                key={`${member.organization_id}:${member.user_id}`}
              >
                <td className={cell}>
                  <span className="block font-bold text-ink">
                    {profile?.full_name ||
                      "Unnamed user"}
                  </span>

                  <span className="text-xs text-slate-500">
                    {profile?.email ||
                      member.user_id}
                  </span>
                </td>

                <td className={cell}>
                  {organization?.name || "—"}
                </td>

                <td className={cell}>
                  {member.role}
                </td>

                <td
                  className={`${cell} text-right`}
                >
                  <ActionForm
                    action={
                      removeOrganizationRole
                    }
                    inline
                    variant="outline"
                    submitLabel="Remove"
                    pendingLabel="…"
                  >
                    <input
                      type="hidden"
                      name="organization_id"
                      value={
                        member.organization_id
                      }
                    />

                    <input
                      type="hidden"
                      name="user_id"
                      value={member.user_id}
                    />
                  </ActionForm>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}