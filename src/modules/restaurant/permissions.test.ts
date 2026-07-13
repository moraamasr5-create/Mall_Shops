import { describe, expect, it } from "vitest";
import { roleHasPermission } from "@/core/rbac/permissions";
import { assertModuleActivatable, getModule } from "@/modules/registry";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";

describe("Restaurant module permissions", () => {
  it("grants restaurant category writes through module-owned mapping", () => {
    expect(
      roleHasPermission("MANAGER", RESTAURANT_PERMISSIONS.categoryWrite, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]),
    ).toBe(true);
  });

  it("denies restaurant category deletes for MANAGER", () => {
    expect(
      roleHasPermission("MANAGER", RESTAURANT_PERMISSIONS.categoryDelete, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]),
    ).toBe(false);
  });
});

describe("Restaurant module registration", () => {
  it("registers restaurant outside Core", () => {
    expect(getModule(RESTAURANT_MODULE.moduleKey)?.status).toBe("available");
  });

  it("allows restaurant activation by registry validation", () => {
    expect(assertModuleActivatable(RESTAURANT_MODULE.moduleKey).moduleKey).toBe(
      RESTAURANT_MODULE.moduleKey,
    );
  });
});
