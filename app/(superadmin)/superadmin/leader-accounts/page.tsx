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

import {
  inviteLeaderAccount,
  unlinkLeaderAccount,
} from "../actions";

export const metadata: Metadata = {
  title: "Leader accounts",
};

export default async function LeaderAccountsPage() {
  await requireSuperadmin(
    "/superadmin/leader-accounts"
  );

  const supabase = await createClient();

  /*
   * Load leadership profiles.
   *
   * IMPORTANT:
   * Do not query leaders.profile_id.
   * Account relationships are stored in
   * leader_account_provisioning.
   */
  const {
    data: leaders,
    error: leadersError,
  } = await supabase
    .from("leaders")
    .select(
      "id, name, role, level_label, office, sort_order, created_at"
    )
    .order("sort_order", {
      ascending: true,
    })
    .order("name", {
      ascending: true,
    });

  if (leadersError) {
    throw new Error(
      leadersError.message
    );
  }

  const leaderRows = leaders ?? [];

  /*
   * Get provisioning records for all leaders.
   */
  const leaderIds = leaderRows.map(
    (leader) => leader.id
  );

  const {
    data: provisioning,
    error: provisioningError,
  } = leaderIds.length
    ? await supabase
        .from(
          "leader_account_provisioning"
        )
        .select(
          "id, leader_id, email, status, created_at, updated_at"
        )
        .in(
          "leader_id",
          leaderIds
        )
    : {
        data: [],
        error: null,
      };

  if (provisioningError) {
    throw new Error(
      provisioningError.message
    );
  }

  /*
   * Map provisioning records by leader ID.
   */
  const provisioningMap =
    new Map(
      (provisioning ?? []).map(
        (record) => [
          record.leader_id,
          record,
        ]
      )
    );

  /*
   * A leader is considered linked only when the
   * provisioning record is active.
   */
  const linkedCount =
    (provisioning ?? []).filter(
      (record) =>
        record.status === "active"
    ).length;

  const unlinkedCount =
    leaderRows.length -
    linkedCount;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Administration"
        title="Leader accounts"
        text="Link a registered account or invite a leader to create their own secure sign-in. No shared passwords are used."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={<ShieldCheck size={20} />}
          label="Linked accounts"
          value={linkedCount}
        />

        <StatCard
          icon={<Clock size={20} />}
          label="Unlinked profiles"
          value={unlinkedCount}
        />

        <StatCard
          icon={<Mail size={20} />}
          label="Leadership profiles"
          value={leaderRows.length}
        />
      </div>

      <Panel
        title="Account links"
        text="Existing REACH accounts can be linked to leadership profiles."
      >
        <Table
          head={[
            "Leader",
            "Office",
            "Account",
            "Status",
            "Action",
          ]}
          rows={leaderRows.length}
          empty="Create a leadership profile before linking an account."
        >
          {leaderRows.map((leader) => {
            const account =
              provisioningMap.get(
                leader.id
              );

            const isLinked =
              account?.status ===
              "active";

            return (
              <tr key={leader.id}>
                <td className={cell}>
                  <span className="block font-bold text-ink">
                    {leader.name}
                  </span>

                  <span className="text-xs text-slate-500">
                    {[
                      leader.role,
                      leader.level_label,
                    ]
                      .filter(Boolean)
                      .join(" · ") ||
                      "—"}
                  </span>
                </td>

                <td className={cell}>
                  {leader.office ??
                    "—"}
                </td>

                <td className={cell}>
                  {account ? (
                    <>
                      <span className="block font-semibold text-ink">
                        {account.email}
                      </span>

                      <span className="text-xs text-slate-500">
                        {account.status}
                      </span>
                    </>
                  ) : (
                    <span className="text-slate-500">
                      No account provisioned
                    </span>
                  )}
                </td>

                <td className={cell}>
                  <Badge
                    tone={
                      isLinked
                        ? "brand"
                        : "slate"
                    }
                  >
                    {isLinked
                      ? "Linked"
                      : account
                        ? "Pending"
                        : "Unlinked"}
                  </Badge>
                </td>

                <td className={cell}>
                  {isLinked && (
                    <ActionForm
                      action={
                        unlinkLeaderAccount
                      }
                      inline
                      variant="outline"
                      submitLabel="Unlink"
                      pendingLabel="Unlinking…"
                    >
                      <input
                        type="hidden"
                        name="leader_id"
                        value={
                          leader.id
                        }
                      />
                    </ActionForm>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>

      {unlinkedCount > 0 && (
        <Panel
          title="Link or invite a leader"
          text="Use the leader's verified email address. Existing REACH accounts are linked; new accounts receive a one-time email invitation to create their own password."
        >
          <ActionForm
            action={
              inviteLeaderAccount
            }
            submitLabel="Link / send invitation"
            resetOnSuccess
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Leadership profile"
                name="leader_id"
                required
                options={leaderRows
                  .filter((leader) => {
                    const account =
                      provisioningMap.get(
                        leader.id
                      );

                    return (
                      account?.status !==
                      "active"
                    );
                  })
                  .map((leader) => ({
                    value: leader.id,
                    label:
                      leader.name,
                  }))}
                placeholder="Select a leader"
              />

              <Field
                label="Verified email address"
                name="email"
                type="email"
                required
                placeholder="leader@example.org"
                hint="An invitation is sent only if no REACH account exists for this address."
              />
            </div>
          </ActionForm>
        </Panel>
      )}
    </div>
  );
}