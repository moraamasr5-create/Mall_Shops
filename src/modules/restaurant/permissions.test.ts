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

  it("grants restaurant menu and staff assign to MANAGER", () => {
    expect(
      roleHasPermission("MANAGER", RESTAURANT_PERMISSIONS.menuWrite, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]),
    ).toBe(true);
    expect(
      roleHasPermission("MANAGER", RESTAURANT_PERMISSIONS.staffAssign, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]),
    ).toBe(true);
  });

  it("denies restaurant staff assign for STAFF", () => {
    expect(
      roleHasPermission("STAFF", RESTAURANT_PERMISSIONS.staffAssign, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]),
    ).toBe(false);
  });
});

describe("Restaurant module registration (A1 / D1–D2 slice)", () => {
  it("registers restaurant outside Core", () => {
    expect(getModule(RESTAURANT_MODULE.moduleKey)?.status).toBe("available");
  });

  it("allows restaurant activation by registry validation", () => {
    expect(assertModuleActivatable(RESTAURANT_MODULE.moduleKey).moduleKey).toBe(
      RESTAURANT_MODULE.moduleKey,
    );
  });

  it("keeps restaurant moduleKey stable for TenantModule enable API", () => {
    // POST /api/v1/tenants/:tenantId/modules { moduleKey: "restaurant" }
    // must match registry — Thesis §3.1 / Exit Criteria A1
    expect(RESTAURANT_MODULE.moduleKey).toBe("restaurant");
    expect(getModule("restaurant")?.displayName).toBe("Restaurant");
  });
});
