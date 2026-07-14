import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  deactivateRestaurantCategory,
  getRestaurantCategory,
  updateRestaurantCategory,
  updateRestaurantCategoryInputSchema,
} from "@/modules/restaurant/categories/service";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";

type Params = { params: Promise<{ categoryId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
      requirePermission(ctx, RESTAURANT_PERMISSIONS.categoryRead, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]);

      const { categoryId } = await params;
      const category = await getRestaurantCategory(ctx.tenant.tenantId, categoryId);
      return jsonOk(category);
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
      requirePermission(ctx, RESTAURANT_PERMISSIONS.categoryWrite, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]);

      const { categoryId } = await params;
      const body = updateRestaurantCategoryInputSchema.parse(await req.json());
      const category = await updateRestaurantCategory(
        ctx.tenant.tenantId,
        categoryId,
        body
      );
      return jsonOk(category);
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
      requirePermission(ctx, RESTAURANT_PERMISSIONS.categoryDelete, [
        RESTAURANT_ROLE_PERMISSIONS,
      ]);

      const { categoryId } = await params;
      const category = await deactivateRestaurantCategory(
        ctx.tenant.tenantId,
        categoryId
      );
      return jsonOk(category);
    });
  } catch (error) {
    return jsonError(error);
  }
}
