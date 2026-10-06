import { NextRequest, NextResponse } from "next/server";

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

type RequestStatus = (typeof VALID_STATUSES)[number];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

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

    const status = body?.status as string | undefined;
    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    if (
      !status ||
      !VALID_STATUSES.includes(
        status as RequestStatus,
      )
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

    const nextStatus = status as RequestStatus;

    const supabase = await createClient();

    /*
     * --------------------------------------------------
     * 1. Verify authenticated user
     * --------------------------------------------------
     *
     * getClaims() verifies the JWT and is the recommended
     * Supabase method for protecting server-side data.
     */
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims();

    if (
      claimsError ||
      !claimsData?.claims?.sub
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

    const userId = claimsData.claims.sub;

    /*
     * --------------------------------------------------
     * 2. Load application profile
     * --------------------------------------------------
     */
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          "id, role, full_name, email",
        )
        .eq("id", userId)
        .maybeSingle();

    if (profileError) {
      console.error(
        "Profile lookup failed:",
        profileError,
      );

      return NextResponse.json(
        {
          error: "Unable to verify user permissions",
        },
        {
          status: 500,
        },
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          error: "User profile not found",
        },
        {
          status: 403,
        },
      );
    }

    const role = profile.role as string;

    const isPlatformAdmin =
      role === "admin" ||
      role === "superadmin";

    const isStaff =
      role === "staff" ||
      role === "office_admin" ||
      role === "org_admin" ||
      role === "admin" ||
      role === "superadmin";

    if (!isStaff) {
      return NextResponse.json(
        {
          error:
            "You are not authorized to update requests",
        },
        {
          status: 403,
        },
      );
    }

    /*
     * --------------------------------------------------
     * 3. Load request
     * --------------------------------------------------
     */
    const {
      data: existingRequest,
      error: requestError,
    } = await supabase
      .from("requests")
      .select(
        `
          id,
          reference_no,
          resident_id,
          organization_id,
          jurisdiction_id,
          assigned_office_id,
          subject,
          status,
          category
        `,
      )
      .eq("id", id)
      .maybeSingle();

    if (requestError) {
      console.error(
        "Request lookup failed:",
        requestError,
      );

      return NextResponse.json(
        {
          error: "Unable to load request",
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

    /*
     * --------------------------------------------------
     * 4. Verify office authorization
     * --------------------------------------------------
     *
     * Platform admins can manage all requests.
     *
     * Other staff members must belong to the office
     * currently assigned to this request.
     */
    let authorizedOfficeId:
      string | null = null;

    if (!isPlatformAdmin) {
      if (!existingRequest.assigned_office_id) {
        return NextResponse.json(
          {
            error:
              "This request has not been assigned to an office",
          },
          {
            status: 403,
          },
        );
      }

      const {
        data: membership,
        error: membershipError,
      } = await supabase
        .from("office_members")
        .select("office_id, user_id, role")
        .eq("user_id", userId)
        .eq(
          "office_id",
          existingRequest.assigned_office_id,
        )
        .maybeSingle();

      if (membershipError) {
        console.error(
          "Office membership lookup failed:",
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

      if (!membership) {
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

      authorizedOfficeId =
        membership.office_id;
    } else {
      authorizedOfficeId =
        existingRequest.assigned_office_id;
    }

    /*
     * --------------------------------------------------
     * 5. Update request
     * --------------------------------------------------
     */
    const previousStatus =
      existingRequest.status;

    const {
      data: updatedRequest,
      error: updateError,
    } = await supabase
      .from("requests")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
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
          subject,
          description,
          category,
          status,
          staff_notes,
          created_at,
          updated_at,
          routed_at
        `,
      )
      .single();

    if (updateError) {
      console.error(
        "Request update failed:",
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

    /*
     * --------------------------------------------------
     * 6. Add timeline/update entry
     * --------------------------------------------------
     */
    let timelineCreated = false;

    const updateMessage =
      message ||
      `Request status changed from "${previousStatus}" to "${nextStatus}".`;

    const {
      error: timelineError,
    } = await supabase
      .from("request_updates")
      .insert({
        request_id: id,
        author_id: userId,
        status: nextStatus,
        message: updateMessage,
      });

    if (timelineError) {
      /*
       * The request itself has already been updated.
       * Don't fail the entire response because the
       * timeline insert failed.
       *
       * This should be fixed at the RLS level by allowing
       * authorized office staff to INSERT request_updates.
       */
      console.error(
        "Request timeline insert failed:",
        timelineError,
      );
    } else {
      timelineCreated = true;
    }

    /*
     * --------------------------------------------------
     * 7. Notify resident
     * --------------------------------------------------
     */
    let notificationSent = false;

    try {
      await notifyResidentRequestStatus(id);
      notificationSent = true;
    } catch (notificationError) {
      /*
       * Notification failure should not undo a successful
       * request status update.
       */
      console.error(
        "WhatsApp notification failed:",
        notificationError,
      );
    }

    /*
     * --------------------------------------------------
     * 8. Return result
     * --------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,
        request: updatedRequest,
        meta: {
          previousStatus,
          newStatus: nextStatus,
          updatedBy: userId,
          role,
          officeId: authorizedOfficeId,
          timelineCreated,
          notificationSent,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Request status PATCH error:",
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