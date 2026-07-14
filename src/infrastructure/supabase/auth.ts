import { createClient, type SupabaseClient, type Session, type User } from "@supabase/supabase-js";
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

export type AuthSessionResult = {
  user: User;
  session: Session;
};

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<AuthSessionResult> {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new AppError("AUTH_ERROR", error.message, 400);
  }
  if (!data.user) {
    throw new AppError("AUTH_ERROR", "Sign up did not return an identity", 400);
  }
  if (!data.session) {
    throw new AppError(
      "AUTH_ERROR",
      "Sign up succeeded but no session was returned. Confirm email may be required.",
      400
    );
  }

  return { user: data.user, session: data.session };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthSessionResult> {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user || !data.session) {
    throw new AppError("UNAUTHENTICATED", error?.message ?? "Invalid credentials", 401);
  }

  return { user: data.user, session: data.session };
}
