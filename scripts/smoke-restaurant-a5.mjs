/**
 * Restaurant Phase A — A5 Runtime Evidence (Money rule on Complete)
 *
 * Claim: Completed Order requires PaymentAcceptance snapshot on Order.
 * Proves require (not merely store): Complete without acceptance is rejected.
 *
 * NOT: Payment Aggregate · Invoice · ledger · Refunds · Settlement
 *
 * Path:
 *   Ready → Complete WITHOUT paymentAccepted → 422
 *   Ready → Complete WITH paymentAccepted=true → 200 + snapshot preserved
 *
 * Usage: npm run smoke:restaurant-a5
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
  const email = `rest-a5-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("A5-1) signup + tenant + enable + catalog");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup: ${signup.status}`);
  const token = signup.json.data.accessToken;

  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_a5_${stamp}` },
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

  const cat = await api("/api/v1/restaurant/categories", {
    method: "POST",
    token,
    tenantId,
    body: { name: "A5" },
  });
  assertOk(cat.status === 201, `category: ${cat.status}`);
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token,
    tenantId,
    body: {
      categoryId: cat.json.data.id,
      name: "Item",
      priceCents: 1000,
      currency: "SAR",
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status}`);

  console.log("A5-2) Create → Confirm → Preparing → Ready");
  const created = await api("/api/v1/restaurant/orders", {
    method: "POST",
    token,
    tenantId,
    body: {
      fulfillmentMode: "dine_in",
      lines: [{ menuItemId: item.json.data.id, quantity: 1 }],
    },
  });
  assertOk(created.status === 201, `create: ${created.status}`);
  const orderId = created.json.data.id;

  for (const action of ["confirm", "start_preparing", "mark_ready"]) {
    const step = await transition(token, tenantId, orderId, action);
    assertOk(step.status === 200, `${action}: ${step.status}`);
  }

  console.log("A5-3) Complete WITHOUT PaymentAcceptance — must reject");
  const rejected = await transition(token, tenantId, orderId, "complete", {
    paymentMethod: "cash",
  });
  assertOk(
    rejected.status === 422,
    `expected 422 without acceptance, got ${rejected.status} ${JSON.stringify(rejected.json)}`,
  );
  const rejectedCode = rejected.json?.error?.code ?? rejected.json?.code;
  assertOk(
    rejectedCode === "VALIDATION_ERROR",
    `expected VALIDATION_ERROR, got ${rejectedCode}`,
  );

  const stillReady = await api(`/api/v1/restaurant/orders/${orderId}`, {
    token,
    tenantId,
  });
  assertOk(
    stillReady.status === 200 && stillReady.json.data.status === "ready",
    "order must remain ready after rejected complete",
  );
  assertOk(
    stillReady.json.data.paymentAccepted === false,
    "paymentAccepted must stay false after reject",
  );

  console.log("A5-4) Complete WITH PaymentAcceptance — must succeed");
  const ok = await transition(token, tenantId, orderId, "complete", {
    paymentAccepted: true,
    paymentMethod: "cash",
  });
  assertOk(
    ok.status === 200 &&
      ok.json.data.status === "completed" &&
      ok.json.data.paymentAccepted === true &&
      ok.json.data.paymentMethod === "cash" &&
      ok.json.data.paymentAcceptedAt,
    `complete with acceptance: ${ok.status} ${JSON.stringify(ok.json)}`,
  );

  console.log("Restaurant A5 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A5",
        claim: "Complete requires PaymentAcceptance snapshot on Order",
        tenantId,
        orderId,
        withoutAcceptance: { status: 422, orderRemains: "ready" },
        withAcceptance: {
          status: 200,
          paymentAccepted: true,
          paymentMethod: "cash",
          preserved: true,
        },
        explicitOut: [
          "Payment Aggregate",
          "Invoice",
          "Transaction ledger",
          "Refunds",
          "Settlement",
          "Accounting",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Restaurant A5 runtime smoke failed:", error.message);
  process.exit(1);
});
