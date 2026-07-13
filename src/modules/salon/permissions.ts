import type { Permission, PermissionGrantMap } from "@/core/rbac/permissions";

export const SALON_PERMISSIONS = {
  serviceRead: "salon:service:read",
  serviceWrite: "salon:service:write",
  serviceDelete: "salon:service:delete",
} as const satisfies Record<string, Permission>;

export const SALON_ROLE_PERMISSIONS: PermissionGrantMap = {
  OWNER: [
    SALON_PERMISSIONS.serviceRead,
    SALON_PERMISSIONS.serviceWrite,
    SALON_PERMISSIONS.serviceDelete,
  ],
  ADMIN: [
    SALON_PERMISSIONS.serviceRead,
    SALON_PERMISSIONS.serviceWrite,
    SALON_PERMISSIONS.serviceDelete,
  ],
  MANAGER: [SALON_PERMISSIONS.serviceRead, SALON_PERMISSIONS.serviceWrite],
  STAFF: [SALON_PERMISSIONS.serviceRead],
  CUSTOMER: [SALON_PERMISSIONS.serviceRead],
};
