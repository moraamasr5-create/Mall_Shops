import { AppError } from "@/shared/errors";

/**
 * VS1 Implementation: Module registry as constants.
 * Architecture treats Module as a concept — storage is not locked.
 */
export type ModuleStatus = "available" | "deprecated" | "retired";

export type ModuleDefinition = {
  moduleKey: string;
  displayName: string;
  description: string;
  status: ModuleStatus;
};

export const MODULE_REGISTRY: Record<string, ModuleDefinition> = {
  salon: {
    moduleKey: "salon",
    displayName: "Salon",
    description: "Personal services reference module",
    status: "available",
  },
};

/** MVP Decision: only salon is activatable in VS1. */
export const MVP_ACTIVATABLE_MODULES = ["salon"] as const;

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
  if (!(MVP_ACTIVATABLE_MODULES as readonly string[]).includes(moduleKey)) {
    throw new AppError(
      "VALIDATION_ERROR",
      `Module is not activatable in MVP: ${moduleKey}`,
      422
    );
  }
  return moduleDef;
}
