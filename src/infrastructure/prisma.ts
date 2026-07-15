import { PrismaClient } from "@prisma/client";

/**
 * User-facing Prisma client (DATABASE_URL).
 * Under OP-002 this should be `app_runtime` (no BYPASSRLS).
 * Request data access must still go through `withIdentityRls` / `getDb()`.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
