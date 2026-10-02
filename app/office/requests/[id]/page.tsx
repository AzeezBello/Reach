import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AdminHeader,
  Panel,
  StatusBadge,
} from "@/components/admin";

import { requireUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RequestDetailPage({
  params,
}: Props) {
  const user = await requireUser("/office");

  const { id } = await params;

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("office_members")
    .select("office_id")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    redirect("/dashboard?denied=office");
  }

  const officeIds = memberships.map(
    (item) => item.office_id,
  );

  const { data: request } = await supabase
    .from("requests")
    .select(
      `
        id,
        reference_no,
        subject,
        description,
        category,
        status,
        created_at,
        updated_at,
        assigned_office_id,
        organization_id,
        jurisdiction_id
      `,
    )
    .eq("id", id)
    .in("assigned_office_id", officeIds)
    .maybeSingle();

  if (!request) {
    notFound();
  }

  const { data: updates } = await supabase
    .from("request_updates")
    .select("*")
    .eq("request_id", request.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Request"
        title={request.reference_no ?? "Resident request"}
        text={request.subject}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel
          title="Request details"
          text="Information submitted by the resident."
        >
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Subject
              </p>

              <p className="mt-2 text-lg font-bold">
                {request.subject}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {request.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                {request.category || "General"}
              </span>

              <StatusBadge
                status={request.status}
                fallback="Submitted"
              />
            </div>
          </div>
        </Panel>

        <Panel
          title="Request timeline"
          text="Updates recorded against this request."
        >
          <div className="space-y-5">
            {!updates?.length && (
              <p className="text-sm text-slate-500">
                No updates have been recorded yet.
              </p>
            )}

            {(updates ?? []).map((update) => (
              <div
                key={update.id}
                className="border-l-2 border-slate-200 pl-4"
              >
                <p className="font-semibold text-slate-900">
                  {update.status || "Update"}
                </p>

                {update.message && (
                  <p className="mt-1 text-sm text-slate-600">
                    {update.message}
                  </p>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  {formatDate(update.created_at)}
                </p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Link
        href="/office"
        className="inline-flex rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold"
      >
        Back to office dashboard
      </Link>
    </div>
  );
}