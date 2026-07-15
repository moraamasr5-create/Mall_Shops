import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import { isRole, ROLES } from "@/core/rbac/permissions";
import {
  assertLastOwnerInvariant,
  isActiveOwnerRole,
} from "@/core/membership/last-owner";

export const inviteMemberInputSchema = z.object({
  identityId: z.string().uuid(),
  role: z.enum(ROLES),
});

export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;

export const setMemberRoleInputSchema = z.object({
  role: z.enum(ROLES),
});

export type SetMemberRoleInput = z.infer<typeof setMemberRoleInputSchema>;

export async function listMembers(tenantId: string) {
  const db = getDb();
  return db.membership.findMany({
    where: { tenantId },
    orderBy: { joinedAt: "asc" },
  });
}

export async function countActiveOwners(tenantId: string): Promise<number> {
  const db = getDb();
  return db.membership.count({
    where: {
      tenantId,
      role: "OWNER",
      status: "active",
    },
  });
}

export async function inviteMember(
  tenantId: string,
  invitedBy: string,
  input: InviteMemberInput
) {
  const db = getDb();

  if (!isRole(input.role)) {
    throw new AppError("VALIDATION_ERROR", "Invalid role", 422);
  }

  const existing = await db.membership.findUnique({
    where: {
      identityId_tenantId: {
        identityId: input.identityId,
        tenantId,
      },
    },
  });

  if (existing && existing.status === "active") {
    throw new AppError("CONFLICT", "Identity is already a member of this tenant", 409);
  }

  if (existing) {
    return db.membership.update({
      where: { id: existing.id },
      data: {
        role: input.role,
        status: "active",
        invitedBy,
        joinedAt: new Date(),
      },
    });
  }

  return db.membership.create({
    data: {
      identityId: input.identityId,
      tenantId,
      role: input.role,
      status: "active",
      invitedBy,
    },
  });
}

async function getMembershipOrThrow(tenantId: string, membershipId: string) {
  const db = getDb();
  const membership = await db.membership.findFirst({
    where: { id: membershipId, tenantId },
  });
  if (!membership) {
    throw new AppError("NOT_FOUND", "Membership not found", 404);
  }
  return membership;
}

/**
 * Change Membership Role.
 * Demoting the last active OWNER is forbidden (Membership Contract).
 */
export async function setMemberRole(
  tenantId: string,
  membershipId: string,
  input: SetMemberRoleInput
) {
  const db = getDb();

  if (!isRole(input.role)) {
    throw new AppError("VALIDATION_ERROR", "Invalid role", 422);
  }

  const membership = await getMembershipOrThrow(tenantId, membershipId);
  const activeOwnerCount = await countActiveOwners(tenantId);

  assertLastOwnerInvariant({
    activeOwnerCount,
    targetIsActiveOwner: isActiveOwnerRole(membership.role, membership.status),
    nextRole: input.role,
  });

  return db.membership.update({
    where: { id: membership.id },
    data: { role: input.role },
  });
}

/**
 * Suspend Membership. Suspending the last active OWNER is forbidden.
 */
export async function suspendMember(tenantId: string, membershipId: string) {
  const db = getDb();
  const membership = await getMembershipOrThrow(tenantId, membershipId);
  const activeOwnerCount = await countActiveOwners(tenantId);

  assertLastOwnerInvariant({
    activeOwnerCount,
    targetIsActiveOwner: isActiveOwnerRole(membership.role, membership.status),
    nextStatus: "suspended",
  });

  return db.membership.update({
    where: { id: membership.id },
    data: { status: "suspended" },
  });
}

/**
 * Revoke Membership. Revoking the last active OWNER is forbidden.
 */
export async function revokeMember(tenantId: string, membershipId: string) {
  const db = getDb();
  const membership = await getMembershipOrThrow(tenantId, membershipId);
  const activeOwnerCount = await countActiveOwners(tenantId);

  assertLastOwnerInvariant({
    activeOwnerCount,
    targetIsActiveOwner: isActiveOwnerRole(membership.role, membership.status),
    nextStatus: "revoked",
  });

  return db.membership.update({
    where: { id: membership.id },
    data: { status: "revoked" },
  });
}
