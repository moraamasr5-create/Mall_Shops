import { PrismaClient } from "@prisma/client";

/**
 * Privileged Prisma client (table owner / migration connection).
 * Must NOT be used for user-facing request data access.
 * User requests go through `withIdentityRls` in `@/infrastructure/db`.
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
