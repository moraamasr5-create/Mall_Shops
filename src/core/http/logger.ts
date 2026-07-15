import { getRequestId } from "@/core/http/request-id";

type LogLevel = "info" | "error" | "warn";

/**
 * MVP structured logging — JSON lines to stdout/stderr.
 * No secrets. No third-party sinks.
 */
export function logStructured(
  level: LogLevel,
  fields: Record<string, unknown>
): void {
  const line = JSON.stringify({
    level,
    at: new Date().toISOString(),
    requestId: getRequestId(),
    ...fields,
  });
  if (level === "error") {
    console.error(line);
    return;
  }
  if (level === "warn") {
    console.warn(line);
    return;
  }
  console.log(line);
}
