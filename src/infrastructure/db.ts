import { AsyncLocalStorage } from "node:async_hooks";
import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";

export type DbClient = PrismaClient | Prisma.TransactionClient;

const dbContext = new AsyncLocalStorage<DbClient>();

/**
 * Returns the request-scoped DB client that runs under JWT/RLS context.
 * User-facing code must call this only inside `withIdentityRls`.
 */
export function getDb(): DbClient {
  const store = dbContext.getStore();
  if (!store) {
    throw new AppError(
      "CONFIG_ERROR",
      "Database access outside identity RLS context is forbidden for user requests",
      500
    );
  }
  return store;
}

/**
 * Privileged Prisma client — migrations / admin / restricted bootstrap only.
 * Must never be used for normal user-facing API data access.
 */
export function getPrivilegedDb(): PrismaClient {
  return prisma;
}

/**
 * Executes `fn` inside a transaction where:
 * 1. JWT Identity claims are set (Architecture Lock: JWT = Identity only)
 * 2. Role is switched to `authenticated` so RLS applies (Layer 1)
 *
 * Tenant / roles / permissions are NOT placed in JWT claims.
 */
export async function withIdentityRls<T>(
  identityId: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!identityId) {
    throw new AppError("UNAUTHENTICATED", "Missing identity for RLS context", 401);
  }

  const claims = JSON.stringify({
    sub: identityId,
    role: "authenticated",
    aud: "authenticated",
  });

  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('request.jwt.claims', ${claims}, true)`;
    await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${identityId}, true)`;
    await tx.$executeRaw`SET LOCAL ROLE authenticated`;

    try {
      return await dbContext.run(tx, fn);
    } finally {
      // Defense in depth for pooled connections; transaction end also resets LOCAL settings.
      await tx.$executeRaw`SELECT set_config('request.jwt.claims', '', true)`;
      await tx.$executeRaw`RESET ROLE`;
    }
  });
}
