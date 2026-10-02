import Link from "next/link";

import {
  createClient,
} from "@/lib/supabase/server";

export default async function WhatsAppAdminPage() {
  const supabase =
    await createClient();

  const [
    conversationsResult,
    messagesResult,
    failedResult,
  ] = await Promise.all([
    supabase
      .from("whatsapp_conversations")
      .select(
        "id, phone_number, status, last_message_at, created_at",
        {
          count: "exact",
        },
      )
      .order(
        "last_message_at",
        {
          ascending: false,
        },
      )
      .limit(10),

    supabase
      .from("whatsapp_messages")
      .select(
        "id, direction, message_type, body, status, created_at",
        {
          count: "exact",
        },
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(10),

    supabase
      .from("notification_deliveries")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("channel", "whatsapp")
      .eq("status", "failed"),
  ]);

  const conversations =
    conversationsResult.data ?? [];

  const messages =
    messagesResult.data ?? [];

  const failedCount =
    failedResult.count ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">
          WhatsApp
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor resident conversations and
          WhatsApp service delivery.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Recent conversations
          </p>

          <p className="mt-2 text-3xl font-bold">
            {conversations.length}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Recent messages
          </p>

          <p className="mt-2 text-3xl font-bold">
            {messages.length}
          </p>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">
            Failed deliveries
          </p>

          <p className="mt-2 text-3xl font-bold">
            {failedCount}
          </p>
        </div>
      </div>

      <section className="rounded-xl border">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            Recent conversations
          </h2>
        </div>

        <div className="divide-y">
          {conversations.map(
            (conversation) => (
              <div
                key={conversation.id}
                className="flex items-center justify-between p-5"
              >
                <div>
                  <p className="font-medium">
                    {conversation.phone_number}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {conversation.status}
                  </p>
                </div>

                <span className="text-sm text-muted-foreground">
                  {conversation.last_message_at
                    ? new Date(
                        conversation.last_message_at,
                      ).toLocaleString()
                    : "—"}
                </span>
              </div>
            ),
          )}

          {!conversations.length && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No WhatsApp conversations yet.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl border">
        <div className="border-b p-5">
          <h2 className="font-semibold">
            Recent messages
          </h2>
        </div>

        <div className="divide-y">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-5"
            >
              <div className="flex justify-between gap-4">
                <span className="text-sm font-medium">
                  {message.direction}
                </span>

                <span className="text-xs text-muted-foreground">
                  {new Date(
                    message.created_at,
                  ).toLocaleString()}
                </span>
              </div>

              <p className="mt-2 text-sm">
                {message.body ||
                  `[${message.message_type}]`}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {message.status}
              </p>
            </div>
          ))}

          {!messages.length && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No WhatsApp messages yet.
            </div>
          )}
        </div>
      </section>

      <Link
        href="/superadmin/routing"
        className="inline-flex rounded-lg border px-4 py-2 text-sm font-medium"
      >
        Configure Request Routing
      </Link>
    </div>
  );
}