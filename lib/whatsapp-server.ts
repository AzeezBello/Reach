import "server-only";

import { sendWhatsAppText } from "@/lib/whatsapp";

import { createAdminClient } from "@/lib/supabase/admin-client";

/**
 * Service-role client for webhook processing. Created lazily so that a
 * missing environment variable surfaces as a request-time error instead of
 * crashing every route that imports this module at build time.
 */
export function adminSupabase() {
  return createAdminClient();
}

export type IncomingWhatsAppMessage = {
  messageId: string;
  phoneNumberId: string;
  from: string;
  type: string;
  body: string;
  timestamp?: string;
};

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function normalizeCategory(category: string) {
  return category
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function formatPhoneForStorage(phone: string) {
  return normalizePhone(phone);
}

async function resolveOrganization(
  phoneNumberId: string,
) {
  const { data, error } = await adminSupabase()
    .from("organizations")
    .select(
      `
        id,
        name,
        whatsapp_phone_number_id
      `,
    )
    .eq(
      "whatsapp_phone_number_id",
      phoneNumberId,
    )
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return data;
  }

  const defaultOrganization =
    process.env.REACH_DEFAULT_ORGANIZATION_ID;

  if (!defaultOrganization) {
    throw new Error(
      "No WhatsApp organization mapping found",
    );
  }

  const {
    data: fallback,
    error: fallbackError,
  } = await adminSupabase()
    .from("organizations")
    .select(
      `
        id,
        name,
        whatsapp_phone_number_id
      `,
    )
    .eq("id", defaultOrganization)
    .eq("is_active", true)
    .single();

  if (fallbackError) {
    throw fallbackError;
  }

  return fallback;
}

