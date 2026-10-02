import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const problemText = String(body.problemText ?? "").trim();
    const jurisdictionId = body.jurisdictionId || null;

    if (problemText.length < 3) {
      return NextResponse.json(
        {
          error: "Please describe your issue in a little more detail.",
        },
        { status: 400 },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "find_service_for_request",
      {
        problem_text: problemText,
        target_jurisdiction: jurisdictionId,
      },
    );

    if (error) {
      console.error("Service directory error:", error);

      return NextResponse.json(
        {
          error: "Unable to determine the appropriate office.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      matches: data ?? [],
    });
  } catch (error) {
    console.error("Service directory API error:", error);

    return NextResponse.json(
      {
        error: "Invalid request.",
      },
      { status: 400 },
    );
  }
}