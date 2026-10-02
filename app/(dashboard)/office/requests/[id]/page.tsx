import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  AdminHeader,
  Panel,
  StatusBadge,
} from "@/components/admin";

import RequestStatusForm from "@/components/office/request-status-form";

import { requireUser } from "@/lib/admin";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/format";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OfficeRequestDetailPage({
  params,
}: Props) {
  const user = await requireUser("/office");

  const { id } = await params;

  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("office_members")
    .select("office_id, role")
    .eq("user_id", user.id);

  if (!memberships?.length) {
    redirect("/dashboard?denied=office");
  }

  const officeIds = memberships.map(
    (item) => item.office_id,
  );

  const { data: request, error } = await supabase
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

  if (error || !request) {
    notFound();
  }

  const { data: updates } = await supabase
    .from("request_updates")
    .select(
      `
        id,
        status,
        message,
        created_at
      `,
    )
    .eq("request_id", request.id)
    .order("created_at", {
      ascending: false,
    });

  return (
    <div className="space-y-8">
      <Link
        href="/office"
        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        ← Back to office dashboard
      </Link>

      <AdminHeader
        eyebrow="Office request"
        title={
          request.reference_no ??
          "Resident request"
        }
        text={request.subject}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Panel
            title="Request details"
            text="Information submitted by the resident."
          >
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Subject
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
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
                <StatusBadge
                  status={request.status}
                  fallback="Submitted"
                />

                {request.category && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {request.category}
                  </span>
                )}
              </div>

              <div className="border-t border-slate-200 pt-5">
                <p className="text-xs text-slate-500">
                  Submitted
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {formatDate(request.created_at)}
                </p>
              </div>
            </div>
          </Panel>

          <Panel
            title="Request timeline"
            text="Updates recorded against this request."
          >
            {!updates?.length ? (
              <p className="text-sm text-slate-500">
                No updates have been recorded yet.
              </p>
            ) : (
              <div className="space-y-5">
                {updates.map((update) => (
                  <div
                    key={update.id}
                    className="border-l-2 border-slate-200 pl-4"
                  >
                    <StatusBadge
                      status={update.status}
                      fallback="Update"
                    />

                    {update.message && (
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {update.message}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-400">
                      {formatDate(update.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>

        <Panel
          title="Update request"
          text="Change the status and optionally add a message for the resident."
        >
          <RequestStatusForm
            requestId={request.id}
            currentStatus={request.status}
          />
        </Panel>
      </div>
    </div>
  );
}