import { describe, expect, it } from "vitest";
import { roleHasPermission } from "@/core/rbac/permissions";
import { assertModuleActivatable, getModule } from "@/modules/registry";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";
import { SALON_MODULE } from "@/modules/salon/module";

describe("Salon module permissions", () => {
  it("grants salon customer writes through module-owned mapping", () => {
    expect(
      roleHasPermission("MANAGER", SALON_PERMISSIONS.customerWrite, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(true);
  });

  it("denies salon customer reads for CUSTOMER role", () => {
    expect(
      roleHasPermission("CUSTOMER", SALON_PERMISSIONS.customerRead, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(false);
  });

  it("grants salon employee writes through module-owned mapping", () => {
    expect(
      roleHasPermission("MANAGER", SALON_PERMISSIONS.employeeWrite, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(true);
  });

  it("denies salon employee deletes for MANAGER", () => {
    expect(
      roleHasPermission("MANAGER", SALON_PERMISSIONS.employeeDelete, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(false);
  });

  it("grants salon permissions through module-owned mapping", () => {
    expect(
      roleHasPermission("STAFF", SALON_PERMISSIONS.serviceRead, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(true);
  });

  it("denies salon writes for CUSTOMER", () => {
    expect(
      roleHasPermission("CUSTOMER", SALON_PERMISSIONS.serviceWrite, [
        SALON_ROLE_PERMISSIONS,
      ])
    ).toBe(false);
  });
});

describe("Module registry (VS1 constants outside Core)", () => {
  it("exposes salon as available reference module", () => {
    expect(getModule(SALON_MODULE.moduleKey)?.status).toBe("available");
  });

  it("rejects unknown modules", () => {
    expect(() => assertModuleActivatable("unknown-module")).toThrow(/Unknown/);
  });
});
