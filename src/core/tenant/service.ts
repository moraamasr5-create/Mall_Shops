import { z } from "zod";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";
import { slugify } from "@/shared/slug";

export const createTenantInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(80).optional(),
});

export type CreateTenantInput = z.infer<typeof createTenantInputSchema>;

export async function createTenant(
  identityId: string,
  input: CreateTenantInput,
  initialModuleKeys: readonly string[]
) {
  const name = input.name.trim();
  const slug = input.slug ? slugify(input.slug) : slugify(name);

  if (!slug) {
    throw new AppError("VALIDATION_ERROR", "Unable to derive a valid tenant slug", 422);
  }

  const uniqueInitialModuleKeys = [...new Set(initialModuleKeys)];
  if (uniqueInitialModuleKeys.length === 0) {
    throw new AppError(
      "CONFIG_ERROR",
      "At least one initial module must be supplied when creating a tenant",
      500
    );
  }

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

    const tenantModules = await Promise.all(
      uniqueInitialModuleKeys.map((moduleKey) =>
        tx.tenantModule.create({
          data: {
            tenantId: tenant.id,
            moduleKey,
            enabled: true,
          },
        })
      )
    );

    return { tenant, membership, tenantModules };
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
