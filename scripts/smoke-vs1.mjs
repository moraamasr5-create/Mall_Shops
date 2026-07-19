/**
 * VS1 smoke test — end-to-end Salon bootstrap against a running app + Supabase.
 *
 * Prerequisites:
 *   - supabase start (or hosted project)
 *   - prisma migrate deploy
 *   - npm run dev
 *   - .env filled from .env.example
 *
 * Usage:
 *   node scripts/smoke-vs1.mjs
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
  // Unique per run — do not reuse prior smoke identities.
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  // Hosted Auth rejects disposable domains like @example.com.
  const email = `vs1-smoke-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("1) signup");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup failed: ${signup.status} ${JSON.stringify(signup.json)}`);
  const token = signup.json.data.accessToken;
  assertOk(token, "missing accessToken");

  console.log("2) create tenant (bootstrap)");
  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `Smoke Salon ${stamp}` },
  });
  assertOk(
    tenantRes.status === 201,
    `create tenant failed: ${tenantRes.status} ${JSON.stringify(tenantRes.json)}`
  );
  const tenantId = tenantRes.json.data.tenant.id;
  assertOk(tenantId, "missing tenant id");

  console.log("3) list modules");
  const modules = await api(`/api/v1/tenants/${tenantId}/modules`, {
    token,
    tenantId,
  });
  assertOk(modules.status === 200, `modules failed: ${modules.status}`);
  const salonEnabled = (modules.json.data ?? []).some(
    (row) => row.moduleKey === "salon" && row.enabled
  );
  assertOk(salonEnabled, "salon module not enabled");

  console.log("4) create salon service");
  const serviceRes = await api("/api/v1/salon/services", {
    method: "POST",
    token,
    tenantId,
    body: {
      name: "Haircut",
      durationMin: 30,
      priceCents: 5000,
      currency: "SAR",
    },
  });
  assertOk(
    serviceRes.status === 201,
    `create service failed: ${serviceRes.status} ${JSON.stringify(serviceRes.json)}`
  );

  console.log("5) list salon services");
  const listRes = await api("/api/v1/salon/services", { token, tenantId });
  assertOk(listRes.status === 200, `list services failed: ${listRes.status}`);
  assertOk((listRes.json.data ?? []).length >= 1, "expected at least one service");
  const serviceId = listRes.json.data[0].id;

  console.log("6) create employee + open/close visit (OP-005 loop)");
  const empRes = await api("/api/v1/salon/employees", {
    method: "POST",
    token,
    tenantId,
    body: { name: "Smoke Stylist" },
  });
  assertOk(empRes.status === 201, `create employee failed: ${empRes.status}`);
  const employeeId = empRes.json.data.id;

  const visitRes = await api("/api/v1/salon/visits", {
    method: "POST",
    token,
    tenantId,
    body: {
      walkInCustomer: { name: "Smoke Guest" },
      employeeId,
      serviceIds: [serviceId],
    },
  });
  assertOk(
    visitRes.status === 201,
    `open visit failed: ${visitRes.status} ${JSON.stringify(visitRes.json)}`
  );
  const visitId = visitRes.json.data.id;
  assertOk(visitRes.json.data.status === "open", "visit should be open");
  assertOk((visitRes.json.data.services ?? []).length >= 1, "visit needs service line");

  const closeRes = await api(`/api/v1/salon/visits/${visitId}/close`, {
    method: "POST",
    token,
    tenantId,
  });
  assertOk(
    closeRes.status === 200,
    `close visit failed: ${closeRes.status} ${JSON.stringify(closeRes.json)}`
  );
  assertOk(closeRes.json.data.status === "closed", "visit should be closed");

  console.log("VS1 smoke passed.");
}

main().catch((error) => {
  console.error("VS1 smoke failed:", error.message);
  process.exit(1);
});
