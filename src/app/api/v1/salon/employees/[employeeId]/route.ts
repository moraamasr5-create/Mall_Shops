import { NextRequest } from "next/server";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  deactivateSalonEmployee,
  getSalonEmployee,
  updateSalonEmployee,
  updateSalonEmployeeInputSchema,
} from "@/modules/salon/employees/service";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";

type Params = { params: Promise<{ employeeId: string }> };

async function requireSalonModule(req: NextRequest) {
  const ctx = await requireTenantContext(req);
  await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
  return ctx;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.employeeRead, [SALON_ROLE_PERMISSIONS]);

    const { employeeId } = await params;
    const employee = await getSalonEmployee(ctx.tenant.tenantId, employeeId);
    return jsonOk(employee);
  } catch (error) {
    return jsonError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.employeeWrite, [SALON_ROLE_PERMISSIONS]);

    const { employeeId } = await params;
    const body = updateSalonEmployeeInputSchema.parse(await req.json());
    const employee = await updateSalonEmployee(ctx.tenant.tenantId, employeeId, body);
    return jsonOk(employee);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const ctx = await requireSalonModule(req);
    requirePermission(ctx, SALON_PERMISSIONS.employeeDelete, [SALON_ROLE_PERMISSIONS]);

    const { employeeId } = await params;
    const employee = await deactivateSalonEmployee(ctx.tenant.tenantId, employeeId);
    return jsonOk(employee);
  } catch (error) {
    return jsonError(error);
  }
}
