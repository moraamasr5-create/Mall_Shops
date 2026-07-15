import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
import {
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import { getTenantById } from "@/core/tenant/service";
import { AppError } from "@/shared/errors";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        const { tenantId } = await params;

        if (ctx.tenant.tenantId !== tenantId) {
          throw new AppError(
            "PERMISSION_DENIED",
            "X-Tenant-Id must match path tenantId",
            403
          );
        }

        requirePermission(ctx, "tenant:read");
        const tenant = await getTenantById(tenantId);
        return jsonOk(tenant);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
