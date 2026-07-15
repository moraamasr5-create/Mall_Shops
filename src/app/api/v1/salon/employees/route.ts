import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
import {
  requireEnabledModule,
  requirePermission,
  requireTenantContext,
  withAuthenticatedDb,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createSalonEmployee,
  createSalonEmployeeInputSchema,
  listSalonEmployees,
} from "@/modules/salon/employees/service";
import { SALON_MODULE } from "@/modules/salon/module";
import { SALON_PERMISSIONS, SALON_ROLE_PERMISSIONS } from "@/modules/salon/permissions";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async () => {
        const ctx = await requireTenantContext(req);
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
        requirePermission(ctx, SALON_PERMISSIONS.employeeRead, [SALON_ROLE_PERMISSIONS]);

        const employees = await listSalonEmployees(ctx.tenant.tenantId);
        return jsonOk(employees);
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
        await requireEnabledModule(ctx.tenant.tenantId, SALON_MODULE.moduleKey);
        requirePermission(ctx, SALON_PERMISSIONS.employeeWrite, [SALON_ROLE_PERMISSIONS]);

        const body = createSalonEmployeeInputSchema.parse(await req.json());
        const employee = await createSalonEmployee(ctx.tenant.tenantId, body);
        return jsonOk(employee, 201);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}
