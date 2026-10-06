import type { Metadata } from "next";
import { Bell } from "lucide-react";

import { AdminHeader, Panel } from "@/components/admin";
import { Badge, ButtonLink } from "@/components/ui";
import { requireUser } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

type NotificationRow = {
  id: string;
  title: string | null;
  message: string | null;
  channel: string | null;
  status: string | null;
  created_at: string;
  sent_at: string | null;
};

export default async function NotificationsPage() {
  const user = await requireUser("/dashboard/notifications");
  const supabase = await createClient();

  const { data } = await supabase
    .from("notifications")
    .select("id, title, message, channel, status, created_at, sent_at")
    .eq("resident_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const notifications = (data ?? []) as NotificationRow[];

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Resident portal"
        title="Notifications"
        text="Updates from the office about your requests, programmes and events."
      />

      <Panel title="All notifications" text={`${notifications.length} received`}>
        {notifications.length === 0 ? (
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-slate-200">
              <Bell size={20} />
            </span>
            <p className="flex-1 text-sm leading-6 text-slate-600">
              Nothing yet. You will be notified here when the office updates one of your requests.
            </p>
            <ButtonLink href="/requests/new" size="sm">
              Submit a request
            </ButtonLink>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <Bell size={16} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-ink">{notification.title || "Update"}</p>
                    {notification.channel && <Badge tone="slate">{notification.channel}</Badge>}
                  </div>
                  {notification.message && (
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-slate-600">{notification.message}</p>
                  )}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDateTime(notification.sent_at ?? notification.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
