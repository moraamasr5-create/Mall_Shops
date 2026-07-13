import { describe, expect, it } from "vitest";
import { roleHasPermission, ROLE_PERMISSIONS } from "@/core/rbac/permissions";
import { assertModuleActivatable, getModule } from "@/core/module/registry";
import { slugify } from "@/shared/slug";

describe("RBAC explicit mapping", () => {
  it("does not imply OWNER inherits via hierarchy magic", () => {
    expect(ROLE_PERMISSIONS.OWNER).toContain("tenant:delete");
    expect(ROLE_PERMISSIONS.ADMIN).not.toContain("tenant:delete");
  });

  it("denies missing permissions", () => {
    expect(roleHasPermission("STAFF", "member:write")).toBe(false);
    expect(roleHasPermission("CUSTOMER", "salon:service:write")).toBe(false);
  });

  it("allows explicit STAFF read of salon services", () => {
    expect(roleHasPermission("STAFF", "salon:service:read")).toBe(true);
  });
});

describe("Module registry (VS1 constants)", () => {
  it("exposes salon as available reference module", () => {
    expect(getModule("salon")?.status).toBe("available");
  });

  it("rejects unknown modules", () => {
    expect(() => assertModuleActivatable("restaurant")).toThrow(/not activatable|Unknown/);
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Golden Group Salon")).toBe("golden-group-salon");
  });
});
