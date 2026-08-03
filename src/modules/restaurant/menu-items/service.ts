import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import { getRestaurantCategory } from "@/modules/restaurant/categories/service";

export const createRestaurantMenuItemInputSchema = z.object({
  categoryId: z.string().trim().min(1),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("SAR"),
  available: z.boolean().optional().default(true),
});

export type CreateRestaurantMenuItemInput = z.infer<
  typeof createRestaurantMenuItemInputSchema
>;

export async function listRestaurantMenuItems(tenantId: string) {
  return getDb().restaurantMenuItem.findMany({
    where: { tenantId, retired: false },
    orderBy: { createdAt: "asc" },
  });
}

export async function createRestaurantMenuItem(
  tenantId: string,
  input: CreateRestaurantMenuItemInput,
) {
  await getRestaurantCategory(tenantId, input.categoryId);

  return getDb().restaurantMenuItem.create({
    data: {
      tenantId,
      categoryId: input.categoryId,
      name: input.name,
      description: input.description,
      priceCents: input.priceCents,
      currency: input.currency,
      available: input.available ?? true,
      retired: false,
    },
  });
}

export async function getRestaurantMenuItem(tenantId: string, itemId: string) {
  const item = await getDb().restaurantMenuItem.findFirst({
    where: { id: itemId, tenantId },
  });

  if (!item) {
    throw new AppError("NOT_FOUND", "Restaurant menu item not found", 404);
  }

  return item;
}

export async function setRestaurantMenuItemAvailability(
  tenantId: string,
  itemId: string,
  available: boolean,
) {
  const item = await getRestaurantMenuItem(tenantId, itemId);
  if (item.retired) {
    throw new AppError("CONFLICT", "Retired menu item cannot change availability", 409);
  }

  return getDb().restaurantMenuItem.update({
    where: { id: itemId },
    data: { available },
  });
}
