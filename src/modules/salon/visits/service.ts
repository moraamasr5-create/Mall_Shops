import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import {
  createSalonCustomer,
  getSalonCustomer,
} from "@/modules/salon/customers/service";
import { getSalonEmployee } from "@/modules/salon/employees/service";
import { getSalonService } from "@/modules/salon/services/service";

/** Salon Module business rule (not a Schema constraint). Personal-service MVP. */
export const SALON_VISIT_REQUIRES_EMPLOYEE_ON_CLOSE = true;

export const VISIT_STATUS = {
  open: "open",
  closed: "closed",
  cancelled: "cancelled",
} as const;

export type VisitStatus = (typeof VISIT_STATUS)[keyof typeof VISIT_STATUS];

const walkInCustomerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional(),
});

export const openVisitInputSchema = z
  .object({
    customerId: z.string().trim().min(1).optional(),
    walkInCustomer: walkInCustomerSchema.optional(),
    employeeId: z.string().trim().min(1).optional(),
    notes: z.string().trim().max(1000).optional(),
    serviceIds: z.array(z.string().trim().min(1)).max(50).optional(),
  })
  .refine((input) => Boolean(input.customerId) || Boolean(input.walkInCustomer), {
    message: "Provide customerId or walkInCustomer",
    path: ["customerId"],
  })
  .refine((input) => !(input.customerId && input.walkInCustomer), {
    message: "Provide only one of customerId or walkInCustomer",
    path: ["customerId"],
  });

export type OpenVisitInput = z.infer<typeof openVisitInputSchema>;

export const updateVisitInputSchema = z
  .object({
    employeeId: z.string().trim().min(1).nullable().optional(),
    notes: z.string().trim().max(1000).nullable().optional(),
    /** Full replacement of open-visit service lines when provided */
    serviceIds: z.array(z.string().trim().min(1)).min(1).max(50).optional(),
  })
  .refine((input) => Object.keys(input).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateVisitInput = z.infer<typeof updateVisitInputSchema>;

export const listVisitsFilterSchema = z.object({
  status: z.enum(["open", "closed", "cancelled"]).optional(),
  openedFrom: z.string().datetime().optional(),
  openedTo: z.string().datetime().optional(),
});

export type ListVisitsFilter = z.infer<typeof listVisitsFilterSchema>;

function visitInclude() {
  return {
    services: { orderBy: { sortOrder: "asc" as const } },
  };
}

async function resolveCustomerId(tenantId: string, input: OpenVisitInput): Promise<string> {
  if (input.customerId) {
    await getSalonCustomer(tenantId, input.customerId);
    return input.customerId;
  }
  const walkIn = input.walkInCustomer!;
  const customer = await createSalonCustomer(tenantId, {
    name: walkIn.name,
    phone: walkIn.phone,
  });
  return customer.id;
}

async function assertEmployeeOptional(tenantId: string, employeeId: string | null | undefined) {
  if (!employeeId) return;
  await getSalonEmployee(tenantId, employeeId);
}

async function buildServiceLines(tenantId: string, serviceIds: string[]) {
  const lines = [];
  let sortOrder = 0;
  for (const serviceId of serviceIds) {
    const service = await getSalonService(tenantId, serviceId);
    if (!service.active) {
      throw new AppError("VALIDATION_ERROR", "Cannot add inactive salon service to a visit", 422);
    }
    lines.push({
      tenantId,
      serviceId: service.id,
      name: service.name,
      priceCents: service.priceCents,
      currency: service.currency,
      durationMin: service.durationMin,
      sortOrder: sortOrder++,
    });
  }
  return lines;
}

async function getOpenVisitOrThrow(tenantId: string, visitId: string) {
  const visit = await getDb().salonVisit.findFirst({
    where: { id: visitId, tenantId },
    include: visitInclude(),
  });
  if (!visit) {
    throw new AppError("NOT_FOUND", "Salon visit not found", 404);
  }
  if (visit.status !== VISIT_STATUS.open) {
    throw new AppError("CONFLICT", "Only open visits can be modified", 409);
  }
  return visit;
}

export async function listSalonVisits(tenantId: string, filters: ListVisitsFilter = {}) {
  return getDb().salonVisit.findMany({
    where: {
      tenantId,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.openedFrom || filters.openedTo
        ? {
            openedAt: {
              ...(filters.openedFrom ? { gte: new Date(filters.openedFrom) } : {}),
              ...(filters.openedTo ? { lte: new Date(filters.openedTo) } : {}),
            },
          }
        : {}),
    },
    include: visitInclude(),
    orderBy: { openedAt: "desc" },
  });
}

export async function getSalonVisit(tenantId: string, visitId: string) {
  const visit = await getDb().salonVisit.findFirst({
    where: { id: visitId, tenantId },
    include: visitInclude(),
  });
  if (!visit) {
    throw new AppError("NOT_FOUND", "Salon visit not found", 404);
  }
  return visit;
}

export async function openSalonVisit(tenantId: string, input: OpenVisitInput) {
  const customerId = await resolveCustomerId(tenantId, input);
  await assertEmployeeOptional(tenantId, input.employeeId);

  const serviceIds = input.serviceIds ?? [];
  const lines = serviceIds.length > 0 ? await buildServiceLines(tenantId, serviceIds) : [];

  return getDb().salonVisit.create({
    data: {
      tenantId,
      status: VISIT_STATUS.open,
      customerId,
      employeeId: input.employeeId ?? null,
      notes: input.notes,
      services: lines.length > 0 ? { create: lines } : undefined,
    },
    include: visitInclude(),
  });
}

export async function updateSalonVisit(
  tenantId: string,
  visitId: string,
  input: UpdateVisitInput
) {
  await getOpenVisitOrThrow(tenantId, visitId);

  if (input.employeeId !== undefined && input.employeeId !== null) {
    await assertEmployeeOptional(tenantId, input.employeeId);
  }

  if (input.serviceIds) {
    const lines = await buildServiceLines(tenantId, input.serviceIds);
    const db = getDb();
    await db.salonVisitService.deleteMany({ where: { visitId, tenantId } });
    await db.salonVisit.update({
      where: { id: visitId },
      data: {
        ...(input.employeeId !== undefined ? { employeeId: input.employeeId } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        services: { create: lines },
      },
    });
  } else {
    await getDb().salonVisit.update({
      where: { id: visitId },
      data: {
        ...(input.employeeId !== undefined ? { employeeId: input.employeeId } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
    });
  }

  return getSalonVisit(tenantId, visitId);
}

export async function closeSalonVisit(tenantId: string, visitId: string) {
  const visit = await getOpenVisitOrThrow(tenantId, visitId);

  if (visit.services.length < 1) {
    throw new AppError("VALIDATION_ERROR", "Close requires at least one visit service", 422);
  }

  // Business rule inside Salon Module — Schema keeps employeeId nullable.
  if (SALON_VISIT_REQUIRES_EMPLOYEE_ON_CLOSE && !visit.employeeId) {
    throw new AppError(
      "VALIDATION_ERROR",
      "Close requires an employee for this salon workflow",
      422
    );
  }

  return getDb().salonVisit.update({
    where: { id: visitId },
    data: {
      status: VISIT_STATUS.closed,
      closedAt: new Date(),
    },
    include: visitInclude(),
  });
}

export async function cancelSalonVisit(tenantId: string, visitId: string) {
  await getOpenVisitOrThrow(tenantId, visitId);

  return getDb().salonVisit.update({
    where: { id: visitId },
    data: {
      status: VISIT_STATUS.cancelled,
      closedAt: null,
    },
    include: visitInclude(),
  });
}
