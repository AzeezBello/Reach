import { cookies } from "next/headers";

import {
  type AuthUser,
  createNeonStorageClient,
  createRecoveryCodeForEmail,
  exchangeCodeForNeonUser,
  getNeonUserById,
  signInWithNeonPassword,
  signUpWithNeonPassword,
  updateNeonUserPassword,
} from "@/lib/neon/auth";
import { createNeonDataClient } from "@/lib/neon/client";
import {
  DEFAULT_SESSION_MAX_AGE,
  SESSION_COOKIE_NAME,
  type SessionClaims,
  signSessionToken,
  verifySessionToken,
} from "@/lib/neon/token";

type Options = {
  /** Seconds the auth cookies should live. Defaults to 7 days. */
  cookieMaxAge?: number;
};

export async function createClient(options: Options = {}) {
  const cookieStore = await cookies();
  const maxAge = options.cookieMaxAge ?? DEFAULT_SESSION_MAX_AGE;

  let activeToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
  let cachedUser: AuthUser | null | undefined = undefined;

  function setSessionCookie(token: string, ageSeconds = maxAge) {
    activeToken = token;
    try {
      cookieStore.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ageSeconds,
      });
    } catch {
      // Server Components cannot always write cookies.
    }
  }

  function clearSessionCookie() {
    activeToken = null;
    cachedUser = null;
    try {
      cookieStore.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 0,
      });
    } catch {
      // Server Components cannot always write cookies.
    }
  }

  async function resolveClaims(): Promise<SessionClaims | null> {
    return verifySessionToken(activeToken);
  }

  async function resolveUser(): Promise<AuthUser | null> {
    if (cachedUser !== undefined) return cachedUser;
    const claims = await resolveClaims();
    if (!claims?.sub) {
      cachedUser = null;
      return null;
    }
    cachedUser = await getNeonUserById(claims.sub);
    return cachedUser;
  }

  const neon = createNeonDataClient({
    getUserId: async () => {
      const claims = await resolveClaims();
      return claims?.sub ?? null;
    },
  });

  const auth = {
    async getClaims() {
      const claims = await resolveClaims();
      if (!claims) {
        return {
          data: null,
          error: { message: "No active session", code: "no_session" },
        };
      }
      return {
        data: { claims },
        error: null,
      };
    },

    async getUser() {
      const user = await resolveUser();
      if (!user) {
        return {
          data: { user: null },
          error: { message: "Auth session missing", code: "session_missing" },
        };
      }
      return {
        data: { user },
        error: null,
      };
    },

    async getSession() {
      const user = await resolveUser();
      if (!user || !activeToken) {
        return {
          data: { session: null },
          error: null,
        };
      }
      return {
        data: {
          session: {
            access_token: activeToken,
            user,
          },
        },
        error: null,
      };
    },

    async signInWithPassword(credentials: { email: string; password: string }) {
      const { user, error } = await signInWithNeonPassword(
        credentials.email,
        credentials.password
      );
      if (error || !user) {
        return {
          data: { user: null, session: null },
          error: error ?? { message: "Invalid login credentials", code: "invalid_credentials" },
        };
      }

      const token = await signSessionToken(
        { sub: user.id, email: user.email, role: user.role },
        maxAge
      );
      cachedUser = user;
      setSessionCookie(token, maxAge);

      return {
        data: {
          user,
          session: { access_token: token, user },
        },
        error: null,
      };
    },

    async signUp(params: {
      email: string;
      password: string;
      options?: { data?: Record<string, unknown> };
    }) {
      const { user, error } = await signUpWithNeonPassword({
        email: params.email,
        password: params.password,
        data: params.options?.data,
      });

      if (error || !user) {
        return {
          data: { user: null, session: null },
          error: error ?? { message: "Unable to create account.", code: "signup_failed" },
        };
      }

      const token = await signSessionToken(
        { sub: user.id, email: user.email, role: user.role },
        maxAge
      );
      cachedUser = user;
      setSessionCookie(token, maxAge);

      return {
        data: {
          user,
          session: { access_token: token, user },
        },
        error: null,
      };
    },

    async exchangeCodeForSession(code: string) {
      const { user, error } = await exchangeCodeForNeonUser(code);
      if (error || !user) {
        return {
          data: { user: null, session: null },
          error: error ?? { message: "Invalid or expired code.", code: "invalid_code" },
        };
      }

      const token = await signSessionToken(
        { sub: user.id, email: user.email, role: user.role },
        maxAge
      );
      cachedUser = user;
      setSessionCookie(token, maxAge);

      return {
        data: {
          user,
          session: { access_token: token, user },
        },
        error: null,
      };
    },

    async updateUser(attrs: { password?: string }) {
      const claims = await resolveClaims();
      if (!claims?.sub) {
        return {
          data: { user: null },
          error: { message: "Auth session missing", code: "session_missing" },
        };
      }

      if (attrs.password !== undefined) {
        const { user, error } = await updateNeonUserPassword(claims.sub, attrs.password);
        if (error || !user) {
          return {
            data: { user: null },
            error: error ?? { message: "Failed to update password.", code: "update_failed" },
          };
        }
        cachedUser = user;
        return { data: { user }, error: null };
      }

      const user = await resolveUser();
      return { data: { user }, error: null };
    },

    async resetPasswordForEmail(email: string, _options?: { redirectTo?: string }) {
      const { error } = await createRecoveryCodeForEmail(email);
      if (error) {
        return { data: null, error };
      }
      return { data: {}, error: null };
    },

    async signOut() {
      clearSessionCookie();
      return { error: null };
    },
  };

  return {
    auth,
    storage: createNeonStorageClient(),
    from: neon.from,
    rpc: neon.rpc,
  };
}
