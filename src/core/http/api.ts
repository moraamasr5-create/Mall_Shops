import { NextResponse } from "next/server";
import { getRequestId, runWithRequestId } from "@/core/http/request-id";
import { logStructured } from "@/core/http/logger";
import { jsonError } from "@/core/http/response";

/**
 * Wraps an App Router handler so one requestId is shared across response meta + logs.
 */
export async function handleApi(
  req: Request,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const requestId =
    req.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const method = req.method;
  const path = new URL(req.url).pathname;
  const started = Date.now();

  return runWithRequestId(requestId, async () => {
    logStructured("info", { msg: "request.start", method, path });
    try {
      const res = await handler();
      res.headers.set("x-request-id", getRequestId());
      logStructured("info", {
        msg: "request.end",
        method,
        path,
        status: res.status,
        durationMs: Date.now() - started,
      });
      return res;
    } catch (error) {
      const res = jsonError(error);
      res.headers.set("x-request-id", getRequestId());
      logStructured("error", {
        msg: "request.unhandled",
        method,
        path,
        status: res.status,
        durationMs: Date.now() - started,
      });
      return res;
    }
  });
}
