/**
 * Restaurant Phase A — A3 Runtime Evidence (Order Success Loop / Thesis §4)
 *
 * dine_in path: Create → Confirm → Preparing → Ready → Complete (+ PaymentAcceptance)
 * No Delivery dispatch, Shift, Reservation, KitchenTicket, or Payment Aggregate.
 *
 * Usage: npm run smoke:restaurant-a3
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

async function main() {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const email = `rest-a3-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("A3-1) signup + tenant + enable restaurant");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup: ${signup.status}`);
  const token = signup.json.data.accessToken;

  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_a3_${stamp}` },
  });
  assertOk(tenantRes.status === 201, `tenant: ${tenantRes.status}`);
  const tenantId = tenantRes.json.data.tenant.id;

  const enable = await api(`/api/v1/tenants/${tenantId}/modules`, {
    method: "POST",
    token,
    tenantId,
    body: { moduleKey: "restaurant" },
  });
  assertOk(enable.status === 201, `enable: ${enable.status}`);

  console.log("A3-2) catalog setup");
  const cat = await api("/api/v1/restaurant/categories", {
    method: "POST",
    token,
    tenantId,
    body: { name: "Drinks" },
  });
  assertOk(cat.status === 201, `category: ${cat.status}`);
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token,
    tenantId,
    body: {
      categoryId: cat.json.data.id,
      name: "Tea",
      priceCents: 500,
      currency: "SAR",
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status}`);

  console.log("A3-3) CreateOrder (dine_in) with line");
  const created = await api("/api/v1/restaurant/orders", {
    method: "POST",
    token,
    tenantId,
    body: {
      fulfillmentMode: "dine_in",
      guestName: "Walk-in Guest",
      lines: [{ menuItemId: item.json.data.id, quantity: 2 }],
    },
  });
  assertOk(created.status === 201, `create: ${created.status} ${JSON.stringify(created.json)}`);
  const orderId = created.json.data.id;
  assertOk(created.json.data.status === "created", "status created");
  assertOk((created.json.data.lines ?? []).length === 1, "expected one line");

  console.log("A3-4) Confirm → Preparing → Ready → Complete");
  let step = await transition(token, tenantId, orderId, "confirm");
  assertOk(step.status === 200 && step.json.data.status === "confirmed", "confirm");
  step = await transition(token, tenantId, orderId, "start_preparing");
  assertOk(step.status === 200 && step.json.data.status === "preparing", "preparing");
  step = await transition(token, tenantId, orderId, "mark_ready");
  assertOk(step.status === 200 && step.json.data.status === "ready", "ready");
  step = await transition(token, tenantId, orderId, "complete", {
    paymentAccepted: true,
    paymentMethod: "cash",
  });
  assertOk(
    step.status === 200 &&
      step.json.data.status === "completed" &&
      step.json.data.paymentAccepted === true,
    `complete: ${step.status} ${JSON.stringify(step.json)}`
  );

  console.log("A3-5) list orders includes completed");
  const list = await api("/api/v1/restaurant/orders", { token, tenantId });
  assertOk(list.status === 200, `list: ${list.status}`);
  assertOk(
    (list.json.data ?? []).some((o) => o.id === orderId && o.status === "completed"),
    "completed order missing from list"
  );

  console.log("Restaurant A3 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A3",
        tenantId,
        orderId,
        path: "created→confirmed→preparing→ready→completed",
        paymentAccepted: true,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Restaurant A3 runtime smoke failed:", error.message);
  process.exit(1);
});
