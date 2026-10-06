import type { Metadata } from "next";
import { AlertTriangle, MessageCircle, MessagesSquare } from "lucide-react";

import { AdminHeader, Panel, StatCard, StatusBadge, Table, cell } from "@/components/admin";
import { Badge, ButtonLink } from "@/components/ui";
import { requireSuperadmin } from "@/lib/admin";
import { formatDateTime } from "@/lib/format";
import { createAdminClient } from "@/lib/supabase/admin-client";

export const metadata: Metadata = { title: "WhatsApp" };

type Conversation = {
  id: string;
  phone_number: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
};

type Message = {
  id: string;
  direction: "inbound" | "outbound";
  message_type: string;
  body: string | null;
  status: string;
  created_at: string;
};

export default async function WhatsAppAdminPage() {
  await requireSuperadmin();

  const supabase = createAdminClient();

  const [conversationsResult, messagesResult, failedResult, queuedResult] = await Promise.all([
    supabase
      .from("whatsapp_conversations")
      .select("id, phone_number, status, last_message_at, created_at", { count: "exact" })
      .order("last_message_at", { ascending: false, nullsFirst: false })
      .limit(15),
    supabase
      .from("whatsapp_messages")
      .select("id, direction, message_type, body, status, created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(15),
    supabase
      .from("notification_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .eq("status", "failed"),
    supabase
      .from("notification_deliveries")
      .select("id", { count: "exact", head: true })
      .eq("channel", "whatsapp")
      .eq("status", "queued"),
  ]);

  const conversations = (conversationsResult.data ?? []) as Conversation[];
  const messages = (messagesResult.data ?? []) as Message[];
  const configured = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_VERIFY_TOKEN);

  return (
    <div className="space-y-8">
      <AdminHeader
        eyebrow="Service desk"
        title="WhatsApp"
        text="Resident conversations through the WhatsApp Business webhook, and the delivery status of outbound notifications."
        action={
          <ButtonLink href="/superadmin/routing" variant="outline" size="sm">
            Request routing
          </ButtonLink>
        }
      />

      {!configured && (
        <p
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-100/60 p-4 text-sm leading-6 text-gold-700"
        >
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          WhatsApp is not fully configured on this deployment. Set WHATSAPP_ACCESS_TOKEN and
          WHATSAPP_VERIFY_TOKEN, then point the Meta webhook at /api/whatsapp/webhook.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<MessagesSquare size={20} />} label="Conversations" value={conversationsResult.count ?? conversations.length} />
        <StatCard icon={<MessageCircle size={20} />} label="Messages" value={messagesResult.count ?? messages.length} />
        <StatCard icon={<MessageCircle size={20} />} label="Queued deliveries" value={queuedResult.count ?? 0} />
        <StatCard icon={<AlertTriangle size={20} />} label="Failed deliveries" value={failedResult.count ?? 0} />
      </div>

      <Panel title="Recent conversations" text="Most recently active first.">
        <Table
          head={["Phone", "Status", "Last message", "Started"]}
          rows={conversations.length}
          empty="No WhatsApp conversations yet."
        >
          {conversations.map((conversation) => (
            <tr key={conversation.id}>
              <td className={`${cell} font-mono text-xs font-bold text-ink`}>{conversation.phone_number}</td>
              <td className={cell}>
                <Badge tone={conversation.status === "open" ? "brand" : "slate"}>{conversation.status}</Badge>
              </td>
              <td className={cell}>{formatDateTime(conversation.last_message_at) ?? "—"}</td>
              <td className={cell}>{formatDateTime(conversation.created_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title="Recent messages" text="Inbound messages from residents and outbound replies.">
        <Table
          head={["Direction", "Message", "Status", "Time"]}
          rows={messages.length}
          empty="No WhatsApp messages yet."
        >
          {messages.map((message) => (
            <tr key={message.id}>
              <td className={cell}>
                <Badge tone={message.direction === "inbound" ? "gold" : "brand"}>{message.direction}</Badge>
              </td>
              <td className={`${cell} max-w-md`}>
                <span className="line-clamp-2 text-slate-700">{message.body || `[${message.message_type}]`}</span>
              </td>
              <td className={cell}>
                <StatusBadge status={message.status} />
              </td>
              <td className={cell}>{formatDateTime(message.created_at)}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
