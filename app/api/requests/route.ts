import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/neon/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const subject = String(body.subject ?? "").trim();
    const rawDescription = String(body.description ?? "").trim();
    const jurisdictionId = body.jurisdictionId || null;
    const isPublic = body.isPublic === true;
    const postcode =
      typeof body.postcode === "string" && body.postcode.trim().length > 0
        ? body.postcode.trim().toUpperCase()
        : null;

    if (subject.length < 3) {
      return NextResponse.json(
        {
          error: "Please enter a valid subject.",
        },
        { status: 400 },
      );
    }

    if (rawDescription.length < 10) {
      return NextResponse.json(
        {
          error: "Please provide more details about your request.",
        },
        { status: 400 },
      );
    }

    const description =
      postcode && !rawDescription.includes(postcode)
        ? `${rawDescription}\n\n[NIPOST Digital Postcode (L1 Verified): ${postcode}]`
        : rawDescription;

    const db = await createClient();

    const { data, error } = await db.rpc(
      "create_routed_request",
      {
        request_subject: subject,
        request_description: description,
        target_jurisdiction: jurisdictionId,
      },
    );

    if (error) {
      console.error("Create request error:", error);

      return NextResponse.json(
        {
          error: error.message || "Unable to create request.",
        },
        { status: 500 },
      );
    }

    const result = Array.isArray(data) ? data[0] : data;

    if (isPublic && result?.request_id) {
      const { error: shareError } = await db.rpc("set_request_visibility", {
        target_request: result.request_id,
        make_public: true,
      });

      if (shareError) {
        console.error("Share request error:", shareError);
      }
    }

    return NextResponse.json({
      success: true,
      request: result ? { ...result, postcode } : result,
    });
  } catch (error) {
    console.error("Request API error:", error);

    return NextResponse.json(
      {
        error: "Unable to process your request.",
      },
      { status: 400 },
    );
  }
}