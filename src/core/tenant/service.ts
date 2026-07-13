import { z } from "zod";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";
import { slugify } from "@/shared/slug";
import { assertModuleActivatable } from "@/core/module/registry";

export const createTenantInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantInputSchema>;

/**
 * Creates Tenant + OWNER Membership + initial TenantModule activation.
 * MVP Decision: auto-enable salon.
 */
export async function createTenant(identityId: string, input: CreateTenantInput) {
  const name = input.name.trim();
  const slug = input.slug ? slugify(input.slug) : slugify(name);

  if (!slug) {
    throw new AppError("VALIDATION_ERROR", "Unable to derive a valid tenant slug", 422);
  }

  const initialModule = assertModuleActivatable("salon");

  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
    throw new AppError("CONFLICT", `Tenant slug already exists: ${slug}`, 409);
  }

  return prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name,
        slug,
        status: "active",
      },
    });

    const membership = await tx.membership.create({
      data: {
        identityId,
        tenantId: tenant.id,
        role: "OWNER",
        status: "active",
      },
    });

    const tenantModule = await tx.tenantModule.create({
      data: {
        tenantId: tenant.id,
        moduleKey: initialModule.moduleKey,
        enabled: true,
      },
    });

    return { tenant, membership, tenantModule };
  });
}

export async function listTenantsForIdentity(identityId: string) {
  const memberships = await prisma.membership.findMany({
    where: {
      identityId,
      status: "active",
    },
    include: {
      tenant: true,
    },
    orderBy: {
      joinedAt: "asc",
    },
  });

  return memberships.map((m) => ({
    tenant: m.tenant,
    role: m.role,
    membershipId: m.id,
  }));
}

export async function getTenantById(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw new AppError("NOT_FOUND", "Tenant not found", 404);
  }
  return tenant;
}
