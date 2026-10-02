import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  createClient,
} from "@supabase/supabase-js";

import {
  notifyResidentRequestStatus,
} from "@/lib/whatsapp-notifications";

const supabaseUrl =
  process.env.SUPABASE_URL!;

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase =
  createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

const VALID_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "closed",
];

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const { id } =
      await context.params;

    const body =
      await request.json();

    const status =
      body?.status;

    if (
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          error: "Invalid status",
        },
        {
          status: 400,
        },
      );
    }

    const { data, error } =
      await supabase
        .from("requests")
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    try {
      await notifyResidentRequestStatus(
        id,
      );
    } catch (notificationError) {
      console.error(
        "WhatsApp notification failed:",
        notificationError,
      );
    }

    return NextResponse.json({
      success: true,
      request: data,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Unable to update request",
      },
      {
        status: 500,
      },
    );
  }
}