import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(
                name,
                value,
              );
            },
          );

          supabaseResponse =
            NextResponse.next({
              request,
            });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              supabaseResponse.cookies.set(
                name,
                value,
                options,
              );
            },
          );
        },
      },
    },
  );

  /*
   * IMPORTANT:
   *
   * getClaims() verifies the JWT and refreshes
   * the session when necessary.
   *
   * Do not replace this with getSession()
   * for authorization.
   */
  const {
    data: claimsData,
    error,
  } = await supabase.auth.getClaims();

  if (error) {
    console.error(
      "[REACH][proxy] Supabase claims error",
      {
        message: error.message,
        code: error.code,
      },
    );
  }

  /*
   * Keep authentication responses private.
   * This prevents authenticated responses from
   * being cached and reused across users.
   */
  if (claimsData?.claims?.sub) {
    supabaseResponse.headers.set(
      "Cache-Control",
      "private, no-store",
    );
  }

  return supabaseResponse;
}