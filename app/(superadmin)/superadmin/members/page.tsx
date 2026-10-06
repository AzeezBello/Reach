import type { Metadata } from "next";
import {
  Shield,
  Users,
} from "lucide-react";

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

import { getOrganizations, requireSuperadmin } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin-client";
import type { Profile } from "@/lib/types";
import { assignOrganizationRole, removeOrganizationRole } from "../actions";

export const metadata: Metadata = { title: "Organization members" };

type MemberProfile = Pick<Profile, "id" | "full_name" | "email" | "role">;

export default async function MembersPage() {
  await requireSuperadmin("/superadmin/members");

  const organizations = await getOrganizations();
  const supabase = createAdminClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select(
      `
        organization_id,
        user_id,
        role,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  const userIds = [
    ...new Set(
      (members ?? []).map(
        (member) => member.user_id,
      ),
    ),
  ];

  let profiles: MemberProfile[] = [];

  if (userIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role",
      )
      .in("id", userIds);

    profiles = (data ?? []) as MemberProfile[];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );
  const organizationNames = new Map(
    organizations.map((organization) => [organization.id, organization.name]),
  );
  const membershipRoles = labelOptions(["org_admin", "staff", "admin", "superadmin"]);

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Administration"
        title="Staff & roles"
        text="View organization memberships and staff access."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-5">
          <Users className="h-5 w-5" />

          <p className="mt-4 text-sm text-slate-500">
            Organization members
          </p>

          <p className="text-3xl font-bold">
            {members?.length ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <Shield className="h-5 w-5" />

          <p className="mt-4 text-sm text-slate-500">
            Roles
          </p>

          <p className="text-3xl font-bold">
            {
              new Set(
                (members ?? []).map(
                  (member) => member.role,
                ),
              ).size
            }
          </p>
        </div>
      </div>

      <Panel
        title="Organization memberships"
        text="Current organization-level access."
      >
        <Table
          head={[
            "User",
            "Email",
            "Organization",
            "Role",
            "Actions",
          ]}
          rows={members?.length ?? 0}
          empty="No organization memberships found."
        >
          {(members ?? []).map((member) => {
            const profile = profileMap.get(
              member.user_id,
            );

            return (
              <tr key={`${member.organization_id}-${member.user_id}`}>
                <td className={cell}>
                  <span className="font-semibold">
                    {profile?.full_name ??
                      "Unknown user"}
                  </span>
                </td>

                <td className={cell}>
                  {profile?.email ?? "—"}
                </td>

                <td className={cell}>
                  {organizationNames.get(member.organization_id) ?? "Unknown organization"}
                </td>

                <td className={cell}>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {member.role}
                  </span>
                </td>
                <td className={cell}>
                  <div className="flex flex-wrap items-center gap-2">
                    {profile?.email && (
                      <ActionForm
                        action={assignOrganizationRole}
                        inline
                        submitLabel="Save role"
                        pendingLabel="Saving…"
                      >
                        <input type="hidden" name="organization_id" value={member.organization_id} />
                        <input type="hidden" name="email" value={profile.email} />
                        <div>
                          <label
                            htmlFor={`organization-role-${member.organization_id}-${member.user_id}`}
                            className="sr-only"
                          >
                            Role for {profile.full_name || profile.email}
                          </label>
                          <select
                            id={`organization-role-${member.organization_id}-${member.user_id}`}
                            name="role"
                            defaultValue={member.role}
                            className="min-h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm text-ink"
                          >
                            {membershipRoles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </ActionForm>
                    )}
                    <ActionForm
                      action={removeOrganizationRole}
                      inline
                      variant="outline"
                      submitLabel="Remove"
                      pendingLabel="…"
                    >
                      <input type="hidden" name="organization_id" value={member.organization_id} />
                      <input type="hidden" name="user_id" value={member.user_id} />
                    </ActionForm>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      <Panel
        title="Add an organization member"
        text="Assign an existing REACH account to an organization."
      >
        <ActionForm action={assignOrganizationRole} submitLabel="Add member" resetOnSuccess>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field
              label="Account email"
              name="email"
              type="email"
              required
              placeholder="person@example.com"
            />
            <SelectField
              label="Organization"
              name="organization_id"
              required
              options={organizations.map((organization) => ({
                value: organization.id,
                label: organization.name,
              }))}
              placeholder="Select an organization"
            />
            <SelectField
              label="Role"
              name="role"
              required
              options={membershipRoles}
              defaultValue="staff"
            />
          </div>
        </ActionForm>
      </Panel>
    </div>
  );
}