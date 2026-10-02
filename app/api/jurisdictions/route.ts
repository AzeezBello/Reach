import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("jurisdictions")
      .select(
        `
          id,
          name,
          type,
          parent_id
        `,
      )
      .order("type")
      .order("name");

    if (error) {
      console.error(
        "Jurisdiction query error:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "Unable to load jurisdictions.",
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      jurisdictions: data ?? [],
    });
  } catch (error) {
    console.error(
      "Jurisdiction API error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to load jurisdictions.",
      },
      { status: 500 },
    );
  }
}