import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type Options = {
  /** Seconds the auth cookies should live. Defaults to the Supabase default. */
  cookieMaxAge?: number;
};

export async function createClient(options: Options = {}) {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      ...(options.cookieMaxAge
        ? { cookieOptions: { maxAge: options.cookieMaxAge } }
        : {}),
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot always write cookies.
          }
        },
      },
    }
  );
}
