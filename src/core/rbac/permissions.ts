/**
 * Explicit Role → Permission mapping.
 * No implicit inheritance (Architecture Lock v1.0).
 */

export const ROLES = ["OWNER", "ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

export type Permission = string;
export type PermissionGrantMap = Partial<Record<Role, readonly Permission[]>>;

export const CORE_ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: [
    "tenant:read",
    "tenant:write",
    "tenant:delete",
    "member:read",
    "member:write",
    "module:read",
    "module:manage",
  ],
  ADMIN: [
    "tenant:read",
    "tenant:write",
    "member:read",
    "member:write",
    "module:read",
    "module:manage",
  ],
  MANAGER: ["tenant:read", "member:read", "module:read"],
  STAFF: ["tenant:read", "module:read"],
  CUSTOMER: ["tenant:read"],
};

export const ROLE_PERMISSIONS = CORE_ROLE_PERMISSIONS;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function permissionsForRole(
  role: Role,
  additionalGrantMaps: readonly PermissionGrantMap[] = []
): readonly Permission[] {
  const permissions = new Set<Permission>(CORE_ROLE_PERMISSIONS[role]);

  for (const grantMap of additionalGrantMaps) {
    for (const permission of grantMap[role] ?? []) {
      permissions.add(permission);
    }
  }

  return [...permissions];
}

export function roleHasPermission(
  role: Role,
  permission: Permission,
  additionalGrantMaps: readonly PermissionGrantMap[] = []
): boolean {
  return permissionsForRole(role, additionalGrantMaps).includes(permission);
}
