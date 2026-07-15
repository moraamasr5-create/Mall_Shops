import { NextRequest } from "next/server";
import { z } from "zod";
import { handleApi } from "@/core/http/api";
import {
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  enableTenantModule,
  listTenantModules,
  setTenantModuleEnabled,
} from "@/core/tenant-module/service";
import { AppError } from "@/shared/errors";
import { assertModuleActivatable, getModule } from "@/modules/registry";

type Params = { params: Promise<{ tenantId: string }> };

const enableModuleInputSchema = z.object({
  moduleKey: z.string().trim().min(1),
});

const patchModuleInputSchema = z.object({
  moduleKey: z.string().trim().min(1),
  enabled: z.boolean(),
});

function assertTenantMatch(
  ctxTenantId: string,
  pathTenantId: string
): void {
  if (ctxTenantId !== pathTenantId) {
    throw new AppError(
      "PERMISSION_DENIED",
      "X-Tenant-Id must match path tenantId",
      403
    );
  }
}

export async function GET(req: NextRequest, { params }: Params) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        const { tenantId } = await params;
        assertTenantMatch(ctx.tenant.tenantId, tenantId);

        requirePermission(ctx, "module:read");
        const modules = (await listTenantModules(tenantId)).map((row) => ({
          ...row,
          module: getModule(row.moduleKey) ?? null,
        }));
        return jsonOk(modules);
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
        const { tenantId } = await params;
        assertTenantMatch(ctx.tenant.tenantId, tenantId);

        requirePermission(ctx, "module:manage");
        const body = enableModuleInputSchema.parse(await req.json());
        assertModuleActivatable(body.moduleKey);

        const row = await enableTenantModule(tenantId, body.moduleKey);
        return jsonOk(
          {
            ...row,
            module: getModule(row.moduleKey) ?? null,
          },
          201
        );
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        const { tenantId } = await params;
        assertTenantMatch(ctx.tenant.tenantId, tenantId);

        requirePermission(ctx, "module:manage");
        const body = patchModuleInputSchema.parse(await req.json());
        assertModuleActivatable(body.moduleKey);

        const row = await setTenantModuleEnabled(tenantId, body.moduleKey, body.enabled);
        return jsonOk({
          ...row,
          module: getModule(row.moduleKey) ?? null,
        });
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
