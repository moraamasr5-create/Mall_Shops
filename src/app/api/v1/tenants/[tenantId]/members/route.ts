import { NextRequest } from "next/server";
import {
  requirePermission,
  requireTenantContext,
} from "@/core/http/request-context";
import { jsonError, jsonOk } from "@/core/http/response";
import {
  inviteMember,
  inviteMemberInputSchema,
  listMembers,
} from "@/core/membership/service";
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

    requirePermission(ctx, "member:read");
    const members = await listMembers(tenantId);
    return jsonOk(members);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(req: NextRequest, { params }: Params) {
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

    requirePermission(ctx, "member:write");
    const body = inviteMemberInputSchema.parse(await req.json());

    if (body.role === "OWNER" && ctx.tenant.role !== "OWNER") {
      throw new AppError("PERMISSION_DENIED", "Only OWNER may grant OWNER", 403);
    }

    const member = await inviteMember(tenantId, ctx.identity.identityId, body);
    return jsonOk(member, 201);
  } catch (error) {
    return jsonError(error);
  }
}
