import { NextRequest } from "next/server";
import { z } from "zod";
import { jsonError, jsonOk } from "@/core/http/response";
import { signInWithPassword } from "@/infrastructure/supabase/auth";

const credentialsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

/**
 * Identity login via Supabase Auth.
 * JWT remains Identity-only (Architecture Lock / ADR-002).
 */
export async function POST(req: NextRequest) {
  try {
    const body = credentialsSchema.parse(await req.json());
    const result = await signInWithPassword(body.email, body.password);

    return jsonOk({
      identity: {
        id: result.user.id,
        email: result.user.email,
      },
      accessToken: result.session.access_token,
      refreshToken: result.session.refresh_token,
      expiresAt: result.session.expires_at,
    });
  } catch (error) {
    return jsonError(error);
  }
}
