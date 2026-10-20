import "server-only";

import { createClient } from "@supabase/supabase-js";

import { createNeonDataClient, neonSql } from "@/lib/neon/client";

type NeonAuthUserRow = {
  id: string;
  aud: string | null;
  role: string | null;
  email: string | null;
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

function mapAuthRow(row: NeonAuthUserRow) {
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

function getOptionalSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey || serviceRoleKey.length < 40) {
    return null;
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createAdminClient() {
  const neon = createNeonDataClient();
  const supabaseAdmin = getOptionalSupabaseAdmin();

  const authAdmin = {
    async listUsers(params?: { page?: number; perPage?: number }) {
      try {
        const page = Math.max(1, params?.page ?? 1);
        const perPage = Math.max(1, params?.perPage ?? 1000);
        const offset = (page - 1) * perPage;
        const { rows } = await neonSql<NeonAuthUserRow>(
          `SELECT * FROM auth.users ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
          [perPage, offset]
        );
        return {
          data: { users: rows.map(mapAuthRow) },
          error: null,
        };
      } catch (err: any) {
        return {
          data: { users: [] },
          error: { message: err?.message || "Failed to list users" },
        };
      }
    },

    async getUserById(id: string) {
      try {
        const { rows } = await neonSql<NeonAuthUserRow>(
          `SELECT * FROM auth.users WHERE id = $1 LIMIT 1`,
          [id]
        );
        return {
          data: { user: rows[0] ? mapAuthRow(rows[0]) : null },
          error: null,
        };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to get user" },
        };
      }
    },

    async createUser(attrs: {
      email: string;
      password?: string;
      email_confirm?: boolean;
      user_metadata?: Record<string, unknown>;
    }) {
      try {
        let userId: string | null = null;
        if (supabaseAdmin) {
          const res = await supabaseAdmin.auth.admin.createUser(attrs);
          if (res.error) return res;
          userId = res.data.user?.id ?? null;
        }
        const confirmedAt = attrs.email_confirm ? new Date().toISOString() : null;
        const { rows } = await neonSql<NeonAuthUserRow>(
          `INSERT INTO auth.users (id, email, email_confirmed_at, confirmed_at, raw_user_meta_data)
           VALUES (coalesce($1::uuid, gen_random_uuid()), $2, $3, $3, $4::jsonb)
           ON CONFLICT (email) DO UPDATE SET
             email_confirmed_at = coalesce(EXCLUDED.email_confirmed_at, auth.users.email_confirmed_at),
             raw_user_meta_data = EXCLUDED.raw_user_meta_data,
             updated_at = now()
           RETURNING *`,
          [userId, attrs.email, confirmedAt, JSON.stringify(attrs.user_metadata ?? {})]
        );
        return {
          data: { user: rows[0] ? mapAuthRow(rows[0]) : null },
          error: null,
        };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to create user" },
        };
      }
    },

    async inviteUserByEmail(
      email: string,
      options?: { redirectTo?: string; data?: Record<string, unknown> }
    ) {
      try {
        let userId: string | null = null;
        if (supabaseAdmin) {
          const res = await supabaseAdmin.auth.admin.inviteUserByEmail(email, options);
          if (res.error) return res;
          userId = res.data.user?.id ?? null;
        }
        const now = new Date().toISOString();
        const { rows } = await neonSql<NeonAuthUserRow>(
          `INSERT INTO auth.users (id, email, invited_at, raw_user_meta_data)
           VALUES (coalesce($1::uuid, gen_random_uuid()), $2, $3, $4::jsonb)
           ON CONFLICT (email) DO UPDATE SET
             invited_at = EXCLUDED.invited_at,
             raw_user_meta_data = EXCLUDED.raw_user_meta_data,
             updated_at = now()
           RETURNING *`,
          [userId, email, now, JSON.stringify(options?.data ?? {})]
        );
        return {
          data: { user: rows[0] ? mapAuthRow(rows[0]) : null },
          error: null,
        };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to invite user" },
        };
      }
    },

    async updateUserById(
      id: string,
      attrs: {
        email?: string;
        password?: string;
        email_confirm?: boolean;
        ban_duration?: string;
        user_metadata?: Record<string, unknown>;
      }
    ) {
      try {
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.updateUserById(id, attrs);
        }
        const updates: string[] = ["updated_at = now()"];
        const params: unknown[] = [];

        if (attrs.email !== undefined) {
          params.push(attrs.email);
          updates.push(`email = $${params.length}`);
        }
        if (attrs.email_confirm) {
          params.push(new Date().toISOString());
          updates.push(`email_confirmed_at = coalesce(email_confirmed_at, $${params.length})`);
        }
        if (attrs.ban_duration !== undefined) {
          if (attrs.ban_duration === "none" || attrs.ban_duration === "0s") {
            updates.push(`banned_until = NULL`);
          } else {
            const hoursMatch = attrs.ban_duration.match(/^(\d+)h$/);
            const hours = hoursMatch ? Number(hoursMatch[1]) : 876000;
            const bannedUntil = new Date(Date.now() + hours * 3600 * 1000).toISOString();
            params.push(bannedUntil);
            updates.push(`banned_until = $${params.length}`);
          }
        }
        if (attrs.user_metadata !== undefined) {
          params.push(JSON.stringify(attrs.user_metadata));
          updates.push(`raw_user_meta_data = $${params.length}::jsonb`);
        }

        params.push(id);
        const { rows } = await neonSql<NeonAuthUserRow>(
          `UPDATE auth.users SET ${updates.join(", ")} WHERE id = $${params.length} RETURNING *`,
          params
        );
        return {
          data: { user: rows[0] ? mapAuthRow(rows[0]) : null },
          error: null,
        };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to update user" },
        };
      }
    },

    async deleteUser(id: string) {
      try {
        if (supabaseAdmin) {
          await supabaseAdmin.auth.admin.deleteUser(id).catch(() => undefined);
        }
        await neonSql(`DELETE FROM auth.users WHERE id = $1`, [id]);
        return { data: { user: null }, error: null };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to delete user" },
        };
      }
    },

    async signOut(id: string, scope?: "global" | "local" | "others") {
      if (supabaseAdmin) {
        return supabaseAdmin.auth.admin.signOut(id, scope);
      }
      return { data: null, error: null };
    },
  };

  return {
    from: neon.from,
    rpc: neon.rpc,
    auth: {
      admin: authAdmin,
    },
    storage: supabaseAdmin
      ? supabaseAdmin.storage
      : {
          from(_bucket: string) {
            return {
              async upload() {
                return {
                  data: null,
                  error: { message: "Storage bucket is not configured." },
                };
              },
              getPublicUrl(path: string) {
                return { data: { publicUrl: `/images/${path}` } };
              },
            };
          },
        },
  };
}
