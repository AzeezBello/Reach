import type { Metadata } from "next";
import { Clock, Mail, ShieldCheck } from "lucide-react";

import { ActionForm } from "@/components/action-form";
import {
  AdminHeader,
  Field,
  Panel,
  SelectField,
  StatCard,
  Table,
  cell,
} from "@/components/admin";
import { Badge } from "@/components/ui";
import { requireSuperadmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";

import { linkLeaderAccount, unlinkLeaderAccount } from "../actions";

export const metadata: Metadata = { title: "Leader accounts" };

export default async function LeaderAccountsPage() {
  await requireSuperadmin("/superadmin/leader-accounts");

  const supabase = await createClient();
  const { data: leaders, error } = await supabase
    .from("leaders")
    .select("id, name, role, level_label, office, profile_id, created_at")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);

  const leaderRows = leaders ?? [];
  const profileIds = [...new Set(leaderRows.map((leader) => leader.profile_id).filter(Boolean))];
  const { data: profiles } = profileIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", profileIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const linkedCount = leaderRows.filter((leader) => leader.profile_id).length;
  const unlinkedCount = leaderRows.length - linkedCount;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Administration"
        title="Leader accounts"
        text="Connect leadership profiles to existing REACH accounts. This does not create users or send invitations."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={<ShieldCheck size={20} />} label="Linked accounts" value={linkedCount} />
        <StatCard icon={<Clock size={20} />} label="Unlinked profiles" value={unlinkedCount} />
        <StatCard icon={<Mail size={20} />} label="Leadership profiles" value={leaderRows.length} />
      </div>

      <Panel title="Account links" text="Only existing accounts can be linked.">
        <Table
          head={["Leader", "Office", "Account", "Status", "Action"]}
          rows={leaderRows.length}
          empty="Create a leadership profile before linking an account."
        >
          {leaderRows.map((leader) => {
            const profile = leader.profile_id ? profileMap.get(leader.profile_id) : null;

            return (
              <tr key={leader.id}>
                <td className={cell}>
                  <span className="block font-bold text-ink">{leader.name}</span>
                  <span className="text-xs text-slate-500">
                    {[leader.role, leader.level_label].filter(Boolean).join(" · ") || "—"}
                  </span>
                </td>
                <td className={cell}>{leader.office ?? "—"}</td>
                <td className={cell}>
                  {profile ? (
                    <>
                      <span className="block font-semibold text-ink">{profile.full_name || "Unnamed account"}</span>
                      <span className="text-xs text-slate-500">{profile.email ?? "Email unavailable"}</span>
                    </>
                  ) : (
                    <span className="text-slate-500">No account linked</span>
                  )}
                </td>
                <td className={cell}>
                  <Badge tone={profile ? "brand" : "slate"}>{profile ? "Linked" : "Unlinked"}</Badge>
                </td>
                <td className={cell}>
                  {leader.profile_id && (
                    <ActionForm
                      action={unlinkLeaderAccount}
                      inline
                      variant="outline"
                      submitLabel="Unlink"
                      pendingLabel="Unlinking…"
                    >
                      <input type="hidden" name="leader_id" value={leader.id} />
                    </ActionForm>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      {leaderRows.length > 0 && (
        <Panel title="Link an existing account" text="Use the email address on the person's REACH account.">
          <ActionForm action={linkLeaderAccount} submitLabel="Link account" resetOnSuccess>
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Leadership profile"
                name="leader_id"
                required
                options={leaderRows.map((leader) => ({ value: leader.id, label: leader.name }))}
                placeholder="Select a leader"
              />
              <Field label="Account email" name="email" type="email" required placeholder="person@example.com" />
            </div>
          </ActionForm>
        </Panel>
      )}
    </div>
  );
}