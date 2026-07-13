import { NextRequest } from "next/server";
import {
  requirePermission,
  requireTenantContext,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import { listTenantModules } from "@/core/tenant-module/service";
import { AppError } from "@/shared/errors";

type Params = { params: Promise<{ tenantId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireTenantContext(req);
    const { tenantId } = await params;

    if (ctx.tenant.tenantId !== tenantId) {
      throw new AppError(
        "PERMISSION_DENIED",
        "X-Tenant-Id must match path tenantId",
        403
      );
    }

    requirePermission(ctx, "module:read");
    const modules = await listTenantModules(tenantId);
    return jsonOk(modules);
  } catch (error) {
    return jsonError(error);
  }
}
