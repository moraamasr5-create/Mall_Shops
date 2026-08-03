import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

export const RESTAURANT_STAFF_ROLES = [
  "cashier",
  "kitchen",
  "manager",
  "pilot",
] as const;

export const assignRestaurantEmployeeInputSchema = z.object({
  membershipId: z.string().trim().min(1),
  restaurantRole: z.enum(RESTAURANT_STAFF_ROLES),
});

export type AssignRestaurantEmployeeInput = z.infer<
  typeof assignRestaurantEmployeeInputSchema
>;

export async function listRestaurantEmployees(tenantId: string) {
  return getDb().restaurantEmployeeAssignment.findMany({
    where: { tenantId, status: "active" },
    orderBy: { assignedAt: "asc" },
  });
}

export async function assignRestaurantEmployee(
  tenantId: string,
  input: AssignRestaurantEmployeeInput,
) {
  const membership = await getDb().membership.findFirst({
    where: {
      id: input.membershipId,
      tenantId,
      status: "active",
    },
  });

  if (!membership) {
    throw new AppError(
      "NOT_FOUND",
      "Membership not found in this tenant",
      404,
    );
  }

  return getDb().restaurantEmployeeAssignment.upsert({
    where: {
      tenantId_membershipId_restaurantRole: {
        tenantId,
        membershipId: input.membershipId,
        restaurantRole: input.restaurantRole,
      },
    },
    create: {
      tenantId,
      membershipId: input.membershipId,
      restaurantRole: input.restaurantRole,
      status: "active",
    },
    update: {
      status: "active",
      revokedAt: null,
      assignedAt: new Date(),
    },
  });
}

export async function revokeRestaurantEmployee(
  tenantId: string,
  assignmentId: string,
) {
  const row = await getDb().restaurantEmployeeAssignment.findFirst({
    where: { id: assignmentId, tenantId },
  });

  if (!row) {
    throw new AppError("NOT_FOUND", "Restaurant employee assignment not found", 404);
  }

  return getDb().restaurantEmployeeAssignment.update({
    where: { id: assignmentId },
    data: {
      status: "revoked",
      revokedAt: new Date(),
    },
  });
}
