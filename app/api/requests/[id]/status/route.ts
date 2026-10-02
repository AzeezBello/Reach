import {
  NextRequest,
  NextResponse,
} from "next/server";

import { createClient } from "@/lib/supabase/server";

import {
  notifyResidentRequestStatus,
} from "@/lib/whatsapp-notifications";

const VALID_STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "resolved",
  "closed",
] as const;

type RequestStatus =
  (typeof VALID_STATUSES)[number];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * PATCH /api/requests/[id]/status
 *
 * Authorization:
 *
 * - Resident:
 *   Cannot change request status.
 *
 * - Office staff:
 *   Can change status only for requests assigned
 *   to an office they belong to.
 *
 * - admin / superadmin:
 *   Can change any request.
 *
 * RLS remains the database-level protection.
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Request ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    const status = body?.status as
      | RequestStatus
      | undefined;

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    /*
     * Validate status before touching Supabase.
     */
    if (
      !status ||
      !VALID_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          error: "Invalid status",
          validStatuses: VALID_STATUSES,
        },
        {
          status: 400,
        },
      );
    }

    /*
     * Limit optional staff message length.
     */
    if (message.length > 2000) {
      return NextResponse.json(
        {
          error:
            "Status message must be 2000 characters or less",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    /* -------------------------------------------------------------- */
    /* Authenticate                                                   */
    /* -------------------------------------------------------------- */

    const {
      data: claimsData,
      error: claimsError,
    } = await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims?.sub
    ) {
      return NextResponse.json(
        {
          error: "Authentication required",
        },
        {
          status: 401,
        },
      );
    }

    const userId = claimsData.claims.sub;

    /* -------------------------------------------------------------- */
    /* Get current user/profile                                       */
    /* -------------------------------------------------------------- */

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        "id, full_name, role, email",
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "Unable to load profile:",
        profileError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to verify account",
        },
        {
          status: 500,
        },
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "Profile not found",
        },
        {
          status: 403,
        },
      );
    }

    const isPlatformAdmin =
      profile.role === "admin" ||
      profile.role === "superadmin";

    /* -------------------------------------------------------------- */
    /* Get request                                                    */
    /* -------------------------------------------------------------- */

    const {
      data: existingRequest,
      error: requestError,
    } = await supabase
      .from("requests")
      .select(
        `
        id,
        resident_id,
        organization_id,
        jurisdiction_id,
        assigned_office_id,
        status,
        reference_no,
        subject
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      console.error(
        "Unable to load request:",
        requestError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load request",
        },
        {
          status: 500,
        },
      );
    }

    if (!existingRequest) {
      return NextResponse.json(
        {
          error: "Request not found",
        },
        {
          status: 404,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Authorization                                                  */
    /* -------------------------------------------------------------- */

    let authorized = isPlatformAdmin;

    let officeMembership: {
      office_id: string;
      user_id: string;
      role: string;
    } | null = null;

    /*
     * Non-admin users must belong to the office assigned
     * to this request.
     */
    if (
      !authorized &&
      existingRequest.assigned_office_id
    ) {
      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("office_members")
        .select(
          "office_id, user_id, role",
        )
        .eq(
          "office_id",
          existingRequest.assigned_office_id,
        )
        .eq("user_id", userId)
        .maybeSingle();

      if (membershipError) {
        console.error(
          "Unable to verify office membership:",
          membershipError,
        );

        return NextResponse.json(
          {
            error:
              "Unable to verify office authorization",
          },
          {
            status: 500,
          },
        );
      }

      if (membership) {
        authorized = true;

        officeMembership =
          membership;
      }
    }

    if (!authorized) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to update this request",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * Prevent residents or arbitrary users from manipulating
     * the status through this endpoint.
     *
     * Even if a future policy accidentally gives a resident
     * access to the request row, this endpoint still refuses
     * the status change.
     */
    if (
      profile.role !== "staff" &&
      profile.role !== "admin" &&
      profile.role !== "superadmin"
    ) {
      return NextResponse.json(
        {
          error:
            "Only authorized office staff can update request status",
        },
        {
          status: 403,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* No-op status update                                            */
    /* -------------------------------------------------------------- */

    if (
      existingRequest.status === status &&
      !message
    ) {
      return NextResponse.json({
        success: true,
        unchanged: true,
        request: existingRequest,
      });
    }

    /* -------------------------------------------------------------- */
    /* Update request                                                  */
    /* -------------------------------------------------------------- */

    const {
      data: updatedRequest,
      error: updateError,
    } = await supabase
      .from("requests")
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq("id", id)
      .select(
        `
        id,
        reference_no,
        resident_id,
        organization_id,
        jurisdiction_id,
        assigned_office_id,
        category,
        subject,
        description,
        status,
        staff_notes,
        created_at,
        updated_at
        `,
      )
      .single();

    if (updateError) {
      console.error(
        "Request status update failed:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            "Unable to update request",
          details:
            process.env.NODE_ENV ===
            "development"
              ? updateError.message
              : undefined,
        },
        {
          status: 500,
        },
      );
    }

    /* -------------------------------------------------------------- */
    /* Create request timeline entry                                  */
    /* -------------------------------------------------------------- */

    let timelineCreated = false;

    const timelineMessage =
      message ||
      `Request status changed to ${formatStatus(
        status,
      )}.`;

    const {
      error: timelineError,
    } = await supabase
      .from("request_updates")
      .insert({
        request_id: id,
        status,
        message: timelineMessage,
        author_id: userId,
      });

    if (timelineError) {
      /*
       * Do not roll back the actual status change just because
       * the timeline entry failed.
       *
       * This error should be investigated because the request
       * timeline should normally be writable by authorized
       * office staff.
       */
      console.error(
        "Request timeline insert failed:",
        timelineError,
      );
    } else {
      timelineCreated = true;
    }

    /* -------------------------------------------------------------- */
    /* WhatsApp notification                                          */
    /* -------------------------------------------------------------- */

    let notificationSent = false;

    try {
      await notifyResidentRequestStatus(
        id,
      );

      notificationSent = true;
    } catch (notificationError) {
      /*
       * Notification failure must not undo the request status
       * update.
       */
      console.error(
        "WhatsApp notification failed:",
        notificationError,
      );
    }

    /* -------------------------------------------------------------- */
    /* Response                                                       */
    /* -------------------------------------------------------------- */

    return NextResponse.json({
      success: true,

      request: updatedRequest,

      meta: {
        previousStatus:
          existingRequest.status,

        newStatus: status,

        updatedBy: userId,

        updatedByRole:
          profile.role,

        officeId:
          officeMembership?.office_id ??
          existingRequest.assigned_office_id ??
          null,

        timelineCreated,

        notificationSent,
      },
    });
  } catch (error) {
    console.error(
      "PATCH /api/requests/[id]/status failed:",
      error,
    );

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

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatStatus(
  status: RequestStatus,
) {
  switch (status) {
    case "submitted":
      return "Submitted";

    case "under_review":
      return "Under Review";

    case "in_progress":
      return "In Progress";

    case "resolved":
      return "Resolved";

    case "closed":
      return "Closed";

    default:
      return status;
  }
}