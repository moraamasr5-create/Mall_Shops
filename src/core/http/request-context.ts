import { NextRequest } from "next/server";
import { resolveIdentityFromAccessToken } from "@/infrastructure/supabase/auth";
import { getDb, withIdentityRls } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import {
  isRole,
  roleHasPermission,
  type Permission,
  type PermissionGrantMap,
  type Role,
} from "@/core/rbac/permissions";

export type RequestIdentity = {
  identityId: string;
  email: string | undefined;
};

export type TenantContext = {
  tenantId: string;
  role: Role;
  membershipId: string;
};

export type AuthenticatedRequest = {
  identity: RequestIdentity;
};

export type TenantScopedRequest = AuthenticatedRequest & {
  tenant: TenantContext;
};

function extractBearerToken(req: NextRequest): string {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new AppError("UNAUTHENTICATED", "Missing Bearer token", 401);
  }
  return header.slice("Bearer ".length).trim();
}

export async function requireIdentity(req: NextRequest): Promise<AuthenticatedRequest> {
  const token = extractBearerToken(req);
  const user = await resolveIdentityFromAccessToken(token);

  return {
    identity: {
      identityId: user.id,
      email: user.email,
    },
  };
}

/**
 * Runs a user-facing handler under Layer 1 RLS (JWT Identity claims + authenticated role).
 * All Prisma access inside `fn` must use `getDb()` via services.
 */
export async function withAuthenticatedDb<T>(
  req: NextRequest,
  fn: (auth: AuthenticatedRequest) => Promise<T>
): Promise<T> {
  const auth = await requireIdentity(req);
  return withIdentityRls(auth.identity.identityId, () => fn(auth));
}

export async function requireTenantContext(req: NextRequest): Promise<TenantScopedRequest> {
  const auth = await requireIdentity(req);
  const tenantId = req.headers.get("x-tenant-id")?.trim();

  if (!tenantId) {
    throw new AppError("VALIDATION_ERROR", "X-Tenant-Id header is required", 422);
  }

  const db = getDb();
  const membership = await db.membership.findUnique({
    where: {
      identityId_tenantId: {
        identityId: auth.identity.identityId,
        tenantId,
      },
    },
  });

  if (!membership || membership.status !== "active") {
    throw new AppError("PERMISSION_DENIED", "No active membership for this tenant", 403);
  }

  if (!isRole(membership.role)) {
    throw new AppError("CONFIG_ERROR", `Unknown membership role: ${membership.role}`, 500);
  }

  return {
    ...auth,
    tenant: {
      tenantId,
      role: membership.role,
      membershipId: membership.id,
    },
  };
}

export function requirePermission(
  ctx: TenantScopedRequest,
  permission: Permission,
  additionalGrantMaps: readonly PermissionGrantMap[] = []
): void {
  if (!roleHasPermission(ctx.tenant.role, permission, additionalGrantMaps)) {
    throw new AppError("PERMISSION_DENIED", `Missing permission: ${permission}`, 403);
  }
}

export async function requireEnabledModule(
  tenantId: string,
  moduleKey: string
): Promise<void> {
  const db = getDb();
  const activation = await db.tenantModule.findUnique({
    where: {
      tenantId_moduleKey: {
        tenantId,
        moduleKey,
      },
    },
  });

  if (!activation || !activation.enabled) {
    throw new AppError("MODULE_NOT_ENABLED", `Module is not enabled: ${moduleKey}`, 403);
  }
}
