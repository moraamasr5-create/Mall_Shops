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

type PortalContextValue = {
  ready: boolean;
  accessToken: string | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  api: ReturnType<typeof createApiClient>;
  setTenantId: (tenantId: string | null) => void;
  applyAuthSession: (session: AuthSessionPayload, tenantId?: string | null) => void;
  signup: (email: string, password: string) => Promise<AuthSessionPayload>;
  login: (email: string, password: string) => Promise<AuthSessionPayload>;
  logout: () => void;
  createTenant: (name: string, slug?: string) => Promise<CreateTenantResult>;
  /** Pass accessToken right after login/signup to avoid stale client (pre-re-render). */
  listTenants: (accessTokenOverride?: string) => Promise<TenantListItem[]>;
};

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    const stored = readSession();
    if (stored) {
      setAccessToken(stored.accessToken);
      setTenantIdState(stored.tenantId);
    }
    setReady(true);
  }, []);

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

  const signup = useCallback(async (email: string, password: string) => {
    const data = await createApiClient().post<AuthSessionPayload>("/api/v1/auth/signup", {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setTenantIdState(null);
    writeSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      tenantId: null,
    });
    return data;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await createApiClient().post<AuthSessionPayload>("/api/v1/auth/login", {
      email,
      password,
    });
    setAccessToken(data.accessToken);
    setTenantIdState(null);
    writeSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expiresAt: data.expiresAt,
      tenantId: null,
    });
    return data;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setAccessToken(null);
    setTenantIdState(null);
  }, []);

  const createTenant = useCallback(
    async (name: string, slug?: string) => {
      const body = slug ? { name, slug } : { name };
      const result = await api.post<CreateTenantResult>("/api/v1/tenants", body);
      setTenantId(result.tenant.id);
      return result;
    },
    [api, setTenantId]
  );

  const listTenants = useCallback(
    async (accessTokenOverride?: string) => {
      const client = createApiClient({
        accessToken: accessTokenOverride ?? accessToken,
        tenantId: accessTokenOverride ? null : tenantId,
      });
      return client.get<TenantListItem[]>("/api/v1/tenants");
    },
    [accessToken, tenantId]
  );

  const value: PortalContextValue = {
    ready,
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
