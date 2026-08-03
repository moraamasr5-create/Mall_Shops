import { z } from "zod";
import { getDb } from "@/infrastructure/db";
import { AppError } from "@/shared/errors";
import { getRestaurantMenuItem } from "@/modules/restaurant/menu-items/service";

export const ORDER_STATUS = {
  created: "created",
  confirmed: "confirmed",
  preparing: "preparing",
  ready: "ready",
  completed: "completed",
  cancelled: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const FULFILLMENT_MODES = ["dine_in", "pickup", "delivery"] as const;

const TERMINAL: OrderStatus[] = [
  ORDER_STATUS.completed,
  ORDER_STATUS.cancelled,
];

export const createOrderInputSchema = z.object({
  fulfillmentMode: z.enum(FULFILLMENT_MODES),
  guestName: z.string().trim().min(1).max(120).optional(),
  lines: z
    .array(
      z.object({
        menuItemId: z.string().trim().min(1),
        quantity: z.number().int().positive().max(99).default(1),
      }),
    )
    .min(1)
    .max(50),
});

export type CreateOrderInput = z.infer<typeof createOrderInputSchema>;

function orderInclude() {
  return { lines: { orderBy: { sortOrder: "asc" as const } } };
}

export const listOrdersFilterSchema = z.object({
  openedFrom: z.string().datetime().optional(),
  openedTo: z.string().datetime().optional(),
});

export type ListOrdersFilter = z.infer<typeof listOrdersFilterSchema>;

export async function listRestaurantOrders(
  tenantId: string,
  filters: ListOrdersFilter = {},
) {
  return getDb().restaurantOrder.findMany({
    where: {
      tenantId,
      ...(filters.openedFrom || filters.openedTo
        ? {
            openedAt: {
              ...(filters.openedFrom ? { gte: new Date(filters.openedFrom) } : {}),
              ...(filters.openedTo ? { lte: new Date(filters.openedTo) } : {}),
            },
          }
        : {}),
    },
    include: orderInclude(),
    orderBy: { openedAt: "desc" },
  });
}

export async function getRestaurantOrder(tenantId: string, orderId: string) {
  const order = await getDb().restaurantOrder.findFirst({
    where: { id: orderId, tenantId },
    include: orderInclude(),
  });
  if (!order) {
    throw new AppError("NOT_FOUND", "Restaurant order not found", 404);
  }
  return order;
}

export async function createRestaurantOrder(
  tenantId: string,
  input: CreateOrderInput,
) {
  const lineData = [];
  for (let i = 0; i < input.lines.length; i++) {
    const line = input.lines[i]!;
    const item = await getRestaurantMenuItem(tenantId, line.menuItemId);
    if (item.retired || !item.available) {
      throw new AppError(
        "CONFLICT",
        `Menu item not available for new orders: ${item.name}`,
        409,
      );
    }
    lineData.push({
      tenantId,
      menuItemId: item.id,
      name: item.name,
      quantity: line.quantity,
      priceCents: item.priceCents,
      currency: item.currency,
      sortOrder: i,
    });
  }

  return getDb().restaurantOrder.create({
    data: {
      tenantId,
      status: ORDER_STATUS.created,
      fulfillmentMode: input.fulfillmentMode,
      guestName: input.guestName,
      lines: { create: lineData },
    },
    include: orderInclude(),
  });
}

async function transition(
  tenantId: string,
  orderId: string,
  from: OrderStatus[],
  to: OrderStatus,
  extra?: {
    paymentAccepted?: boolean;
    paymentMethod?: string;
  },
) {
  const order = await getRestaurantOrder(tenantId, orderId);
  if (TERMINAL.includes(order.status as OrderStatus)) {
    throw new AppError("CONFLICT", `Order is terminal: ${order.status}`, 409);
  }
  if (!from.includes(order.status as OrderStatus)) {
    throw new AppError(
      "CONFLICT",
      `Cannot move from ${order.status} to ${to}`,
      409,
    );
  }

  if (to === ORDER_STATUS.completed) {
    // A5 money rule: Complete requires explicit PaymentAcceptance snapshot
    // on the Order — not Payment Aggregate / Settlement / refunds.
    if (extra?.paymentAccepted !== true) {
      throw new AppError(
        "VALIDATION_ERROR",
        "Complete requires PaymentAcceptance snapshot on Order",
        422,
      );
    }
  }

  return getDb().restaurantOrder.update({
    where: { id: orderId },
    data: {
      status: to,
      ...(to === ORDER_STATUS.completed
        ? {
            paymentAccepted: true,
            paymentMethod: extra?.paymentMethod ?? "cash",
            paymentAcceptedAt: new Date(),
            completedAt: new Date(),
          }
        : {}),
    },
    include: orderInclude(),
  });
}

export async function confirmRestaurantOrder(tenantId: string, orderId: string) {
  return transition(tenantId, orderId, [ORDER_STATUS.created], ORDER_STATUS.confirmed);
}

export async function startPreparingRestaurantOrder(
  tenantId: string,
  orderId: string,
) {
  return transition(
    tenantId,
    orderId,
    [ORDER_STATUS.confirmed],
    ORDER_STATUS.preparing,
  );
}

export async function markReadyRestaurantOrder(tenantId: string, orderId: string) {
  return transition(tenantId, orderId, [ORDER_STATUS.preparing], ORDER_STATUS.ready);
}

export async function completeRestaurantOrder(
  tenantId: string,
  orderId: string,
  input: { paymentAccepted?: boolean; paymentMethod?: string } = {},
) {
  return transition(tenantId, orderId, [ORDER_STATUS.ready], ORDER_STATUS.completed, {
    paymentAccepted: input.paymentAccepted === true,
    paymentMethod: input.paymentMethod,
  });
}

export async function cancelRestaurantOrder(tenantId: string, orderId: string) {
  const order = await getRestaurantOrder(tenantId, orderId);
  if (TERMINAL.includes(order.status as OrderStatus)) {
    throw new AppError("CONFLICT", `Order is terminal: ${order.status}`, 409);
  }
  return getDb().restaurantOrder.update({
    where: { id: orderId },
    data: { status: ORDER_STATUS.cancelled },
    include: orderInclude(),
  });
}
