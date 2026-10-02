import "server-only";

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey || serviceRoleKey.length < 40 || /your|example|placeholder|changeme/i.test(serviceRoleKey)) {
    throw new Error("Set a valid SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before sending leader invitations.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}