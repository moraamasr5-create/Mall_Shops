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
  listSalonVisits,
  listVisitsFilterSchema,
  openSalonVisit,
  openVisitInputSchema,
} from "@/modules/salon/visits/service";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        requirePermission(ctx, SALON_PERMISSIONS.visitRead, [SALON_ROLE_PERMISSIONS]);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

        const url = new URL(req.url);
        const filters = listVisitsFilterSchema.parse({
          status: url.searchParams.get("status") ?? undefined,
          openedFrom: url.searchParams.get("openedFrom") ?? undefined,
          openedTo: url.searchParams.get("openedTo") ?? undefined,
        });

        const visits = await listSalonVisits(ctx.tenant.tenantId, filters);
        return jsonOk(visits);
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
        requirePermission(ctx, SALON_PERMISSIONS.visitWrite, [SALON_ROLE_PERMISSIONS]);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);

        const body = openVisitInputSchema.parse(await req.json());
        const visit = await openSalonVisit(ctx.tenant.tenantId, body);
        return jsonOk(visit, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
