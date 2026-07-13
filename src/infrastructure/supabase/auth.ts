import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { AppError } from "@/shared/errors";

let anonClient: SupabaseClient | null = null;

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new AppError("CONFIG_ERROR", "NEXT_PUBLIC_SUPABASE_URL is not configured", 500);
  }
  return url;
}

function getAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) {
    throw new AppError("CONFIG_ERROR", "NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured", 500);
  }
  return key;
}

export function getSupabaseAnonClient(): SupabaseClient {
  if (!anonClient) {
    anonClient = createClient(getSupabaseUrl(), getAnonKey(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return anonClient;
}

/**
 * Resolves Identity from JWT only.
 * JWT must not be used for tenant/role/permission claims (Architecture Lock v1.0).
 */
export async function resolveIdentityFromAccessToken(accessToken: string): Promise<User> {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AppError("UNAUTHENTICATED", "Invalid or expired identity token", 401);
  }

  return data.user;
}
