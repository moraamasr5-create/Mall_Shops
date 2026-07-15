import { NextRequest } from "next/server";
import { handleApi } from "@/core/http/api";
import { requireIdentity, withAuthenticatedDb } from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  createTenant,
  createTenantInputSchema,
  listTenantsForIdentity,
} from "@/core/tenant/service";
import { assertModuleActivatable, MVP_INITIAL_MODULE_KEYS } from "@/modules/registry";

export async function GET(req: NextRequest) {
  return handleApi(req, async () => {
    try {
      return await withAuthenticatedDb(req, async (auth) => {
        const tenants = await listTenantsForIdentity(auth.identity.identityId);
        return jsonOk(tenants);
      });
    } catch (error) {
      return jsonError(error);
    }
  });
}

/**
 * Tenant bootstrap: Identity is verified via JWT; persistence uses the
 * restricted privileged path (see createTenant) then normal RLS applies.
 */
export async function POST(req: NextRequest) {
  return handleApi(req, async () => {
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
  });
}
