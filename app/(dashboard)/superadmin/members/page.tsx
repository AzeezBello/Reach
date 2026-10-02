import {
  Shield,
  Users,
} from "lucide-react";

import {
  AdminHeader,
  Panel,
  Table,
  cell,
} from "@/components/admin";

import { requireSuperadmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

export default async function MembersPage() {
  await requireSuperadmin("/superadmin/members");

  const supabase = await createClient();

  const { data: members } = await supabase
    .from("organization_members")
    .select(
      `
        id,
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

  let profiles: any[] = [];

  if (userIds.length) {
    const { data } = await supabase
      .from("profiles")
      .select(
        "id, full_name, email, role",
      )
      .in("id", userIds);

    profiles = data ?? [];
  }

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

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
          ]}
          rows={members?.length ?? 0}
          empty="No organization memberships found."
        >
          {(members ?? []).map((member) => {
            const profile = profileMap.get(
              member.user_id,
            );

            return (
              <tr key={member.id}>
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
                  {member.organization_id}
                </td>

                <td className={cell}>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {member.role}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}