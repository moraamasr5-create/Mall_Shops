const ACCESS_TOKEN_KEY = "mall_shops.portal.accessToken";
const REFRESH_TOKEN_KEY = "mall_shops.portal.refreshToken";
const TENANT_ID_KEY = "mall_shops.portal.tenantId";
const EXPIRES_AT_KEY = "mall_shops.portal.expiresAt";

export type StoredSession = {
  accessToken: string;
  refreshToken: string | null;
  tenantId: string | null;
  expiresAt: number | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readSession(): StoredSession | null {
  if (!canUseStorage()) return null;
  const accessToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  if (!accessToken) return null;
  const expiresRaw = sessionStorage.getItem(EXPIRES_AT_KEY);
  return {
    accessToken,
    refreshToken: sessionStorage.getItem(REFRESH_TOKEN_KEY),
    tenantId: sessionStorage.getItem(TENANT_ID_KEY),
    expiresAt: expiresRaw ? Number(expiresRaw) : null,
  };
}

export function writeSession(session: {
  accessToken: string;
  refreshToken?: string | null;
  tenantId?: string | null;
  expiresAt?: number | null;
}): void {
  if (!canUseStorage()) return;
  sessionStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  if (session.refreshToken != null) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, session.refreshToken);
  }
  if (session.tenantId !== undefined) {
    if (session.tenantId) sessionStorage.setItem(TENANT_ID_KEY, session.tenantId);
    else sessionStorage.removeItem(TENANT_ID_KEY);
  }
  if (session.expiresAt != null) {
    sessionStorage.setItem(EXPIRES_AT_KEY, String(session.expiresAt));
  }
}

export function writeTenantId(tenantId: string | null): void {
  if (!canUseStorage()) return;
  if (tenantId) sessionStorage.setItem(TENANT_ID_KEY, tenantId);
  else sessionStorage.removeItem(TENANT_ID_KEY);
}

export function clearSession(): void {
  if (!canUseStorage()) return;
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(TENANT_ID_KEY);
  sessionStorage.removeItem(EXPIRES_AT_KEY);
}
