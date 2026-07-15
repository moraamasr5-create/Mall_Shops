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
  createSalonCustomer,
  createSalonCustomerInputSchema,
  listSalonCustomers,
} from "@/modules/salon/customers/service";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
        requirePermission(ctx, SALON_PERMISSIONS.customerRead, [SALON_ROLE_PERMISSIONS]);

        const customers = await listSalonCustomers(ctx.tenant.tenantId);
        return jsonOk(customers);
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
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
        requirePermission(ctx, SALON_PERMISSIONS.customerWrite, [SALON_ROLE_PERMISSIONS]);

        const body = createSalonCustomerInputSchema.parse(await req.json());
        const customer = await createSalonCustomer(ctx.tenant.tenantId, body);
        return jsonOk(customer, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
