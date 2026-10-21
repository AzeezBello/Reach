import { NextResponse } from "next/server";
import { createClient } from "@/lib/neon/server";

export async function GET() {
  try {
    const db = await createClient();

    const { data, error } = await db
      .from("jurisdictions")
      .select(
        `
          id,
          name,
          slug,
          type,
          state,
          lga,
          lcda,
          ward,
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