import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  ClipboardList,
} from "lucide-react";

import {
  AdminHeader,
  Panel,
  StatCard,
  StatusBadge,
  Table,
  cell,
} from "@/components/admin";

import { requireUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Office Dashboard",
};

export default async function OfficeDashboardPage() {
  const user = await requireUser("/office");

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("office_members")
    .select("office_id, role")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    redirect("/dashboard?denied=office");
  }

  const officeIds = memberships.map(
    (membership) => membership.office_id,
  );

  const [
    { data: offices },
    { data: requests },
  ] = await Promise.all([
    supabase
      .from("offices")
      .select(
        "id, name, type, organization_id",
      )
      .in("id", officeIds)
      .order("name"),

    supabase
      .from("requests")
      .select(
        `
          id,
          reference_no,
          subject,
          category,
          status,
          created_at,
          assigned_office_id
        `,
      )
      .in("assigned_office_id", officeIds)
      .order("created_at", {
        ascending: false,
      })
      .limit(50),
  ]);

  const officeMap = new Map(
    (offices ?? []).map((office) => [
      office.id,
      office.name,
    ]),
  );

  const openRequests = (requests ?? []).filter(
    (request) =>
      [
        "submitted",
        "under_review",
        "in_progress",
      ].includes(request.status),
  ).length;

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Office dashboard"
        title="Resident service desk"
        text="Requests assigned to the offices you are authorized to work with."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={<Building2 size={20} />}
          label="Authorized offices"
          value={offices?.length ?? 0}
        />

        <StatCard
          icon={<ClipboardList size={20} />}
          label="Open requests"
          value={openRequests}
        />

        <StatCard
          icon={<ClipboardList size={20} />}
          label="Requests shown"
          value={requests?.length ?? 0}
        />
      </div>

      <Panel
        title="Your offices"
        text="Office memberships assigned to your account."
      >
        <div className="grid gap-3 md:grid-cols-2">
          {(offices ?? []).map((office) => (
            <div
              key={office.id}
              className="rounded-2xl border border-slate-200 p-4"
            >
              <p className="font-bold text-ink">
                {office.name}
              </p>

              <p className="mt-1 text-xs capitalize text-slate-500">
                {office.type.replaceAll("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </Panel>

      <div id="assigned-requests">
        <Panel
          title="Assigned requests"
          text="Only requests assigned to your authorized offices are displayed."
        >
          <Table
            head={[
              "Reference",
              "Subject",
              "Category",
              "Office",
              "Status",
              "Submitted",
            ]}
            rows={requests?.length ?? 0}
            empty="No requests are currently assigned to your offices."
          >
            {(requests ?? []).map((request) => (
              <tr key={request.id}>
                <td className={`${cell} font-mono text-xs`}>
                  <Link
                    href={`/office/requests/${request.id}`}
                    className="font-bold text-brand-700 underline-offset-4 hover:underline"
                  >
                    {request.reference_no ?? "Open request"}
                  </Link>
                </td>

                <td className={cell}>
                  <span className="font-bold text-ink">
                    {request.subject}
                  </span>
                </td>

                <td className={cell}>
                  {request.category || "—"}
                </td>

                <td className={cell}>
                  {officeMap.get(
                    request.assigned_office_id,
                  ) ?? "—"}
                </td>

                <td className={cell}>
                  <StatusBadge
                    status={request.status}
                    fallback="Submitted"
                  />
                </td>

                <td className={cell}>
                  {formatDate(request.created_at)}
                </td>
              </tr>
            ))}
          </Table>
        </Panel>
      </div>
    </div>
  );
}