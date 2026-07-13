import type { Permission, PermissionGrantMap } from "@/core/rbac/permissions";

export const RESTAURANT_PERMISSIONS = {
  categoryRead: "restaurant:category:read",
  categoryWrite: "restaurant:category:write",
  categoryDelete: "restaurant:category:delete",
} as const satisfies Record<string, Permission>;

export const RESTAURANT_ROLE_PERMISSIONS: PermissionGrantMap = {
  OWNER: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
    RESTAURANT_PERMISSIONS.categoryDelete,
  ],
  ADMIN: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
    RESTAURANT_PERMISSIONS.categoryDelete,
  ],
  MANAGER: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
  ],
  STAFF: [RESTAURANT_PERMISSIONS.categoryRead],
  CUSTOMER: [RESTAURANT_PERMISSIONS.categoryRead],
};
