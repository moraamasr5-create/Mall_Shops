import { z } from "zod";
import { prisma } from "@/infrastructure/prisma";
import { AppError } from "@/shared/errors";

export const createSalonServiceInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
  durationMin: z.number().int().positive().max(24 * 60),
  priceCents: z.number().int().nonnegative(),
  currency: z.string().trim().length(3).default("SAR"),
});

export type CreateSalonServiceInput = z.infer<typeof createSalonServiceInputSchema>;

export async function listSalonServices(tenantId: string) {
  return prisma.salonService.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createSalonService(tenantId: string, input: CreateSalonServiceInput) {
  return prisma.salonService.create({
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
  const service = await prisma.salonService.findFirst({
    where: { id: serviceId, tenantId },
  });
  if (!service) {
    throw new AppError("NOT_FOUND", "Salon service not found", 404);
  }
  return service;
}
