import { NextResponse } from "next/server";

import { createClient } from "@/lib/neon/server";

export async function POST(request: Request) {
  const db = await createClient();

  await db.auth.signOut();

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
