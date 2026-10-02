import { createBrowserClient } from "@supabase/ssr";

export function createClient(options?: { rememberMe?: boolean }) {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    options
      ? {
          isSingleton: false,
          ...(options.rememberMe
            ? { cookieOptions: { maxAge: 60 * 60 * 24 * 30 } }
            : {}),
        }
      : undefined,
  );
}