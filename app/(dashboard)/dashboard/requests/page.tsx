import Link from "next/link";
import { Plus } from "lucide-react";

import {
  AdminHeader,
  Panel,
  StatusBadge,
  Table,
  cell,
} from "@/components/admin";

import { requireUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

export default async function ResidentRequestsPage() {
  const user = await requireUser("/dashboard/requests");

  const supabase = await createClient();

  const { data: requests } = await supabase
    .from("requests")
    .select(
      `
        id,
        reference_no,
        subject,
        category,
        status,
        created_at
      `,
    )
    .eq("resident_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Resident portal"
        title="My requests"
        text="Track the requests you have submitted."
      />

      <div className="flex justify-end">
        <Link
          href="/requests/new"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
        >
          <Plus className="h-4 w-4" />
          New Request
        </Link>
      </div>

      <Panel
        title="Request history"
        text="Your submitted service requests."
      >
        <Table
          head={[
            "Reference",
            "Subject",
            "Category",
            "Status",
            "Submitted",
          ]}
          rows={requests?.length ?? 0}
          empty="You have not submitted any requests yet."
        >
          {(requests ?? []).map((request) => (
            <tr key={request.id}>
              <td className={`${cell} font-mono text-xs`}>
                {request.reference_no ?? "—"}
              </td>

              <td className={cell}>
                <Link
                  href={`/dashboard/requests/${request.id}`}
                  className="font-bold hover:underline"
                >
                  {request.subject}
                </Link>
              </td>

              <td className={cell}>
                {request.category || "General"}
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
  );
}