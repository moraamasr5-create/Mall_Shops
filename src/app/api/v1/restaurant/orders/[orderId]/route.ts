import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi } from "@/core/http/api";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import { AppError } from "@/shared/errors";
import { RESTAURANT_MODULE } from "@/modules/restaurant/module";
import {
  RESTAURANT_PERMISSIONS,
  RESTAURANT_ROLE_PERMISSIONS,
} from "@/modules/restaurant/permissions";
import {
  cancelRestaurantOrder,
  completeRestaurantOrder,
  confirmRestaurantOrder,
  getRestaurantOrder,
  markReadyRestaurantOrder,
  startPreparingRestaurantOrder,
} from "@/modules/restaurant/orders/service";

type Params = { params: Promise<{ orderId: string }> };

const transitionSchema = z.object({
  action: z.enum([
    "confirm",
    "start_preparing",
    "mark_ready",
    "complete",
    "cancel",
  ]),
  /** A5: explicit PaymentAcceptance on Complete — required when action=complete */
  paymentAccepted: z.boolean().optional(),
  paymentMethod: z.string().trim().min(1).max(40).optional(),
});

export async function GET(req: NextRequest, { params }: Params) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
        requirePermission(ctx, RESTAURANT_PERMISSIONS.orderRead, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);
        const { orderId } = await params;
        const order = await getRestaurantOrder(ctx.tenant.tenantId, orderId);
        return jsonOk(order);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}

export async function POST(req: NextRequest, { params }: Params) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, RESTAURANT_MODULE.moduleKey);
        requirePermission(ctx, RESTAURANT_PERMISSIONS.orderWrite, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);
        const { orderId } = await params;
        const body = transitionSchema.parse(await req.json());

        let order;
        switch (body.action) {
          case "confirm":
            order = await confirmRestaurantOrder(ctx.tenant.tenantId, orderId);
            break;
          case "start_preparing":
            order = await startPreparingRestaurantOrder(ctx.tenant.tenantId, orderId);
            break;
          case "mark_ready":
            order = await markReadyRestaurantOrder(ctx.tenant.tenantId, orderId);
            break;
          case "complete":
            order = await completeRestaurantOrder(ctx.tenant.tenantId, orderId, {
              paymentAccepted: body.paymentAccepted,
              paymentMethod: body.paymentMethod,
            });
            break;
          case "cancel":
            order = await cancelRestaurantOrder(ctx.tenant.tenantId, orderId);
            break;
          default:
            throw new AppError("VALIDATION_ERROR", "Unknown action", 422);
        }
        return jsonOk(order);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
