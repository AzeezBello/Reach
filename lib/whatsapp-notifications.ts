import "server-only";

import {
  adminSupabase,
} from "@/lib/whatsapp-server";

import {
  sendWhatsAppText,
} from "@/lib/whatsapp";

const STATUS_LABELS: Record<
  string,
  string
> = {
  submitted: "Submitted",
  under_review: "Under Review",
  in_progress: "In Progress",
  resolved: "Resolved",
  closed: "Closed",
};

export async function notifyResidentRequestStatus(
  requestId: string,
) {
  const { data: request, error } =
    await adminSupabase()
      .from("requests")
      .select(
        `
          id,
          reference_no,
          category,
          status,
          organization_id,
          resident_id
        `,
      )
      .eq("id", requestId)
      .single();

  if (error) {
    throw error;
  }

  if (!request.resident_id) {
    return {
      skipped: true,
      reason: "No resident linked",
    };
  }

  const { data: resident } =
    await adminSupabase()
      .from("profiles")
      .select(
        `
          id,
          phone,
          full_name
        `,
      )
      .eq(
        "id",
        request.resident_id,
      )
      .single();

  if (!resident?.phone) {
    return {
      skipped: true,
      reason: "Resident has no phone",
    };
  }

  const { data: organization } =
    await adminSupabase()
      .from("organizations")
      .select(
        `
          id,
          name,
          whatsapp_phone_number_id
        `,
      )
      .eq(
        "id",
        request.organization_id,
      )
      .single();

  if (
    !organization?.whatsapp_phone_number_id
  ) {
    return {
      skipped: true,
      reason:
        "Organization has no WhatsApp phone number ID",
    };
  }

  const status =
    STATUS_LABELS[request.status] ??
    request.status;

  const message = [
    `*REACH Request Update*`,
    "",
    `Reference: *${request.reference_no}*`,
    `Category: ${request.category}`,
    `Status: *${status}*`,
    "",
    "Thank you for using REACH Resident Services.",
  ].join("\n");

  const result =
    await sendWhatsAppText({
      phone: resident.phone,
      phoneNumberId:
        organization.whatsapp_phone_number_id,
      message,
    });

  const providerMessageId =
    result.messages?.[0]?.id ?? null;

  const { data: notification } =
    await adminSupabase()
      .from("notifications")
      .insert({
        organization_id:
          request.organization_id,
        resident_id:
          request.resident_id,
        channel: "whatsapp",
        title: "Request status updated",
        message,
        status: "sent",
        sent_at:
          new Date().toISOString(),
      })
      .select("id")
      .single();

  if (notification) {
    await adminSupabase()
      .from("notification_deliveries")
      .insert({
        notification_id:
          notification.id,
        channel: "whatsapp",
        provider: "meta",
        provider_message_id:
          providerMessageId,
        status: "sent",
        attempts: 1,
        sent_at:
          new Date().toISOString(),
      });
  }

  return {
    sent: true,
    providerMessageId,
  };
}