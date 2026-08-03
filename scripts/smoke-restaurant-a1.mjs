/**
 * Restaurant Phase A — A1 Runtime Evidence
 *
 * Proves TenantModule activation for `restaurant` against a running app + DB:
 *   signup → create tenant → GET restaurant categories → MODULE_NOT_ENABLED (403)
 *   → POST enable restaurant → GET modules shows enabled
 *   → GET restaurant categories → 200
 *
 * Prerequisites: same as smoke:vs1 (app + Supabase + migrate + .env)
 *
 * Usage:
 *   node scripts/smoke-restaurant-a1.mjs
 *   npm run smoke:restaurant-a1
 */

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

function assertOk(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
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
  const email = `rest-a1-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("A1-1) signup");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(
    signup.status === 201,
    `signup failed: ${signup.status} ${JSON.stringify(signup.json)}`
  );
  const token = signup.json.data.accessToken;
  assertOk(token, "missing accessToken");

  console.log("A1-2) create tenant (salon bootstrap; restaurant not initial)");
  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_demo_restaurant_${stamp}` },
  });
  assertOk(
    tenantRes.status === 201,
    `create tenant failed: ${tenantRes.status} ${JSON.stringify(tenantRes.json)}`
  );
  const tenantId = tenantRes.json.data.tenant.id;
  assertOk(tenantId, "missing tenant id");

  console.log("A1-3) GET /api/v1/restaurant/categories WITHOUT restaurant enabled");
  const blocked = await api("/api/v1/restaurant/categories", { token, tenantId });
  assertOk(
    blocked.status === 403,
    `expected 403 before enable, got ${blocked.status} ${JSON.stringify(blocked.json)}`
  );
  const blockedCode = blocked.json?.error?.code ?? blocked.json?.code;
  assertOk(
    blockedCode === "MODULE_NOT_ENABLED",
    `expected MODULE_NOT_ENABLED, got ${blockedCode} ${JSON.stringify(blocked.json)}`
  );

  console.log("A1-4) POST enable restaurant module");
  const enable = await api(`/api/v1/tenants/${tenantId}/modules`, {
    method: "POST",
    token,
    tenantId,
    body: { moduleKey: "restaurant" },
  });
  assertOk(
    enable.status === 201,
    `enable restaurant failed: ${enable.status} ${JSON.stringify(enable.json)}`
  );
  assertOk(
    enable.json.data?.moduleKey === "restaurant" && enable.json.data?.enabled === true,
    `enable payload unexpected: ${JSON.stringify(enable.json)}`
  );

  console.log("A1-5) GET modules — restaurant enabled");
  const modules = await api(`/api/v1/tenants/${tenantId}/modules`, {
    token,
    tenantId,
  });
  assertOk(modules.status === 200, `modules list failed: ${modules.status}`);
  const restaurantEnabled = (modules.json.data ?? []).some(
    (row) => row.moduleKey === "restaurant" && row.enabled
  );
  assertOk(restaurantEnabled, "restaurant module not enabled after POST");

  console.log("A1-6) GET /api/v1/restaurant/categories AFTER enable");
  const allowed = await api("/api/v1/restaurant/categories", { token, tenantId });
  assertOk(
    allowed.status === 200,
    `expected 200 after enable, got ${allowed.status} ${JSON.stringify(allowed.json)}`
  );
  assertOk(Array.isArray(allowed.json.data), "expected categories array");

  console.log("Restaurant A1 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A1",
        tenantId,
        email,
        before: { status: 403, code: "MODULE_NOT_ENABLED" },
        after: { status: 200, restaurantEnabled: true },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Restaurant A1 runtime smoke failed:", error.message);
  process.exit(1);
});
