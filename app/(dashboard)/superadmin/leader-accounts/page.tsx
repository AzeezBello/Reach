import {
  Mail,
  ShieldCheck,
  Clock,
} from "lucide-react";

import {
  AdminHeader,
  Panel,
  StatusBadge,
  Table,
  cell,
} from "@/components/admin";

import { requireSuperadmin } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function LeaderAccountsPage() {
  await requireSuperadmin("/superadmin/leader-accounts");

  const supabase = await createClient();

  const { data: accounts } = await supabase
    .from("leader_account_provisioning")
    .select(
      `
        id,
        email,
        status,
        created_at,
        updated_at,
        leader_id,
        leaders (
          name,
          role,
          level_label
        )
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  const pending =
    accounts?.filter(
      (account) => account.status === "pending",
    ).length ?? 0;

  const active =
    accounts?.filter(
      (account) => account.status === "active",
    ).length ?? 0;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Administration"
        title="Leader accounts"
        text="Manage account provisioning for leadership profiles."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5">
          <Clock className="h-5 w-5" />

          <p className="mt-4 text-sm text-slate-500">
            Pending
          </p>

          <p className="text-3xl font-bold">
            {pending}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <ShieldCheck className="h-5 w-5" />

          <p className="mt-4 text-sm text-slate-500">
            Active
          </p>

          <p className="text-3xl font-bold">
            {active}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <Mail className="h-5 w-5" />

          <p className="mt-4 text-sm text-slate-500">
            Total
          </p>

          <p className="text-3xl font-bold">
            {accounts?.length ?? 0}
          </p>
        </div>
      </div>

      <Panel
        title="Provisioning queue"
        text="Placeholder reach.com addresses can be replaced with real email addresses later."
      >
        <Table
          head={[
            "Leader",
            "Role",
            "Level",
            "Email",
            "Status",
            "Created",
          ]}
          rows={accounts?.length ?? 0}
          empty="No leader accounts are queued."
        >
          {(accounts ?? []).map((account) => {
            const leader = Array.isArray(account.leaders)
              ? account.leaders[0]
              : account.leaders;

            return (
              <tr key={account.id}>
                <td className={cell}>
                  <span className="font-bold">
                    {leader?.name ?? "Unknown leader"}
                  </span>
                </td>

                <td className={cell}>
                  {leader?.role ?? "—"}
                </td>

                <td className={cell}>
                  {leader?.level_label ?? "—"}
                </td>

                <td className={`${cell} font-mono text-xs`}>
                  {account.email}
                </td>

                <td className={cell}>
                  <StatusBadge
                    status={account.status}
                    fallback="Pending"
                  />
                </td>

                <td className={cell}>
                  {formatDate(account.created_at)}
                </td>
              </tr>
            );
          })}
        </Table>
      </Panel>
    </div>
  );
}