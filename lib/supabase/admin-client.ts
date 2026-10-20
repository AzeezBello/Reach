import "server-only";

import {
  createNeonStorageClient,
  mapAuthRow,
  type NeonAuthUserRow,
} from "@/lib/neon/auth";
import { createNeonDataClient, neonSql } from "@/lib/neon/client";

export function createAdminClient() {
  const neon = createNeonDataClient();

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
        const email = attrs.email.trim().toLowerCase();
        const confirmedAt = attrs.email_confirm ? new Date().toISOString() : null;
        const password = attrs.password ?? null;

        const { rows } = await neonSql<NeonAuthUserRow>(
          `INSERT INTO auth.users (
             id, aud, role, email, encrypted_password,
             email_confirmed_at, confirmed_at, raw_user_meta_data, created_at, updated_at
           )
           VALUES (
             gen_random_uuid(), 'authenticated', 'authenticated', $1,
             CASE WHEN $2::text IS NOT NULL AND $2::text <> '' THEN crypt($2::text, gen_salt('bf')) ELSE NULL END,
             $3, $3, $4::jsonb, now(), now()
           )
           ON CONFLICT (email) DO UPDATE SET
             encrypted_password = COALESCE(
               CASE WHEN $2::text IS NOT NULL AND $2::text <> '' THEN crypt($2::text, gen_salt('bf')) ELSE NULL END,
               auth.users.encrypted_password
             ),
             email_confirmed_at = coalesce(EXCLUDED.email_confirmed_at, auth.users.email_confirmed_at),
             confirmed_at = coalesce(EXCLUDED.confirmed_at, auth.users.confirmed_at),
             raw_user_meta_data = EXCLUDED.raw_user_meta_data,
             updated_at = now()
           RETURNING *`,
          [email, password, confirmedAt, JSON.stringify(attrs.user_metadata ?? {})]
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
      emailInput: string,
      options?: { redirectTo?: string; data?: Record<string, unknown> }
    ) {
      try {
        const email = emailInput.trim().toLowerCase();
        const now = new Date().toISOString();
        const { rows } = await neonSql<NeonAuthUserRow>(
          `INSERT INTO auth.users (
             id, aud, role, email, invited_at, confirmation_sent_at, raw_user_meta_data, created_at, updated_at
           )
           VALUES (
             gen_random_uuid(), 'authenticated', 'authenticated', $1, $2, $2, $3::jsonb, now(), now()
           )
           ON CONFLICT (email) DO UPDATE SET
             invited_at = EXCLUDED.invited_at,
             confirmation_sent_at = EXCLUDED.confirmation_sent_at,
             raw_user_meta_data = coalesce(auth.users.raw_user_meta_data, '{}'::jsonb) || EXCLUDED.raw_user_meta_data,
             updated_at = now()
           RETURNING *`,
          [email, now, JSON.stringify(options?.data ?? {})]
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
        const updates: string[] = ["updated_at = now()"];
        const params: unknown[] = [];

        if (attrs.email !== undefined) {
          params.push(attrs.email.trim().toLowerCase());
          updates.push(`email = $${params.length}`);
        }
        if (attrs.password !== undefined && attrs.password !== "") {
          params.push(attrs.password);
          updates.push(`encrypted_password = crypt($${params.length}, gen_salt('bf'))`);
        }
        if (attrs.email_confirm) {
          params.push(new Date().toISOString());
          updates.push(`email_confirmed_at = coalesce(email_confirmed_at, $${params.length})`);
          updates.push(`confirmed_at = coalesce(confirmed_at, $${params.length})`);
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
        await neonSql(`DELETE FROM auth.users WHERE id = $1`, [id]);
        return { data: { user: null }, error: null };
      } catch (err: any) {
        return {
          data: { user: null },
          error: { message: err?.message || "Failed to delete user" },
        };
      }
    },

    async signOut(_id: string, _scope?: "global" | "local" | "others") {
      return { data: null, error: null };
    },
  };

  return {
    from: neon.from,
    rpc: neon.rpc,
    auth: {
      admin: authAdmin,
    },
    storage: createNeonStorageClient(),
  };
}
