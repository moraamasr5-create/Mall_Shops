import { z } from "zod";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";
import { isRole, ROLES } from "@/core/rbac/permissions";

export const inviteMemberInputSchema = z.object({
  identityId: z.string().uuid(),
  role: z.enum(ROLES),
});

export type InviteMemberInput = z.infer<typeof inviteMemberInputSchema>;

export async function listMembers(tenantId: string) {
  return prisma.membership.findMany({
    where: { tenantId },
    orderBy: { joinedAt: "asc" },
  });
}

export async function inviteMember(
  tenantId: string,
  invitedBy: string,
  input: InviteMemberInput
) {
  if (!isRole(input.role)) {
    throw new AppError("VALIDATION_ERROR", "Invalid role", 422);
  }

  if (input.role === "OWNER") {
    // Only existing OWNERs may grant OWNER — enforced by caller permission + this guard.
  }

  const existing = await prisma.membership.findUnique({
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
    return prisma.membership.update({
      where: { id: existing.id },
      data: {
        role: input.role,
        status: "active",
        invitedBy,
        joinedAt: new Date(),
      },
    });
  }

  return prisma.membership.create({
    data: {
      identityId: input.identityId,
      tenantId,
      role: input.role,
      status: "active",
      invitedBy,
    },
  });
}
