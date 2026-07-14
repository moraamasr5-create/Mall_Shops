import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

export const createSalonCustomerInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(255).optional(),
  notes: z.string().trim().max(1000).optional(),
});

export type CreateSalonCustomerInput = z.infer<typeof createSalonCustomerInputSchema>;

export const updateSalonCustomerInputSchema = createSalonCustomerInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateSalonCustomerInput = z.infer<typeof updateSalonCustomerInputSchema>;

export async function listSalonCustomers(tenantId: string) {
  return getDb().salonCustomer.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createSalonCustomer(
  tenantId: string,
  input: CreateSalonCustomerInput
) {
  return getDb().salonCustomer.create({
    data: {
      tenantId,
      name: input.name,
      phone: input.phone,
      email: input.email,
      notes: input.notes,
      active: true,
    },
  });
}

export async function getSalonCustomer(tenantId: string, customerId: string) {
  const customer = await getDb().salonCustomer.findFirst({
    where: { id: customerId, tenantId },
  });

  if (!customer) {
    throw new AppError("NOT_FOUND", "Salon customer not found", 404);
  }

  return customer;
}

export async function updateSalonCustomer(
  tenantId: string,
  customerId: string,
  input: UpdateSalonCustomerInput
) {
  await getSalonCustomer(tenantId, customerId);

  return getDb().salonCustomer.update({
    where: { id: customerId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
      ...(input.notes !== undefined ? { notes: input.notes } : {}),
    },
  });
}

export async function deactivateSalonCustomer(tenantId: string, customerId: string) {
  await getSalonCustomer(tenantId, customerId);

  return getDb().salonCustomer.update({
    where: { id: customerId },
    data: { active: false },
  });
}
