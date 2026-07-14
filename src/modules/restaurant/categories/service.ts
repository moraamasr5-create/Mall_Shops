import { z } from "zod";
import { getDb } from "@/infrastructure/db";
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
  return getDb().restaurantCategory.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createRestaurantCategory(
  tenantId: string,
  input: CreateRestaurantCategoryInput,
) {
  return getDb().restaurantCategory.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description,
      active: true,
    },
  });
}

export async function getRestaurantCategory(tenantId: string, categoryId: string) {
  const category = await getDb().restaurantCategory.findFirst({
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

  return getDb().restaurantCategory.update({
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

  return getDb().restaurantCategory.update({
    where: { id: categoryId },
    data: { active: false },
  });
}
