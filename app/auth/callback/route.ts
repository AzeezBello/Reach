import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Only allow same-site redirect targets. */
function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/dashboard";
  }

  return value;
}

/**
 * Completes Supabase email flows (invitations, password recovery, magic
 * links). Supabase redirects here with a one-time `code`, which is exchanged
 * for a session cookie before the user is sent on to `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  let next = safeNext(searchParams.get("next"));

  if (type === "recovery" || type === "invite") {
    next = `/auth/set-password?next=${encodeURIComponent(next)}`;
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[REACH][auth-callback] Code exchange failed", {
      message: error.message,
      code: error.code,
    });

    return NextResponse.redirect(`${origin}/login?error=auth_callback`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
