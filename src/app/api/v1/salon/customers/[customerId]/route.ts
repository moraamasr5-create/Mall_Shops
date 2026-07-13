import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  deactivateSalonCustomer,
  getSalonCustomer,
  updateSalonCustomer,
  updateSalonCustomerInputSchema,
} from "@/modules/salon/customers/service";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";

type Params = { params: Promise<{ customerId: string }> };

async function requireSalonModule(req: NextRequest) {
  const ctx = await requireTenantContext(req);
  await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
  return ctx;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.customerRead, [SALON_ROLE_PERMISSIONS]);

    const { customerId } = await params;
    const customer = await getSalonCustomer(ctx.tenant.tenantId, customerId);
    return jsonOk(customer);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.customerWrite, [SALON_ROLE_PERMISSIONS]);

    const { customerId } = await params;
    const body = updateSalonCustomerInputSchema.parse(await req.json());
    const customer = await updateSalonCustomer(ctx.tenant.tenantId, customerId, body);
    return jsonOk(customer);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.customerDelete, [SALON_ROLE_PERMISSIONS]);

    const { customerId } = await params;
    const customer = await deactivateSalonCustomer(ctx.tenant.tenantId, customerId);
    return jsonOk(customer);
  } catch (error) {
    return jsonError(error);
  }
}
