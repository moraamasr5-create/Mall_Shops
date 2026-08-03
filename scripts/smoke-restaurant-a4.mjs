/**
 * Restaurant Phase A — A4 Runtime Evidence (Delivery-as-mode)
 *
 * Proves the SAME Order Success Loop with fulfillmentMode=delivery.
 * NOT a Delivery System: no Driver, Dispatch, fees, GPS, Notifications,
 * OutForDelivery entity, or Pilot product.
 *
 * Closed path:
 *   CreateOrder(delivery) → Confirm → Preparing → Ready → Complete
 *
 * Also proves:
 *   - fulfillmentMode=delivery preserved through Complete
 *   - dine_in Success Loop still works (no regression)
 *   - light tenant isolation on orders
 *   - same permission/module gate (restaurant enabled + order APIs)
 *
 * Usage: npm run smoke:restaurant-a4
 */

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

async function api(path, { method = "GET", token, tenantId, body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function transition(token, tenantId, orderId, action, extra = {}) {
  return api(`/api/v1/restaurant/orders/${orderId}`, {
    method: "POST",
    token,
    tenantId,
    body: { action, ...extra },
  });
}

async function runSuccessLoop(token, tenantId, menuItemId, fulfillmentMode) {
  const created = await api("/api/v1/restaurant/orders", {
    method: "POST",
    token,
    tenantId,
    body: {
      fulfillmentMode,
      guestName: fulfillmentMode === "delivery" ? "Delivery Guest" : "Dine-in Guest",
      lines: [{ menuItemId, quantity: 1 }],
    },
  });
  assertOk(
    created.status === 201,
    `create ${fulfillmentMode}: ${created.status} ${JSON.stringify(created.json)}`,
  );
  const order = created.json.data;
  assertOk(order.fulfillmentMode === fulfillmentMode, `mode on create: ${order.fulfillmentMode}`);
  assertOk(order.status === "created", "status created");

  let step = await transition(token, tenantId, order.id, "confirm");
  assertOk(step.status === 200 && step.json.data.status === "confirmed", `${fulfillmentMode} confirm`);
  assertOk(
    step.json.data.fulfillmentMode === fulfillmentMode,
    `${fulfillmentMode} mode after confirm`,
  );

  step = await transition(token, tenantId, order.id, "start_preparing");
  assertOk(step.status === 200 && step.json.data.status === "preparing", `${fulfillmentMode} preparing`);

  step = await transition(token, tenantId, order.id, "mark_ready");
  assertOk(step.status === 200 && step.json.data.status === "ready", `${fulfillmentMode} ready`);

  step = await transition(token, tenantId, order.id, "complete", {
    paymentAccepted: true,
    paymentMethod: "cash",
  });
  assertOk(
    step.status === 200 &&
      step.json.data.status === "completed" &&
      step.json.data.paymentAccepted === true &&
      step.json.data.fulfillmentMode === fulfillmentMode,
    `complete ${fulfillmentMode}: ${step.status} ${JSON.stringify(step.json)}`,
  );

  return step.json.data;
}

async function signupTenant(label) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const email = `rest-a4-${label}-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup ${label}: ${signup.status}`);
  const token = signup.json.data.accessToken;

  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_a4_${label}_${stamp}` },
  });
  assertOk(tenantRes.status === 201, `tenant ${label}: ${tenantRes.status}`);
  const tenantId = tenantRes.json.data.tenant.id;

  const enable = await api(`/api/v1/tenants/${tenantId}/modules`, {
    method: "POST",
    token,
    tenantId,
    body: { moduleKey: "restaurant" },
  });
  assertOk(enable.status === 201, `enable ${label}: ${enable.status}`);

  return { token, tenantId, stamp };
}

async function setupCatalog(token, tenantId) {
  const cat = await api("/api/v1/restaurant/categories", {
    method: "POST",
    token,
    tenantId,
    body: { name: "Mains" },
  });
  assertOk(cat.status === 201, `category: ${cat.status}`);
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token,
    tenantId,
    body: {
      categoryId: cat.json.data.id,
      name: "Burger",
      priceCents: 2500,
      currency: "SAR",
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status}`);
  return item.json.data.id;
}

async function main() {
  console.log("A4-1) Tenant A — enable restaurant + catalog");
  const a = await signupTenant("a");
  const menuItemId = await setupCatalog(a.token, a.tenantId);

  console.log("A4-2) Delivery-as-mode Success Loop (same states as dine_in)");
  const deliveryOrder = await runSuccessLoop(
    a.token,
    a.tenantId,
    menuItemId,
    "delivery",
  );

  console.log("A4-3) dine_in Success Loop still works (no regression)");
  const dineInOrder = await runSuccessLoop(a.token, a.tenantId, menuItemId, "dine_in");

  console.log("A4-4) Tenant B isolation — cannot see Tenant A orders");
  const b = await signupTenant("b");
  const foreign = await api("/api/v1/restaurant/orders", {
    token: b.token,
    tenantId: b.tenantId,
  });
  assertOk(foreign.status === 200, `tenant B list: ${foreign.status}`);
  assertOk(
    !(foreign.json.data ?? []).some(
      (o) => o.id === deliveryOrder.id || o.id === dineInOrder.id,
    ),
    "tenant B saw tenant A orders",
  );

  console.log("Restaurant A4 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A4",
        claim: "Delivery-as-mode (not Delivery System)",
        tenantA: a.tenantId,
        deliveryOrderId: deliveryOrder.id,
        deliveryModePreserved: deliveryOrder.fulfillmentMode === "delivery",
        dineInOrderId: dineInOrder.id,
        dineInUnbroken: dineInOrder.fulfillmentMode === "dine_in",
        path: "created→confirmed→preparing→ready→completed",
        isolation: "PASS",
        explicitOut: [
          "Delivery entity",
          "Driver assignment",
          "Dispatch queue",
          "Delivery fees",
          "GPS tracking",
          "Notifications",
          "OutForDelivery/Delivered product states",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Restaurant A4 runtime smoke failed:", error.message);
  process.exit(1);
});
