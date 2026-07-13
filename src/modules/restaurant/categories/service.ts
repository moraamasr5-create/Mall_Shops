import { z } from "zod";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";

export const createRestaurantCategoryInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
});

export type CreateRestaurantCategoryInput = z.infer<
  typeof createRestaurantCategoryInputSchema
>;

export const updateRestaurantCategoryInputSchema =
  createRestaurantCategoryInputSchema.partial().refine(
    (input) => Object.keys(input).length > 0,
    {
      message: "At least one field must be provided",
    },
  );

export type UpdateRestaurantCategoryInput = z.infer<
  typeof updateRestaurantCategoryInputSchema
>;

export async function listRestaurantCategories(tenantId: string) {
  return prisma.restaurantCategory.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createRestaurantCategory(
  tenantId: string,
  input: CreateRestaurantCategoryInput,
) {
  return prisma.restaurantCategory.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description,
      active: true,
    },
  });
}

export async function getRestaurantCategory(tenantId: string, categoryId: string) {
  const category = await prisma.restaurantCategory.findFirst({
    where: { id: categoryId, tenantId },
  });

  if (!category) {
    throw new AppError("NOT_FOUND", "Restaurant category not found", 404);
  }

  return category;
}

export async function updateRestaurantCategory(
  tenantId: string,
  categoryId: string,
  input: UpdateRestaurantCategoryInput,
) {
  await getRestaurantCategory(tenantId, categoryId);

  return prisma.restaurantCategory.update({
    where: { id: categoryId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
    },
  });
}

export async function deactivateRestaurantCategory(
  tenantId: string,
  categoryId: string,
) {
  await getRestaurantCategory(tenantId, categoryId);

  return prisma.restaurantCategory.update({
    where: { id: categoryId },
    data: { active: false },
  });
}
