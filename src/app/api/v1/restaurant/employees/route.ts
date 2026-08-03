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
  assignRestaurantEmployee,
  assignRestaurantEmployeeInputSchema,
  listRestaurantEmployees,
} from "@/modules/restaurant/employees/service";
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
        requirePermission(ctx, RESTAURANT_PERMISSIONS.staffRead, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);

        const employees = await listRestaurantEmployees(ctx.tenant.tenantId);
        return jsonOk(employees);
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
        requirePermission(ctx, RESTAURANT_PERMISSIONS.staffAssign, [
          RESTAURANT_ROLE_PERMISSIONS,
        ]);

        const body = assignRestaurantEmployeeInputSchema.parse(await req.json());
        const assignment = await assignRestaurantEmployee(ctx.tenant.tenantId, body);
        return jsonOk(assignment, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
