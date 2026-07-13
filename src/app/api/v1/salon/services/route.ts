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

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireTenantContext(req);
    requirePermission(ctx, "salon:service:read");
    await requireEnabledModule(ctx.tenant.tenantId, "salon");

    const services = await listSalonServices(ctx.tenant.tenantId);
    return jsonOk(services);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireTenantContext(req);
    requirePermission(ctx, "salon:service:write");
    await requireEnabledModule(ctx.tenant.tenantId, "salon");

    const body = createSalonServiceInputSchema.parse(await req.json());
    const service = await createSalonService(ctx.tenant.tenantId, body);
    return jsonOk(service, 201);
  } catch (error) {
    return jsonError(error);
  }
}
