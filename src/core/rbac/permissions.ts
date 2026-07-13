/**
 * Explicit Role → Permission mapping.
 * No implicit inheritance (Architecture Lock v1.0).
 */

export const ROLES = ["OWNER", "ADMIN", "MANAGER", "STAFF", "CUSTOMER"] as const;
export type Role = (typeof ROLES)[number];

export type Permission =
  | "tenant:read"
  | "tenant:write"
  | "tenant:delete"
  | "member:read"
  | "member:write"
  | "module:read"
  | "module:manage"
  | "salon:service:read"
  | "salon:service:write"
  | "salon:service:delete";

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  OWNER: [
    "tenant:read",
    "tenant:write",
    "tenant:delete",
    "member:read",
    "member:write",
    "module:read",
    "module:manage",
    "salon:service:read",
    "salon:service:write",
    "salon:service:delete",
  ],
  ADMIN: [
    "tenant:read",
    "tenant:write",
    "member:read",
    "member:write",
    "module:read",
    "module:manage",
    "salon:service:read",
    "salon:service:write",
    "salon:service:delete",
  ],
  MANAGER: [
    "tenant:read",
    "member:read",
    "module:read",
    "salon:service:read",
    "salon:service:write",
  ],
  STAFF: ["tenant:read", "module:read", "salon:service:read"],
  CUSTOMER: ["tenant:read", "salon:service:read"],
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function permissionsForRole(role: Role): readonly Permission[] {
  return ROLE_PERMISSIONS[role];
}

export function roleHasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
