import "server-only";

const GRAPH_VERSION =
  process.env.WHATSAPP_GRAPH_VERSION || "v23.0";

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

function requireAccessToken() {
  if (!ACCESS_TOKEN) {
    throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
  }

  return ACCESS_TOKEN;
}

export type WhatsAppSendResult = {
  messaging_product: "whatsapp";
  contacts?: Array<{
    input: string;
    wa_id: string;
  }>;
  messages?: Array<{
    id: string;
  }>;
};

export async function sendWhatsAppText({
  phone,
  message,
  phoneNumberId,
}: {
  phone: string;
  message: string;
  phoneNumberId: string;
}): Promise<WhatsAppSendResult> {
  const token = requireAccessToken();

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "text",
        text: {
          preview_url: false,
          body: message,
        },
      }),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp API error:", data);

    throw new Error(
      data?.error?.message ||
        "WhatsApp message delivery failed",
    );
  }

  return data;
}