import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { notFound } from "next/navigation";

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

export default async function ResidentRequestDetailPage({
  params,
}: Props) {
  const user = await requireUser(
    "/dashboard/requests",
  );

  const { id } = await params;

  const supabase = await createClient();

  /*
   * Because this query is performed with the authenticated
   * Supabase client, the resident can only retrieve their
   * own request according to RLS.
   */
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
        assigned_office_id
      `,
    )
    .eq("id", id)
    .eq("resident_id", user.id)
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
        href="/dashboard/requests"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to my requests
      </Link>

      <AdminHeader
        eyebrow="Resident portal"
        title={
          request.reference_no ??
          "Request details"
        }
        text={request.subject}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel
          title="Request details"
          text="Information submitted with your request."
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
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
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
          text="Updates from the responsible office."
        >
          {!updates?.length ? (
            <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
              <Clock className="h-5 w-5 text-slate-400" />

              <p className="text-sm text-slate-600">
                No updates have been posted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {updates.map((update) => (
                <div
                  key={update.id}
                  className="relative border-l-2 border-slate-200 pl-5"
                >
                  <div className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-slate-900" />

                  <StatusBadge
                    status={update.status}
                    fallback="Update"
                  />

                  {update.message && (
                    <p className="mt-3 text-sm leading-6 text-slate-700">
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
    </div>
  );
}