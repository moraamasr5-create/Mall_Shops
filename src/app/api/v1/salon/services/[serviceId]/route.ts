import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";
import {
  deactivateSalonService,
  getSalonService,
  updateSalonService,
  updateSalonServiceInputSchema,
} from "@/modules/salon/services/service";

type Params = { params: Promise<{ serviceId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
      requirePermission(ctx, SALON_PERMISSIONS.serviceRead, [SALON_ROLE_PERMISSIONS]);

      const { serviceId } = await params;
      const service = await getSalonService(ctx.tenant.tenantId, serviceId);
      return jsonOk(service);
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
      requirePermission(ctx, SALON_PERMISSIONS.serviceWrite, [SALON_ROLE_PERMISSIONS]);

      const { serviceId } = await params;
      const body = updateSalonServiceInputSchema.parse(await req.json());
      const service = await updateSalonService(ctx.tenant.tenantId, serviceId, body);
      return jsonOk(service);
    });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    return await withAuthenticatedDb(req, async () => {
      const ctx = await requireTenantContext(req);
      await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
      requirePermission(ctx, SALON_PERMISSIONS.serviceDelete, [SALON_ROLE_PERMISSIONS]);

      const { serviceId } = await params;
      const service = await deactivateSalonService(ctx.tenant.tenantId, serviceId);
      return jsonOk(service);
    });
  } catch (error) {
    return jsonError(error);
  }
}
