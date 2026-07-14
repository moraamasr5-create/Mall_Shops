import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

export async function listTenantModules(tenantId: string) {
  const db = getDb();
  return db.tenantModule.findMany({
    where: { tenantId },
    orderBy: { activatedAt: "asc" },
  });
}

export async function enableTenantModule(tenantId: string, moduleKey: string) {
  const db = getDb();
  return db.tenantModule.upsert({
    where: {
      tenantId_moduleKey: { tenantId, moduleKey },
    },
    create: {
      tenantId,
      moduleKey,
      enabled: true,
    },
    update: {
      enabled: true,
    },
  });
}

export async function setTenantModuleEnabled(
  tenantId: string,
  moduleKey: string,
  enabled: boolean
) {
  const db = getDb();
  const existing = await db.tenantModule.findUnique({
    where: { tenantId_moduleKey: { tenantId, moduleKey } },
  });

  if (!existing) {
    throw new AppError("NOT_FOUND", "TenantModule activation not found", 404);
  }

  if (!enabled) {
    const enabledCount = await db.tenantModule.count({
      where: { tenantId, enabled: true },
    });
    if (enabledCount <= 1 && existing.enabled) {
      throw new AppError(
        "CONFLICT",
        "Cannot disable the last enabled module for a tenant",
        409
      );
    }
  }

  return db.tenantModule.update({
    where: { id: existing.id },
    data: { enabled },
  });
}
