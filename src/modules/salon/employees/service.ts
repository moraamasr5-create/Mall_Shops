import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";

export const createSalonEmployeeInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  title: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(40).optional(),
  email: z.string().trim().email().max(255).optional(),
});

export type CreateSalonEmployeeInput = z.infer<typeof createSalonEmployeeInputSchema>;

export const updateSalonEmployeeInputSchema = createSalonEmployeeInputSchema
  .partial()
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateSalonEmployeeInput = z.infer<typeof updateSalonEmployeeInputSchema>;

export async function listSalonEmployees(tenantId: string) {
  return getDb().salonEmployee.findMany({
    where: { tenantId, active: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function createSalonEmployee(
  tenantId: string,
  input: CreateSalonEmployeeInput
) {
  return getDb().salonEmployee.create({
    data: {
      tenantId,
      name: input.name,
      title: input.title,
      phone: input.phone,
      email: input.email,
      active: true,
    },
  });
}

export async function getSalonEmployee(tenantId: string, employeeId: string) {
  const employee = await getDb().salonEmployee.findFirst({
    where: { id: employeeId, tenantId },
  });

  if (!employee) {
    throw new AppError("NOT_FOUND", "Salon employee not found", 404);
  }

  return employee;
}

export async function updateSalonEmployee(
  tenantId: string,
  employeeId: string,
  input: UpdateSalonEmployeeInput
) {
  await getSalonEmployee(tenantId, employeeId);

  return getDb().salonEmployee.update({
    where: { id: employeeId },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.phone !== undefined ? { phone: input.phone } : {}),
      ...(input.email !== undefined ? { email: input.email } : {}),
    },
  });
}

export async function deactivateSalonEmployee(tenantId: string, employeeId: string) {
  await getSalonEmployee(tenantId, employeeId);

  return getDb().salonEmployee.update({
    where: { id: employeeId },
    data: { active: false },
  });
}
