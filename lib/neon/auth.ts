import "server-only";

import { neonSql } from "@/lib/neon/client";
import { signSessionToken, verifySessionToken } from "@/lib/neon/token";

export type NeonAuthUserRow = {
  id: string;
  aud: string | null;
  role: string | null;
  email: string | null;
  encrypted_password?: string | null;
  email_confirmed_at: string | null;
  invited_at: string | null;
  confirmation_sent_at: string | null;
  confirmed_at: string | null;
  last_sign_in_at: string | null;
  raw_app_meta_data: Record<string, unknown> | null;
  raw_user_meta_data: Record<string, unknown> | null;
  is_anonymous: boolean | null;
  banned_until: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};

export type AuthUser = {
  id: string;
  aud: string;
  role: string;
  email?: string;
  email_confirmed_at?: string;
  invited_at?: string;
  confirmation_sent_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  is_anonymous: boolean;
  banned_until?: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export function mapAuthRow(row: NeonAuthUserRow): AuthUser {
  return {
    id: row.id,
    aud: row.aud ?? "authenticated",
    role: row.role ?? "authenticated",
    email: row.email ?? undefined,
    email_confirmed_at: row.email_confirmed_at ?? undefined,
    invited_at: row.invited_at ?? undefined,
    confirmation_sent_at: row.confirmation_sent_at ?? undefined,
    confirmed_at: row.confirmed_at ?? undefined,
    last_sign_in_at: row.last_sign_in_at ?? undefined,
    app_metadata: row.raw_app_meta_data ?? {},
    user_metadata: row.raw_user_meta_data ?? {},
    is_anonymous: row.is_anonymous ?? false,
    banned_until: row.banned_until ?? undefined,
    phone: row.phone ?? "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function isRowBanned(row: Pick<NeonAuthUserRow, "banned_until"> | null | undefined): boolean {
  if (!row?.banned_until) return false;
  return new Date(row.banned_until) > new Date();
}

export async function getNeonUserById(id: string): Promise<AuthUser | null> {
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const { rows } = await neonSql<NeonAuthUserRow>(
      `SELECT * FROM auth.users WHERE id = $1 LIMIT 1`,
      [id]
    );
    const row = rows[0];
    if (!row || isRowBanned(row)) return null;
    return mapAuthRow(row);
  } catch (err) {
    console.error("[REACH][NeonAuth] Failed to load user by id:", err);
    return null;
  }
}

export async function signInWithNeonPassword(
  emailInput: string,
  password: string
): Promise<{
  user: AuthUser | null;
  error: { message: string; code: string } | null;
}> {
  const email = emailInput.trim().toLowerCase();
  if (!email || !password) {
    return {
      user: null,
      error: { message: "Email and password are required.", code: "invalid_credentials" },
    };
  }

  try {
    const { rows } = await neonSql<NeonAuthUserRow & { password_valid: boolean }>(
      `SELECT *,
        (encrypted_password IS NOT NULL AND encrypted_password <> '' AND encrypted_password = crypt($2, encrypted_password)) AS password_valid
       FROM auth.users
       WHERE lower(email) = lower($1)
       LIMIT 1`,
      [email, password]
    );

    const existing = rows[0];
    if (!existing) {
      return {
        user: null,
        error: { message: "Invalid login credentials", code: "invalid_credentials" },
      };
    }

    if (isRowBanned(existing)) {
      return {
        user: null,
        error: { message: "This account is currently suspended.", code: "user_banned" },
      };
    }

    let updatedRow: NeonAuthUserRow = existing;

    if (existing.encrypted_password && existing.encrypted_password !== "") {
      if (!existing.password_valid) {
        return {
          user: null,
          error: { message: "Invalid login credentials", code: "invalid_credentials" },
        };
      }

      const updateRes = await neonSql<NeonAuthUserRow>(
        `UPDATE auth.users
         SET last_sign_in_at = now(), updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [existing.id]
      );
      if (updateRes.rows[0]) updatedRow = updateRes.rows[0];
    } else {
      // Account was migrated or invited without a password hash yet; set it on first sign-in.
      const updateRes = await neonSql<NeonAuthUserRow>(
        `UPDATE auth.users
         SET encrypted_password = crypt($2, gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now()),
             confirmed_at = coalesce(confirmed_at, now()),
             last_sign_in_at = now(),
             updated_at = now()
         WHERE id = $1
         RETURNING *`,
        [existing.id, password]
      );
      if (updateRes.rows[0]) updatedRow = updateRes.rows[0];
    }

    await neonSql(
      `INSERT INTO public.profiles (id, full_name, email)
       VALUES ($1, coalesce($2, ''), $3)
       ON CONFLICT (id) DO UPDATE SET
         email = coalesce(public.profiles.email, EXCLUDED.email)`,
      [
        updatedRow.id,
        (updatedRow.raw_user_meta_data?.full_name as string | undefined) ?? "",
        updatedRow.email,
      ]
    ).catch(() => undefined);

    return {
      user: mapAuthRow(updatedRow),
      error: null,
    };
  } catch (err: any) {
    console.error("[REACH][NeonAuth] signInWithPassword error:", err);
    return {
      user: null,
      error: {
        message: err?.message || "Unable to verify credentials.",
        code: "auth_error",
      },
    };
  }
}

export async function signUpWithNeonPassword(params: {
  email: string;
  password: string;
  data?: Record<string, unknown>;
}): Promise<{
  user: AuthUser | null;
  error: { message: string; code: string } | null;
}> {
  const email = params.email.trim().toLowerCase();
  const password = params.password;
  const meta = params.data ?? {};

  if (!email || !password) {
    return {
      user: null,
      error: { message: "Email and password are required.", code: "invalid_input" },
    };
  }

  if (password.length < 8) {
    return {
      user: null,
      error: { message: "Use a password with at least 8 characters.", code: "weak_password" },
    };
  }

  try {
    const existingRes = await neonSql<NeonAuthUserRow>(
      `SELECT * FROM auth.users WHERE lower(email) = lower($1) LIMIT 1`,
      [email]
    );
    const existing = existingRes.rows[0];

    if (existing && existing.encrypted_password) {
      return {
        user: null,
        error: {
          message: "An account with this email address already exists. Please sign in.",
          code: "user_already_exists",
        },
      };
    }

    const { rows } = await neonSql<NeonAuthUserRow>(
      `INSERT INTO auth.users (
         id, aud, role, email, encrypted_password,
         email_confirmed_at, confirmed_at, last_sign_in_at,
         raw_app_meta_data, raw_user_meta_data, created_at, updated_at
       ) VALUES (
         gen_random_uuid(), 'authenticated', 'authenticated', $1, crypt($2, gen_salt('bf')),
         now(), now(), now(),
         '{"provider":"email","providers":["email"]}'::jsonb, $3::jsonb, now(), now()
       )
       ON CONFLICT (email) DO UPDATE SET
         encrypted_password = crypt($2, gen_salt('bf')),
         email_confirmed_at = coalesce(auth.users.email_confirmed_at, now()),
         confirmed_at = coalesce(auth.users.confirmed_at, now()),
         last_sign_in_at = now(),
         raw_user_meta_data = coalesce(auth.users.raw_user_meta_data, '{}'::jsonb) || $3::jsonb,
         updated_at = now()
       RETURNING *`,
      [email, password, JSON.stringify(meta)]
    );

    const row = rows[0];
    if (!row) {
      return {
        user: null,
        error: { message: "Failed to create account.", code: "signup_failed" },
      };
    }

    const fullName = typeof meta.full_name === "string" ? meta.full_name.trim() : "";
    const jurisdictionId =
      typeof meta.jurisdiction_id === "string" && meta.jurisdiction_id.trim()
        ? meta.jurisdiction_id.trim()
        : null;
    const address =
      typeof meta.address === "string" && meta.address.trim() ? meta.address.trim() : null;

    await neonSql(
      `INSERT INTO public.profiles (id, full_name, email, jurisdiction_id, address)
       VALUES ($1, $2, $3, $4::uuid, $5)
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         full_name = coalesce(nullif(EXCLUDED.full_name, ''), public.profiles.full_name),
         jurisdiction_id = coalesce(EXCLUDED.jurisdiction_id, public.profiles.jurisdiction_id),
         address = coalesce(EXCLUDED.address, public.profiles.address),
         updated_at = now()`,
      [row.id, fullName, email, jurisdictionId, address]
    );

    return {
      user: mapAuthRow(row),
      error: null,
    };
  } catch (err: any) {
    console.error("[REACH][NeonAuth] signUp error:", err);
    return {
      user: null,
      error: {
        message: err?.message || "Unable to create account.",
        code: "signup_error",
      },
    };
  }
}

export async function updateNeonUserPassword(
  userId: string,
  password: string
): Promise<{
  user: AuthUser | null;
  error: { message: string; code: string } | null;
}> {
  if (!userId) {
    return {
      user: null,
      error: { message: "Not authenticated.", code: "unauthorized" },
    };
  }
  if (!password || password.length < 8) {
    return {
      user: null,
      error: { message: "Use a password with at least 8 characters.", code: "weak_password" },
    };
  }

  try {
    const { rows } = await neonSql<NeonAuthUserRow>(
      `UPDATE auth.users
       SET encrypted_password = crypt($2, gen_salt('bf')),
           email_confirmed_at = coalesce(email_confirmed_at, now()),
           confirmed_at = coalesce(confirmed_at, now()),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [userId, password]
    );

    const row = rows[0];
    if (!row) {
      return {
        user: null,
        error: { message: "Account not found.", code: "not_found" },
      };
    }

    return {
      user: mapAuthRow(row),
      error: null,
    };
  } catch (err: any) {
    return {
      user: null,
      error: {
        message: err?.message || "Failed to update password.",
        code: "update_error",
      },
    };
  }
}

export async function createRecoveryCodeForEmail(emailInput: string): Promise<{
  code: string | null;
  error: { message: string; code: string } | null;
}> {
  const email = emailInput.trim().toLowerCase();
  if (!email) {
    return {
      code: null,
      error: { message: "Email address is required.", code: "invalid_email" },
    };
  }

  try {
    const { rows } = await neonSql<NeonAuthUserRow>(
      `UPDATE auth.users
       SET confirmation_sent_at = now(), updated_at = now()
       WHERE lower(email) = lower($1)
       RETURNING *`,
      [email]
    );

    const row = rows[0];
    if (!row) {
      return { code: null, error: null };
    }

    const code = await signSessionToken(
      {
        sub: row.id,
        email: row.email ?? undefined,
        role: row.role ?? "authenticated",
        type: "recovery",
      },
      60 * 60 // 1 hour
    );

    return { code, error: null };
  } catch (err: any) {
    return {
      code: null,
      error: {
        message: err?.message || "Unable to initiate password reset.",
        code: "recovery_error",
      },
    };
  }
}

export async function exchangeCodeForNeonUser(code: string): Promise<{
  user: AuthUser | null;
  error: { message: string; code: string } | null;
}> {
  const claims = await verifySessionToken(code);
  if (!claims?.sub) {
    return {
      user: null,
      error: { message: "Invalid or expired verification code.", code: "invalid_code" },
    };
  }

  try {
    const { rows } = await neonSql<NeonAuthUserRow>(
      `UPDATE auth.users
       SET email_confirmed_at = coalesce(email_confirmed_at, now()),
           confirmed_at = coalesce(confirmed_at, now()),
           last_sign_in_at = now(),
           updated_at = now()
       WHERE id = $1
       RETURNING *`,
      [claims.sub]
    );

    const row = rows[0];
    if (!row || isRowBanned(row)) {
      return {
        user: null,
        error: { message: "Account is unavailable.", code: "user_unavailable" },
      };
    }

    return {
      user: mapAuthRow(row),
      error: null,
    };
  } catch (err: any) {
    return {
      user: null,
      error: {
        message: err?.message || "Code exchange failed.",
        code: "exchange_error",
      },
    };
  }
}

const uploadedDataUrls = new Map<string, string>();

export function createNeonStorageClient() {
  return {
    from(_bucket: string) {
      return {
        async upload(
          path: string,
          file: Blob | ArrayBuffer | Uint8Array,
          options?: { contentType?: string; upsert?: boolean }
        ) {
          try {
            let bytes: Uint8Array;
            let mimeType = options?.contentType || "image/jpeg";

            if (file instanceof Blob) {
              if (file.type) mimeType = file.type;
              const ab = await file.arrayBuffer();
              bytes = new Uint8Array(ab);
            } else if (file instanceof ArrayBuffer) {
              bytes = new Uint8Array(file);
            } else {
              bytes = file;
            }

            const base64 = Buffer.from(bytes).toString("base64");
            const dataUrl = `data:${mimeType};base64,${base64}`;
            uploadedDataUrls.set(path, dataUrl);

            return { data: { path }, error: null };
          } catch (err: any) {
            return {
              data: null,
              error: { message: err?.message || "Failed to process uploaded file." },
            };
          }
        },
        getPublicUrl(path: string) {
          const dataUrl = uploadedDataUrls.get(path);
          return {
            data: {
              publicUrl: dataUrl ?? `/images/${path}`,
            },
          };
        },
      };
    },
  };
}
