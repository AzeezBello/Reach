import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  adminSupabase,
} from "@/lib/whatsapp-server";

import {
  sendWhatsAppText,
} from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
) {
  const secret =
    request.headers.get(
      "x-reach-internal-secret",
    );

  if (
    !process.env.REACH_INTERNAL_SECRET ||
    secret !==
      process.env.REACH_INTERNAL_SECRET
  ) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const { data: deliveries, error } =
      await adminSupabase()
        .from("notification_deliveries")
        .select(
          `
            id,
            notification_id,
            attempts,
            notifications (
              id,
              organization_id,
              resident_id,
              title,
              message
            )
          `,
        )
        .eq("channel", "whatsapp")
        .eq("status", "queued")
        .order("created_at", {
          ascending: true,
        })
        .limit(20);

    if (error) {
      throw error;
    }

    let sent = 0;
    let failed = 0;

    for (const delivery of deliveries ?? []) {
      try {
        const notification = Array.isArray(
          delivery.notifications,
        )
          ? delivery.notifications[0]
          : delivery.notifications;

        if (!notification) {
          continue;
        }

        const { data: resident } =
          await adminSupabase()
            .from("profiles")
            .select(
              `
                id,
                phone
              `,
            )
            .eq(
              "id",
              notification.resident_id,
            )
            .single();

        const { data: organization } =
          await adminSupabase()
            .from("organizations")
            .select(
              `
                id,
                whatsapp_phone_number_id
              `,
            )
            .eq(
              "id",
              notification.organization_id,
            )
            .single();

        if (
          !resident?.phone ||
          !organization?.whatsapp_phone_number_id
        ) {
          throw new Error(
            "Resident phone or WhatsApp phone number ID missing",
          );
        }

        const result =
          await sendWhatsAppText({
            phone: resident.phone,
            phoneNumberId:
              organization.whatsapp_phone_number_id,
            message:
              notification.message,
          });

        const providerMessageId =
          result.messages?.[0]?.id ?? null;

        await adminSupabase()
          .from("notification_deliveries")
          .update({
            status: "sent",
            provider: "meta",
            provider_message_id:
              providerMessageId,
            attempts:
              (delivery.attempts ?? 0) + 1,
            sent_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            delivery.id,
          );

        sent++;
      } catch (error) {
        failed++;

        await adminSupabase()
          .from("notification_deliveries")
          .update({
            status: "failed",
            attempts:
              (delivery.attempts ?? 0) + 1,
            last_error:
              error instanceof Error
                ? error.message
                : "Unknown error",
          })
          .eq(
            "id",
            delivery.id,
          );
      }
    }

    return NextResponse.json({
      success: true,
      sent,
      failed,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "WhatsApp dispatch failed",
      },
      {
        status: 500,
      },
    );
  }
}