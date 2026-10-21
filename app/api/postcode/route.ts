import { NextResponse } from "next/server";
import {
  accepted,
  callNipost,
  runSuite,
  type Operation,
} from "@/lib/nipost";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store" };

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Send a JSON request body." } },
      { status: 400, headers },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      {
        error: {
          code: "invalid_json",
          message: "Send a JSON object request body.",
        },
      },
      { status: 400, headers },
    );
  }
  const key = process.env.NIPOST_API_KEY?.trim();
  if (body.operation === "suite") {
    const results = await runSuite(key);
    const configured = Boolean(
      key && (key.startsWith("nipost_test_") || key.startsWith("nipost_live_")),
    );
    return NextResponse.json(
      { configured, results, allPassed: results.every((r) => r.passed) },
      { status: configured ? 200 : 503, headers },
    );
  }
  const result = await callNipost(body.operation as Operation, body, key);
  return NextResponse.json(
    { ...result, passed: accepted(result) },
    { status: result.status, headers },
  );
}
