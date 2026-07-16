"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createApiClient } from "@/portal/api/client";
import type {
  AuthSessionPayload,
  CreateTenantResult,
  TenantListItem,
} from "@/portal/api/types";
import {
  clearSession,
  readSession,
  writeSession,
  writeTenantId,
} from "@/portal/session/storage";

export type AuthResult = {
  session: AuthSessionPayload;
  tenants: TenantListItem[];
};

type PortalContextValue = {
  /** Storage hydrated */
  ready: boolean;
  /** Token ↔ tenant membership synced (no redirect before this) */
  sessionReady: boolean;
  accessToken: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  api: ReturnType<typeof createApiClient>;
  setTenantId: (tenantId: string | null) => void;
  applyAuthSession: (session: AuthSessionPayload, tenantId?: string | null) => void;
  signup: (email: string, password: string) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => void;
  createTenant: (name: string, slug?: string) => Promise<CreateTenantResult>;
  listTenants: (accessTokenOverride?: string) => Promise<TenantListItem[]>;
};

const PortalContext = createContext<PortalContextValue | null>(null);

async function fetchTenantsWithToken(accessToken: string): Promise<TenantListItem[]> {
  return createApiClient({ accessToken }).get<TenantListItem[]>("/api/v1/tenants");
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  // 1) Hydrate from sessionStorage (actual persisted session state)
  useEffect(() => {
    const stored = readSession();
    if (stored) {
      setAccessToken(stored.accessToken);
      setTenantIdState(stored.tenantId);
    }
    setReady(true);
  }, []);

  // 2) If we have a token but no tenantId, resolve membership from the server
  //    (covers Refresh / incomplete prior writes). No timers.
  useEffect(() => {
    if (!ready) return;

    let cancelled = false;

    async function syncMembership() {
      if (!accessToken) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      if (tenantId) {
        if (!cancelled) setSessionReady(true);
        return;
      }

      setSessionReady(false);
      try {
        const tenants = await fetchTenantsWithToken(accessToken);
        if (cancelled) return;
        if (tenants.length > 0) {
          const id = tenants[0].tenant.id;
          setTenantIdState(id);
          writeTenantId(id);
        }
      } catch {
        // leave tenantId null — caller/guard will send to onboarding or login error
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }

    void syncMembership();
    return () => {
      cancelled = true;
    };
    // intentionally only when ready/accessToken change — not on every tenantId write
    // eslint-disable-next-line react-hooks/exhaustive-deps -- tenantId gated inside
  }, [ready, accessToken]);

  const api = useMemo(
    () => createApiClient({ accessToken, tenantId }),
    [accessToken, tenantId]
  );

  const applyAuthSession = useCallback(
    (session: AuthSessionPayload, nextTenantId?: string | null) => {
      setAccessToken(session.accessToken);
      const tid = nextTenantId === undefined ? tenantId : nextTenantId;
      if (nextTenantId !== undefined) setTenantIdState(nextTenantId);
      writeSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        tenantId: tid ?? null,
      });
    },
    [tenantId]
  );

  const setTenantId = useCallback((id: string | null) => {
    setTenantIdState(id);
    writeTenantId(id);
  }, []);

  const establishWithPassword = useCallback(
    async (path: "/api/v1/auth/signup" | "/api/v1/auth/login", email: string, password: string) => {
      setSessionReady(false);
      // Public auth — no Authorization header (correct)
      const session = await createApiClient().post<AuthSessionPayload>(path, {
        email,
        password,
      });

      // Immediately use the NEW token for membership lookup (not React state yet)
      const tenants = await fetchTenantsWithToken(session.accessToken);
      const tid = tenants[0]?.tenant.id ?? null;

      setAccessToken(session.accessToken);
      setTenantIdState(tid);
      writeSession({
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        expiresAt: session.expiresAt,
        tenantId: tid,
      });
      setSessionReady(true);

      return { session, tenants };
    },
    []
  );

  const signup = useCallback(
    (email: string, password: string) =>
      establishWithPassword("/api/v1/auth/signup", email, password),
    [establishWithPassword]
  );

  const login = useCallback(
    (email: string, password: string) =>
      establishWithPassword("/api/v1/auth/login", email, password),
    [establishWithPassword]
  );

  const logout = useCallback(() => {
    clearSession();
    setAccessToken(null);
    setTenantIdState(null);
    setSessionReady(true);
  }, []);

  const createTenant = useCallback(
    async (name: string, slug?: string) => {
      const body = slug ? { name, slug } : { name };
      const token = accessToken;
      if (!token) {
        throw new Error("Not authenticated");
      }
      // Use explicit token — avoid stale memoized api right after auth
      const result = await createApiClient({ accessToken: token }).post<CreateTenantResult>(
        "/api/v1/tenants",
        body
      );
      setTenantId(result.tenant.id);
      return result;
    },
    [accessToken, setTenantId]
  );

  const listTenants = useCallback(
    async (accessTokenOverride?: string) => {
      const token = accessTokenOverride ?? accessToken;
      if (!token) {
        throw new Error("Not authenticated");
      }
      return fetchTenantsWithToken(token);
    },
    [accessToken]
  );

  const value: PortalContextValue = {
    ready,
    sessionReady,
    accessToken,
    tenantId,
    isAuthenticated: Boolean(accessToken),
    api,
    setTenantId,
    applyAuthSession,
    signup,
    login,
    logout,
    createTenant,
    listTenants,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalContextValue {
  const ctx = useContext(PortalContext);
  if (!ctx) {
    throw new Error("usePortal must be used within PortalProvider");
  }
  return ctx;
}
