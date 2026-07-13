import { NextRequest } from "next/server";
import { requireIdentity } from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createTenant,
  createTenantInputSchema,
  listTenantsForIdentity,
} from "@/core/tenant/service";
import { assertModuleActivatable, MVP_INITIAL_MODULE_KEYS } from "@/modules/registry";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireIdentity(req);
    const tenants = await listTenantsForIdentity(auth.identity.identityId);
    return jsonOk(tenants);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireIdentity(req);
    const body = createTenantInputSchema.parse(await req.json());
    const initialModuleKeys = MVP_INITIAL_MODULE_KEYS.map((moduleKey) => {
      assertModuleActivatable(moduleKey);
      return moduleKey;
    });
    const result = await createTenant(auth.identity.identityId, body, initialModuleKeys);
    return jsonOk(result, 201);
  } catch (error) {
    return jsonError(error);
  }
}
