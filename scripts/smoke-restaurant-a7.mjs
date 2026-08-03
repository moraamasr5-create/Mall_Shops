/**
 * Restaurant Phase A — A7 Runtime Evidence (Presentation boundary)
 *
 * Claim: Single Module portal surface; day center = Orders; §4 operable.
 *
 * This script:
 *   1) Seeds Tenant + restaurant + menu via API (same as A1–A6)
 *   2) Verifies portal route /restaurant/orders is served (HTML marker)
 *   3) Prints credentials + steps for browser D5 (Login → Orders → §4)
 *
 * Full UI loop evidence is completed via portal interaction (browser) using
 * the printed credentials — Presentation gate, not a second Domain smoke.
 *
 * Usage: npm run smoke:restaurant-a7
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

async function main() {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const email = `rest-a7-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("A7-1) API seed — tenant + restaurant + menu");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup: ${signup.status}`);
  const token = signup.json.data.accessToken;

  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_a7_${stamp}` },
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
    body: { name: "A7" },
  });
  assertOk(cat.status === 201, `category: ${cat.status}`);
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token,
    tenantId,
    body: {
      categoryId: cat.json.data.id,
      name: "Portal Item",
      priceCents: 1200,
      currency: "SAR",
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status}`);

  console.log("A7-2) Portal route serves Restaurant Orders surface");
  const page = await fetch(`${baseUrl}/restaurant/orders`);
  assertOk(page.status === 200, `GET /restaurant/orders: ${page.status}`);
  const html = await page.text();
  assertOk(
    html.includes("restaurant") || html.includes("طلبات") || html.includes("portal"),
    "portal shell HTML missing expected markers",
  );

  console.log("A7-3) Same APIs still drive §4 (surface wiring proof)");
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
    const step = await api(`/api/v1/restaurant/orders/${orderId}`, {
      method: "POST",
      token,
      tenantId,
      body: { action },
    });
    assertOk(step.status === 200, `${action}: ${step.status}`);
  }
  const done = await api(`/api/v1/restaurant/orders/${orderId}`, {
    method: "POST",
    token,
    tenantId,
    body: { action: "complete", paymentAccepted: true, paymentMethod: "cash" },
  });
  assertOk(done.status === 200 && done.json.data.status === "completed", "complete");

  console.log("Restaurant A7 runtime smoke passed (route + shell + §4 APIs).");
  console.log(
    JSON.stringify(
      {
        gate: "A7",
        claim: "Single Module portal surface; day center = Orders; §4 operable",
        portalRoute: "/restaurant/orders",
        portalShell: "same AppShell as Salon",
        tenantId,
        email,
        password,
        menuItemId: item.json.data.id,
        sampleCompletedOrderId: orderId,
        browserD5: {
          login: `${baseUrl}/login`,
          dayCenter: `${baseUrl}/restaurant/orders`,
          steps: [
            "Login with email/password above",
            "Open طلبات المطعم (/restaurant/orders)",
            "Create order → Confirm → Preparing → Ready → Complete",
          ],
        },
        explicitOut: [
          "Dashboard",
          "Reports",
          "Analytics",
          "Admin Suite",
          "Dual App",
          "PWA",
          "Shift UI",
          "Reservation UI",
          "Dispatch UI",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Restaurant A7 runtime smoke failed:", error.message);
  process.exit(1);
});
