import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createRestaurantMenuItem,
  createRestaurantMenuItemInputSchema,
  listRestaurantMenuItems,
} from "@/modules/restaurant/menu-items/service";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
        requirePermission(ctx, RESTAURANT_PERMISSIONS.menuRead, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);

        const items = await listRestaurantMenuItems(ctx.tenant.tenantId);
        return jsonOk(items);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}

export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
        requirePermission(ctx, RESTAURANT_PERMISSIONS.menuWrite, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);

        const body = createRestaurantMenuItemInputSchema.parse(await req.json());
        const item = await createRestaurantMenuItem(ctx.tenant.tenantId, body);
        return jsonOk(item, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
