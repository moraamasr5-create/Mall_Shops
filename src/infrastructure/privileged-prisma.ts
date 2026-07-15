import { PrismaClient } from "@prisma/client";

/**
 * Privileged Prisma client — DIRECT_URL (migrations / createTenant only).
 * Must never be used for normal user-facing request data access.
 */
const globalForPrivileged = globalThis as unknown as {
  privilegedPrisma?: PrismaClient;
};

function privilegedDatabaseUrl(): string {
  const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DIRECT_URL (or DATABASE_URL) is required for privileged DB access");
  }
  return url;
}

export const privilegedPrisma =
  globalForPrivileged.privilegedPrisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: privilegedDatabaseUrl(),
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrivileged.privilegedPrisma = privilegedPrisma;
}
