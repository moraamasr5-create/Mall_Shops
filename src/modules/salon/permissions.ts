import type { Permission, PermissionGrantMap } from "@/core/rbac/permissions";

export const SALON_PERMISSIONS = {
  customerRead: "salon:customer:read",
  customerWrite: "salon:customer:write",
  customerDelete: "salon:customer:delete",
  employeeRead: "salon:employee:read",
  employeeWrite: "salon:employee:write",
  employeeDelete: "salon:employee:delete",
  serviceRead: "salon:service:read",
  serviceWrite: "salon:service:write",
  serviceDelete: "salon:service:delete",
} as const satisfies Record<string, Permission>;

export const SALON_ROLE_PERMISSIONS: PermissionGrantMap = {
  OWNER: [
    SALON_PERMISSIONS.customerRead,
    SALON_PERMISSIONS.customerWrite,
    SALON_PERMISSIONS.customerDelete,
    SALON_PERMISSIONS.employeeRead,
    SALON_PERMISSIONS.employeeWrite,
    SALON_PERMISSIONS.employeeDelete,
    SALON_PERMISSIONS.serviceRead,
    SALON_PERMISSIONS.serviceWrite,
    SALON_PERMISSIONS.serviceDelete,
  ],
  ADMIN: [
    SALON_PERMISSIONS.customerRead,
    SALON_PERMISSIONS.customerWrite,
    SALON_PERMISSIONS.customerDelete,
    SALON_PERMISSIONS.employeeRead,
    SALON_PERMISSIONS.employeeWrite,
    SALON_PERMISSIONS.employeeDelete,
    SALON_PERMISSIONS.serviceRead,
    SALON_PERMISSIONS.serviceWrite,
    SALON_PERMISSIONS.serviceDelete,
  ],
  MANAGER: [
    SALON_PERMISSIONS.customerRead,
    SALON_PERMISSIONS.customerWrite,
    SALON_PERMISSIONS.employeeRead,
    SALON_PERMISSIONS.employeeWrite,
    SALON_PERMISSIONS.serviceRead,
    SALON_PERMISSIONS.serviceWrite,
  ],
  STAFF: [
    SALON_PERMISSIONS.customerRead,
    SALON_PERMISSIONS.employeeRead,
    SALON_PERMISSIONS.serviceRead,
  ],
  CUSTOMER: [SALON_PERMISSIONS.serviceRead],
};
