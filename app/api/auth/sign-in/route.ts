import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function safeNext(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return "/dashboard";
  }

  return value;
}

export async function POST(
  request: Request,
) {
  try {
    const body =
      await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const next =
      safeNext(body.next);

    const remember = body.remember === true;

    if (!email || !password) {
      return NextResponse.json(
        {
          error:
            "Email and password are required.",
        },
        { status: 400 },
      );
    }

    /*
     * "Remember me" keeps the session cookie for 30 days;
     * otherwise it expires after 24 hours.
     */
    const supabase = await createClient({
      cookieMaxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    const {
      data,
      error,
    } =
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        },
      );

    if (error) {
      console.error(
        "[REACH][sign-in] Supabase sign-in failed",
        {
          message: error.message,
          code: error.code,
        },
      );

      return NextResponse.json(
        {
          error:
            error.message,
        },
        { status: 401 },
      );
    }

    if (!data.user) {
      return NextResponse.json(
        {
          error:
            "Authentication succeeded but no user was returned.",
        },
        { status: 401 },
      );
    }

    /*
     * The Supabase server client writes the authenticated
     * session into the SSR cookies.
     *
     * Return the target only after the session has been
     * established.
     */
    return NextResponse.json({
      success: true,
      next,
    });
  } catch (error) {
    console.error(
      "[REACH][sign-in] Unexpected error",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Unable to sign in right now. Please try again.",
      },
      { status: 500 },
    );
  }
}