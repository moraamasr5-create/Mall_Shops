import { NextResponse, type NextRequest } from "next/server";

/**
 * Ensure every request carries an x-request-id into App Router handlers.
 */
export function middleware(request: NextRequest) {
  const requestId =
    request.headers.get("x-request-id")?.trim() || crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-request-id", requestId);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("x-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
