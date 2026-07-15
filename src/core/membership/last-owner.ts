import { AppError } from "@/shared/errors";

/**
 * Membership Contract invariant:
 * Every Tenant must retain at least one active OWNER Membership.
 * Removing / demoting / suspending / revoking the last active OWNER is forbidden.
 */

export type LastOwnerGuardInput = {
  activeOwnerCount: number;
  targetIsActiveOwner: boolean;
  /** When changing role away from OWNER */
  nextRole?: string;
  /** When changing status away from active (suspend/revoke) */
  nextStatus?: string;
};

export function isActiveOwnerRole(role: string, status: string): boolean {
  return role === "OWNER" && status === "active";
}

/**
 * Throws CONFLICT when the operation would leave the Tenant with zero active OWNERs.
 */
export function assertLastOwnerInvariant(input: LastOwnerGuardInput): void {
  if (!input.targetIsActiveOwner) {
    return;
  }

  if (input.activeOwnerCount < 1) {
    throw new AppError(
      "CONFIG_ERROR",
      "Tenant has no active OWNER Membership — data is inconsistent with the Membership Contract",
      500
    );
  }

  const demotingOwner =
    input.nextRole !== undefined && input.nextRole !== "OWNER";
  const deactivatingOwner =
    input.nextStatus !== undefined && input.nextStatus !== "active";

  if (!demotingOwner && !deactivatingOwner) {
    return;
  }

  if (input.activeOwnerCount <= 1) {
    throw new AppError(
      "CONFLICT",
      "Cannot remove or demote the last active OWNER Membership for a tenant",
      409
    );
  }
}
