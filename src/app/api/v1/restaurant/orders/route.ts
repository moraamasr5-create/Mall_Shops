import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";
import {
  createOrderInputSchema,
  createRestaurantOrder,
  listOrdersFilterSchema,
  listRestaurantOrders,
} from "@/modules/restaurant/orders/service";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
        requirePermission(ctx, RESTAURANT_PERMISSIONS.orderRead, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);
        const url = new URL(req.url);
        const filters = listOrdersFilterSchema.parse({
          openedFrom: url.searchParams.get("openedFrom") ?? undefined,
          openedTo: url.searchParams.get("openedTo") ?? undefined,
        });
        const orders = await listRestaurantOrders(ctx.tenant.tenantId, filters);
        return jsonOk(orders);
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
        requirePermission(ctx, RESTAURANT_PERMISSIONS.orderWrite, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);
        const body = createOrderInputSchema.parse(await req.json());
        const order = await createRestaurantOrder(ctx.tenant.tenantId, body);
        return jsonOk(order, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
