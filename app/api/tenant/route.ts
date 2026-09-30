import { NextResponse } from "next/server";
import { getPublicData } from "@/lib/reach";

export async function GET() {
  try {
    const { tenant, jurisdiction } = await getPublicData();

    return NextResponse.json({
      tenant,
      jurisdiction,
    });
  } catch (error) {
    console.error("Tenant API error:", error);

    return NextResponse.json(
      {
        error: "Unable to load tenant information",
      },
      {
        status: 500,
      }
    );
  }
}
