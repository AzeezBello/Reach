import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
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
          /*
           * Keep the request cookies in sync so downstream
           * Server Components see the refreshed session.
           */
          cookiesToSet.forEach(
            ({ name, value }) => {
              request.cookies.set(name, value);
            },
          );

          /*
           * Re-create the response with the updated request
           * cookie state, then forward every Supabase cookie
           * to the browser.
           */
          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(
            ({
              name,
              value,
              options,
            }) => {
              response.cookies.set(
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
   * getClaims() validates the JWT and can refresh an
   * expired/near-expiry session.
   *
   * Do not use getSession() as the authorization check.
   */
  const {
    data,
    error,
  } = await supabase.auth.getClaims();

  if (error) {
    console.error(
      "[REACH][proxy] Supabase auth error",
      {
        message: error.message,
        code: error.code,
      },
    );
  }

  /*
   * Never allow authenticated pages to be cached and
   * subsequently served to another user.
   */
  if (data?.claims?.sub) {
    response.headers.set(
      "Cache-Control",
      "private, no-store",
    );
  }

  return response;
}