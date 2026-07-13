import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createSalonService,
  createSalonServiceInputSchema,
  listSalonServices,
} from "@/modules/salon/services/service";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenantContext(req);
    requirePermission(ctx, SALON_PERMISSIONS.serviceRead, [SALON_ROLE_PERMISSIONS]);
    await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

    const services = await listSalonServices(ctx.tenant.tenantId);
    return jsonOk(services);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenantContext(req);
    requirePermission(ctx, SALON_PERMISSIONS.serviceWrite, [SALON_ROLE_PERMISSIONS]);
    await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

    const body = createSalonServiceInputSchema.parse(await req.json());
    const service = await createSalonService(ctx.tenant.tenantId, body);
    return jsonOk(service, 201);
  } catch (error) {
    return jsonError(error);
  }
}
