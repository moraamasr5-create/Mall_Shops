import { AppError } from "@/shared/errors";
import type { ModuleDefinition } from "@/core/module/types";
import { SALON_MODULE } from "@/modules/salon/module";

/**
 * VS1 Implementation: Module registry as constants.
 * Architecture treats Module as a concept — storage is not locked.
 */
export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  [SALON_MODULE.moduleKey]: SALON_MODULE,
};

/** MVP Decision: only the reference module is enabled for new tenants. */
export const MVP_INITIAL_MODULE_KEYS = [SALON_MODULE.moduleKey] as const;

export function getModule(moduleKey: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY[moduleKey];
}

export function assertModuleActivatable(moduleKey: string): ModuleDefinition {
  const moduleDef = getModule(moduleKey);
  if (!moduleDef) {
    throw new AppError("VALIDATION_ERROR", `Unknown moduleKey: ${moduleKey}`, 422);
  }
  if (moduleDef.status !== "available") {
    throw new AppError("VALIDATION_ERROR", `Module is not available: ${moduleKey}`, 422);
  }
  return moduleDef;
}