async function findResidentByPhone(
  phone: string,
) {
  const normalized = normalizePhone(phone);

  const candidates = [
    normalized,
    normalized.startsWith("+")
      ? normalized.substring(1)
      : `+${normalized}`,
  ];

  const { data, error } = await adminSupabase()
    .from("profiles")
    .select(
      `
        id,
        full_name,
        phone,
        email,
        role
      `,
    )
    .in("phone", candidates)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

async function getOrCreateConversation({
  organizationId,
  phone,
  residentId,
}: {
  organizationId: string;
  phone: string;
  residentId?: string | null;
}) {
  const storedPhone =
    formatPhoneForStorage(phone);

  const {
    data: existing,
    error,
  } = await adminSupabase()
    .from("whatsapp_conversations")
    .select("*")
    .eq(
      "organization_id",
      organizationId,
    )
    .eq("phone_number", storedPhone)
    .eq("status", "open")
    .order("created_at", {
      ascending: false,
    })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (existing) {
    if (
      residentId &&
      existing.resident_id !== residentId
    ) {
      await adminSupabase()
        .from("whatsapp_conversations")
        .update({
          resident_id: residentId,
          last_message_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", existing.id);
    }

    return existing;
  }

  const {
    data,
    error: insertError,
  } = await adminSupabase()
    .from("whatsapp_conversations")
    .insert({
      organization_id: organizationId,
      resident_id: residentId ?? null,
      phone_number: storedPhone,
      status: "open",
      last_message_at:
        new Date().toISOString(),
    })
    .select("*")
    .single();

  if (insertError) {
    throw insertError;
  }

  return data;
}

async function storeIncomingMessage({
  conversationId,
  message,
}: {
  conversationId: string;
  message: IncomingWhatsAppMessage;
}) {
  const { data: existing } =
    await adminSupabase()
      .from("whatsapp_messages")
      .select("id")
      .eq(
        "provider_message_id",
        message.messageId,
      )
      .maybeSingle();

  if (existing) {
    return {
      duplicate: true,
      id: existing.id,
    };
  }

  const {
    data,
    error,
  } = await adminSupabase()
    .from("whatsapp_messages")
    .insert({
      conversation_id: conversationId,
      direction: "inbound",
      provider_message_id:
        message.messageId,
      message_type: message.type,
      body: message.body || null,
      status: "received",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return {
    duplicate: false,
    id: data.id,
  };
}

async function findRoute({
  organizationId,
  category,
}: {
  organizationId: string;
  category: string;
}) {
  const normalized =
    normalizeCategory(category);

  const {
    data,
    error,
  } = await adminSupabase()
    .from("service_routes")
    .select(
      `
        id,
        organization_id,
        jurisdiction_id,
        category,
        office_id,
        priority,
        is_active,
        offices (
          id,
          name,
          type
        )
      `,
    )
    .eq(
      "organization_id",
      organizationId,
    )
    .eq("is_active", true)
    .order("priority", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return null;
  }

  const exact = data.find(
    (route) =>
      route.category &&
      normalizeCategory(route.category) ===
        normalized,
  );

  if (exact) {
    return exact;
  }

  const general = data.find(
    (route) => !route.category,
  );

  return general ?? null;
}

function parseRequestMessage(body: string) {
  const trimmed = body.trim();

  if (!trimmed) {
    return {
      type: "unknown" as const,
    };
  }

  const lower = trimmed.toLowerCase();

  if (
    ["hi", "hello", "hey", "start"].includes(
      lower,
    )
  ) {
    return {
      type: "greeting" as const,
    };
  }

  if (
    ["help", "menu", "options"].includes(
      lower,
    )
  ) {
    return {
      type: "help" as const,
    };
  }

  if (
    lower === "status" ||
    lower.startsWith("status ")
  ) {
    return {
      type: "status" as const,
      reference: trimmed
        .substring(6)
        .trim(),
    };
  }

  if (lower.startsWith("request ")) {
    const content = trimmed
      .substring(8)
      .trim();

    const separator =
      content.indexOf(":");

    if (separator !== -1) {
      return {
        type: "request" as const,
        category: content
          .substring(0, separator)
          .trim(),
        description: content
          .substring(separator + 1)
          .trim(),
      };
    }

    return {
      type: "request" as const,
      category: "General",
      description: content,
    };
  }

  return {
    type: "request" as const,
    category: "General",
    description: trimmed,
  };
}

async function createReachRequest({
  organizationId,
  residentId,
  category,
  description,
}: {
  organizationId: string;
  residentId?: string | null;
  category: string;
  description: string;
}) {
  const route = await findRoute({
    organizationId,
    category,
  });

  const {
    data: request,
    error,
  } = await adminSupabase()
    .from("requests")
    .insert({
      organization_id: organizationId,
      resident_id: residentId ?? null,
      category,
      subject: `WhatsApp Request: ${category}`,
      description,
      status: "submitted",
      assigned_office_id:
        route?.office_id ?? null,
      routed_at: route
        ? new Date().toISOString()
        : null,
    })
    .select(
      `
        id,
        reference_no,
        category,
        subject,
        description,
        status,
        assigned_office_id
      `,
    )
    .single();

  if (error) {
    throw error;
  }

  return {
    request,
    route,
  };
}

async function createNotification({
  organizationId,
  residentId,
  title,
  message,
}: {
  organizationId: string;
  residentId: string;
  title: string;
  message: string;
}) {
  const {
    data,
    error,
  } = await adminSupabase()
    .from("notifications")
    .insert({
      organization_id: organizationId,
      resident_id: residentId,
      channel: "whatsapp",
      title,
      message,
      status: "queued",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function sendAndRecordWhatsApp({
  phone,
  phoneNumberId,
  conversationId,
  message,
}: {
  phone: string;
  phoneNumberId: string;
  conversationId: string;
  message: string;
}) {
  const result = await sendWhatsAppText({
    phone,
    message,
    phoneNumberId,
  });

  const providerMessageId =
    result.messages?.[0]?.id ?? null;

  const {
    data: stored,
    error,
  } = await adminSupabase()
    .from("whatsapp_messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      provider_message_id:
        providerMessageId,
      message_type: "text",
      body: message,
      status: "sent",
    })
    .select("id")
    .single();

  if (error) {
    console.error(
      "Failed storing outbound WhatsApp message",
      error,
    );
  }

  return {
    providerMessageId,
    messageId: stored?.id ?? null,
  };
}

async function statusLookup({
  organizationId,
  reference,
  residentId,
}: {
  organizationId: string;
  reference: string;
  residentId?: string | null;
}) {
  if (!reference) {
    return null;
  }

  let query = adminSupabase()
    .from("requests")
    .select(
      `
        id,
        reference_no,
        category,
        subject,
        status,
        created_at,
        assigned_office_id
      `,
    )
    .eq(
      "organization_id",
      organizationId,
    )
    .eq("reference_no", reference)
    .limit(1);

  if (residentId) {
    query = query.eq(
      "resident_id",
      residentId,
    );
  }

  const {
    data,
    error,
  } = await query.maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function helpMessage() {
  return [
    "*REACH Resident Services*",
    "",
    "You can send:",
    "",
    "• REQUEST Education: I need help with school fees",
    "• REQUEST Health: I need assistance with healthcare",
    "• REQUEST Infrastructure: Streetlight is not working",
    "• STATUS FKL-12345678",
    "",
    "You can also simply describe your issue and REACH will route it to the appropriate office.",
  ].join("\n");
}

function greetingMessage(
  organizationName: string,
) {
  return [
    `Welcome to *${organizationName} Resident Services*.`,
    "",
    "How can we help you today?",
    "",
    "Reply *HELP* to see available options.",
  ].join("\n");
}

export async function processIncomingWhatsAppMessage(
  message: IncomingWhatsAppMessage,
) {
  const organization =
    await resolveOrganization(
      message.phoneNumberId,
    );

  const resident =
    await findResidentByPhone(
      message.from,
    );

  const conversation =
    await getOrCreateConversation({
      organizationId: organization.id,
      phone: message.from,
      residentId:
        resident?.id ?? null,
    });

  const stored =
    await storeIncomingMessage({
      conversationId: conversation.id,
      message,
    });

  if (stored.duplicate) {
    return {
      duplicate: true,
    };
  }

  await adminSupabase()
    .from("whatsapp_conversations")
    .update({
      last_message_at:
        new Date().toISOString(),
      updated_at:
        new Date().toISOString(),
    })
    .eq("id", conversation.id);

  const parsed =
    parseRequestMessage(message.body);

  if (parsed.type === "greeting") {
    await sendAndRecordWhatsApp({
      phone: message.from,
      phoneNumberId:
        message.phoneNumberId,
      conversationId: conversation.id,
      message: greetingMessage(
        organization.name,
      ),
    });

    return {
      handled: true,
      type: parsed.type,
    };
  }

  if (parsed.type === "help") {
    await sendAndRecordWhatsApp({
      phone: message.from,
      phoneNumberId:
        message.phoneNumberId,
      conversationId: conversation.id,
      message: helpMessage(),
    });

    return {
      handled: true,
      type: parsed.type,
    };
  }

  if (parsed.type === "status") {
    const request =
      await statusLookup({
        organizationId:
          organization.id,
        reference:
          parsed.reference || "",
        residentId:
          resident?.id ?? null,
      });

    const response = request
      ? [
          `*Request ${request.reference_no}*`,
          "",
          `Category: ${request.category}`,
          `Status: ${request.status.replaceAll(
            "_",
            " ",
          )}`,
        ].join("\n")
      : "I couldn't find that request. Please check the reference number and try again.";

    await sendAndRecordWhatsApp({
      phone: message.from,
      phoneNumberId:
        message.phoneNumberId,
      conversationId: conversation.id,
      message: response,
    });

    return {
      handled: true,
      type: parsed.type,
      requestId: request?.id ?? null,
    };
  }

  if (parsed.type === "request") {
    const {
      request,
      route,
    } = await createReachRequest({
      organizationId: organization.id,
      residentId:
        resident?.id ?? null,
      category: parsed.category,
      description:
        parsed.description,
    });

    let response = [
      "Your request has been received.",
      "",
      `Reference: *${request.reference_no}*`,
      `Category: ${request.category}`,
      "Status: Submitted",
    ];

    /*
     * Supabase nested relationships may be
     * returned as an array depending on the
     * relationship cardinality.
     *
     * Normalize the value before accessing
     * the office name.
     */
    const assignedOffice = Array.isArray(
      route?.offices,
    )
      ? route.offices[0]
      : route?.offices;

    if (assignedOffice) {
      response.push(
        `Assigned office: ${assignedOffice.name}`,
      );
    } else {
      response.push(
        "The request will be reviewed and routed to the appropriate office.",
      );
    }

    response.push(
      "",
      `Reply *STATUS ${request.reference_no}* at any time to check your request.`,
    );

    await sendAndRecordWhatsApp({
      phone: message.from,
      phoneNumberId:
        message.phoneNumberId,
      conversationId: conversation.id,
      message:
        response.join("\n"),
    });

    if (resident?.id) {
      const notification =
        await createNotification({
          organizationId:
            organization.id,
          residentId: resident.id,
          title:
            "WhatsApp request received",
          message: `Your request ${request.reference_no} has been received.`,
        });

      await adminSupabase()
        .from("notification_deliveries")
        .insert({
          notification_id:
            notification.id,
          channel: "whatsapp",
          provider: "meta",
          provider_message_id:
            null,
          status: "sent",
          attempts: 1,
          sent_at:
            new Date().toISOString(),
        });
    }

    return {
      handled: true,
      type: parsed.type,
      requestId: request.id,
      referenceNo:
        request.reference_no,
      officeId:
        route?.office_id ?? null,
    };
  }

  return {
    handled: false,
  };
}