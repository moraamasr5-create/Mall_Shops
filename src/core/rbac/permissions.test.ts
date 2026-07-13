import { describe, expect, it } from "vitest";
import { roleHasPermission, ROLE_PERMISSIONS } from "@/core/rbac/permissions";
import { slugify } from "@/shared/slug";

describe("RBAC explicit mapping", () => {
  it("does not imply OWNER inherits via hierarchy magic", () => {
    expect(ROLE_PERMISSIONS.OWNER).toContain("tenant:delete");
    expect(ROLE_PERMISSIONS.ADMIN).not.toContain("tenant:delete");
  });

  it("denies missing permissions", () => {
    expect(roleHasPermission("STAFF", "member:write")).toBe(false);
  });

  it("does not grant unknown module permissions from Core", () => {
    expect(roleHasPermission("OWNER", "unknown-permission")).toBe(false);
  });
});

describe("slugify", () => {
  it("creates url-safe slugs", () => {
    expect(slugify("Golden Group")).toBe("golden-group");
  });
});
