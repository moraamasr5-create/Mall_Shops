import {
  PortalApiError,
  type ApiFailure,
  type ApiSuccess,
} from "@/portal/api/types";

export type ApiClientOptions = {
  accessToken?: string | null;
  tenantId?: string | null;
};

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Browser API client for Owner Portal — Public `/api/v1` only.
 * Attaches Bearer + X-Tenant-Id when provided; unwraps success envelope.
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit & { accessToken?: string | null; tenantId?: string | null } = {}
): Promise<T> {
  const { accessToken, tenantId, headers: initHeaders, ...rest } = init;
  const headers = new Headers(initHeaders);
  if (!headers.has("content-type") && rest.body) {
    headers.set("content-type", "application/json");
  }
  if (accessToken) {
    headers.set("authorization", `Bearer ${accessToken}`);
  }
  if (tenantId) {
    headers.set("x-tenant-id", tenantId);
  }

  let res: Response;
  try {
    res = await fetch(path, { ...rest, headers });
  } catch {
    // انقطاع شبكة / سيرفر متوقف — بلا requestId من الخادم
    throw new PortalApiError(
      "تعذّر الاتصال بالخادم. تحقق من الإنترنت أو أن التطبيق يعمل، ثم أعد المحاولة.",
      {
        code: "NETWORK_ERROR",
        status: 0,
        requestId: null,
      }
    );
  }

  const json = (await parseJson(res)) as ApiSuccess<T> | ApiFailure;
  const requestId =
    (json as ApiSuccess<T>)?.meta?.requestId ??
    res.headers.get("x-request-id");

  if (!res.ok) {
    const err = (json as ApiFailure).error;
    throw new PortalApiError(err?.message ?? `فشل الطلب (${res.status})`, {
      code: err?.code ?? "HTTP_ERROR",
      status: res.status,
      details: err?.details,
      requestId,
      errorId: err?.errorId ?? null,
    });
  }

  if (!("data" in json)) {
    throw new PortalApiError("استجابة غير صالحة من الخادم. أعد المحاولة.", {
      code: "CLIENT_ERROR",
      status: res.status,
      requestId,
    });
  }

  return json.data;
}

export function createApiClient(opts: ApiClientOptions = {}) {
  return {
    get: <T>(path: string) =>
      apiRequest<T>(path, {
        method: "GET",
        accessToken: opts.accessToken,
        tenantId: opts.tenantId,
      }),
    post: <T>(path: string, body?: unknown) =>
      apiRequest<T>(path, {
        method: "POST",
        accessToken: opts.accessToken,
        tenantId: opts.tenantId,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
    patch: <T>(path: string, body: unknown) =>
      apiRequest<T>(path, {
        method: "PATCH",
        accessToken: opts.accessToken,
        tenantId: opts.tenantId,
        body: JSON.stringify(body),
      }),
    delete: <T>(path: string) =>
      apiRequest<T>(path, {
        method: "DELETE",
        accessToken: opts.accessToken,
        tenantId: opts.tenantId,
      }),
  };
}
