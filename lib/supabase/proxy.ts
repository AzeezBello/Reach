import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/neon/token";

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const claims = await verifySessionToken(token);

  /*
   * Never allow authenticated pages to be cached and
   * subsequently served to another user.
   */
  if (claims?.sub) {
    response.headers.set("Cache-Control", "private, no-store");
  }

  return response;
}
