import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const res = await supabase.auth.getSession();
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json(
      {
        data: { session: null },
        error: { message: err?.message || "Failed to read session" },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action;
    const supabase = await createClient();

    if (action === "signUp") {
      const res = await supabase.auth.signUp({
        email: String(body.email ?? ""),
        password: String(body.password ?? ""),
        options: body.options,
      });
      return NextResponse.json(res, { status: res.error ? 400 : 200 });
    }

    if (action === "resetPasswordForEmail") {
      const res = await supabase.auth.resetPasswordForEmail(
        String(body.email ?? ""),
        body.options
      );
      return NextResponse.json(res, { status: res.error ? 400 : 200 });
    }

    if (action === "updateUser") {
      const res = await supabase.auth.updateUser({
        password: body.password ? String(body.password) : undefined,
      });
      return NextResponse.json(res, { status: res.error ? 400 : 200 });
    }

    if (action === "signOut") {
      const res = await supabase.auth.signOut();
      return NextResponse.json(res);
    }

    return NextResponse.json(
      { error: { message: "Unsupported auth action." } },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        data: { user: null, session: null },
        error: { message: err?.message || "Authentication request failed." },
      },
      { status: 500 }
    );
  }
}
