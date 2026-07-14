import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createRestaurantCategory,
  createRestaurantCategoryInputSchema,
  listRestaurantCategories,
} from "@/modules/restaurant/categories/service";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";

export async function GET(req: NextRequest) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
      requirePermission(ctx, RESTAURANT_PERMISSIONS.categoryRead, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]);

      const categories = await listRestaurantCategories(ctx.tenant.tenantId);
      return jsonOk(categories);
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
      requirePermission(ctx, RESTAURANT_PERMISSIONS.categoryWrite, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]);

      const body = createRestaurantCategoryInputSchema.parse(await req.json());
      const category = await createRestaurantCategory(ctx.tenant.tenantId, body);
      return jsonOk(category, 201);
    });
  } catch (error) {
    return jsonError(error);
  }
}
