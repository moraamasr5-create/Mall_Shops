import { NextRequest, NextResponse } from "next/server";
import { handleApi } from "@/core/http/api";

/**
 * Minimal liveness signal for ops probes / `npm run check:env`.
 * No tenant data. No auth. No DB (keep probe cheap; DB checked by check:env).
 */
export async function GET(req: NextRequest) {
  return handleApi(req, async () =>
    NextResponse.json({
      ok: true,
      service: "mall-shops",
      at: new Date().toISOString(),
    })
  );
}
