import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { createNeonDataClient, syncAuthUserToNeon } from "@/lib/neon/client";

type Options = {
  /** Seconds the auth cookies should live. Defaults to the Supabase default. */
  cookieMaxAge?: number;
};

export async function createClient(options: Options = {}) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const neon = createNeonDataClient({
    getUserId: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id ?? null;
    },
  });

  const authProxy = new Proxy(supabase.auth, {
    get(target, prop, receiver) {
      if (prop === "signInWithPassword") {
        return async (...args: Parameters<typeof target.signInWithPassword>) => {
          const res = await target.signInWithPassword(...args);
          if (res.data?.user) {
            await syncAuthUserToNeon(res.data.user);
          }
          return res;
        };
      }
      if (prop === "exchangeCodeForSession") {
        return async (...args: Parameters<typeof target.exchangeCodeForSession>) => {
          const res = await target.exchangeCodeForSession(...args);
          if (res.data?.user) {
            await syncAuthUserToNeon(res.data.user);
          }
          return res;
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });

  return {
    auth: authProxy,
    storage: supabase.storage,
    from: neon.from,
    rpc: neon.rpc,
  };
}
