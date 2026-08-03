import type { Permission, PermissionGrantMap } from "@/core/rbac/permissions";

export const RESTAURANT_PERMISSIONS = {
  categoryRead: "restaurant:category:read",
  categoryWrite: "restaurant:category:write",
  categoryDelete: "restaurant:category:delete",
  menuRead: "restaurant:menu:read",
  menuWrite: "restaurant:menu:write",
  staffRead: "restaurant:staff:read",
  staffAssign: "restaurant:staff:assign",
  orderRead: "restaurant:order:read",
  orderWrite: "restaurant:order:write",
} as const satisfies Record<string, Permission>;

export const RESTAURANT_ROLE_PERMISSIONS: PermissionGrantMap = {
  OWNER: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
    RESTAURANT_PERMISSIONS.categoryDelete,
    RESTAURANT_PERMISSIONS.menuRead,
    RESTAURANT_PERMISSIONS.menuWrite,
    RESTAURANT_PERMISSIONS.staffRead,
    RESTAURANT_PERMISSIONS.staffAssign,
    RESTAURANT_PERMISSIONS.orderRead,
    RESTAURANT_PERMISSIONS.orderWrite,
  ],
  ADMIN: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
    RESTAURANT_PERMISSIONS.categoryDelete,
    RESTAURANT_PERMISSIONS.menuRead,
    RESTAURANT_PERMISSIONS.menuWrite,
    RESTAURANT_PERMISSIONS.staffRead,
    RESTAURANT_PERMISSIONS.staffAssign,
    RESTAURANT_PERMISSIONS.orderRead,
    RESTAURANT_PERMISSIONS.orderWrite,
  ],
  MANAGER: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.categoryWrite,
    RESTAURANT_PERMISSIONS.menuRead,
    RESTAURANT_PERMISSIONS.menuWrite,
    RESTAURANT_PERMISSIONS.staffRead,
    RESTAURANT_PERMISSIONS.staffAssign,
    RESTAURANT_PERMISSIONS.orderRead,
    RESTAURANT_PERMISSIONS.orderWrite,
  ],
  STAFF: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.menuRead,
    RESTAURANT_PERMISSIONS.staffRead,
    RESTAURANT_PERMISSIONS.orderRead,
    RESTAURANT_PERMISSIONS.orderWrite,
  ],
  CUSTOMER: [
    RESTAURANT_PERMISSIONS.categoryRead,
    RESTAURANT_PERMISSIONS.menuRead,
  ],
};
