import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  processIncomingWhatsAppMessage,
} from "@/lib/whatsapp-server";

export const runtime = "nodejs";

function getWebhookToken() {
  return process.env.WHATSAPP_VERIFY_TOKEN;
}

export async function GET(
  request: NextRequest,
) {
  const searchParams =
    request.nextUrl.searchParams;

  const mode =
    searchParams.get("hub.mode");

  const token =
    searchParams.get("hub.verify_token");

  const challenge =
    searchParams.get("hub.challenge");

  const expectedToken =
    getWebhookToken();

  if (
    mode === "subscribe" &&
    token &&
    expectedToken &&
    token === expectedToken
  ) {
    return new NextResponse(
      challenge || "",
      {
        status: 200,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }

  return NextResponse.json(
    {
      error: "Webhook verification failed",
    },
    {
      status: 403,
    },
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    if (
      body?.object !== "whatsapp_business_account"
    ) {
      return NextResponse.json({
        received: true,
      });
    }

    const entries = body.entry ?? [];

    for (const entry of entries) {
      const changes =
        entry.changes ?? [];

      for (const change of changes) {
        const value = change.value;

        if (!value?.messages) {
          continue;
        }

        const phoneNumberId =
          value.metadata?.phone_number_id;

        if (!phoneNumberId) {
          continue;
        }

        for (const message of value.messages) {
          if (message.type !== "text") {
            continue;
          }

          await processIncomingWhatsAppMessage({
            messageId: message.id,
            phoneNumberId,
            from: message.from,
            type: message.type,
            body:
              message.text?.body ?? "",
            timestamp:
              message.timestamp,
          });
        }
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error) {
    console.error(
      "WhatsApp webhook error:",
      error,
    );

    // Always acknowledge Meta quickly.
    return NextResponse.json({
      received: true,
    });
  }
}