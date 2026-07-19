import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
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
  getSalonVisit,
  updateSalonVisit,
  updateVisitInputSchema,
} from "@/modules/salon/visits/service";

type RouteContext = { params: Promise<{ visitId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        requirePermission(ctx, SALON_PERMISSIONS.visitRead, [SALON_ROLE_PERMISSIONS]);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

        const { visitId } = await context.params;
        const visit = await getSalonVisit(ctx.tenant.tenantId, visitId);
        return jsonOk(visit);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}

export async function PATCH(req: NextRequest, context: RouteContext) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        requirePermission(ctx, SALON_PERMISSIONS.visitWrite, [SALON_ROLE_PERMISSIONS]);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

        const { visitId } = await context.params;
        const body = updateVisitInputSchema.parse(await req.json());
        const visit = await updateSalonVisit(ctx.tenant.tenantId, visitId, body);
        return jsonOk(visit);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
