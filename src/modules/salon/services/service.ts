import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

export const createSalonServiceInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  durationMin: z.number().int().positive().max(24 * 60),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("SAR"),
});

export type CreateSalonServiceInput = z.infer<typeof createSalonServiceInputSchema>;

export const updateSalonServiceInputSchema = createSalonServiceInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateSalonServiceInput = z.infer<typeof updateSalonServiceInputSchema>;

export async function listSalonServices(tenantId: string) {
  return getDb().salonService.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createSalonService(tenantId: string, input: CreateSalonServiceInput) {
  return getDb().salonService.create({
    data: {
      tenantId,
      name: input.name,
      description: input.description,
      durationMin: input.durationMin,
      priceCents: input.priceCents,
      currency: input.currency.toUpperCase(),
      active: true,
    },
  });
}

export async function getSalonService(tenantId: string, serviceId: string) {
  const service = await getDb().salonService.findFirst({
    where: { id: serviceId, tenantId },
  });
  if (!service) {
    throw new AppError("NOT_FOUND", "Salon service not found", 404);
  }
  return service;
}

export async function updateSalonService(
  tenantId: string,
  serviceId: string,
  input: UpdateSalonServiceInput
) {
  await getSalonService(tenantId, serviceId);

  return getDb().salonService.update({
    where: { id: serviceId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.durationMin !== undefined ? { durationMin: input.durationMin } : {}),
      ...(input.priceCents !== undefined ? { priceCents: input.priceCents } : {}),
      ...(input.currency !== undefined ? { currency: input.currency.toUpperCase() } : {}),
    },
  });
}

export async function deactivateSalonService(tenantId: string, serviceId: string) {
  await getSalonService(tenantId, serviceId);

  return getDb().salonService.update({
    where: { id: serviceId },
    data: { active: false },
  });
}
