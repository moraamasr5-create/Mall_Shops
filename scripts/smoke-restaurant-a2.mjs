/**
 * Restaurant Phase A — A2 Runtime Evidence (Menu + RestaurantEmployee slice)
 *
 * Enable restaurant → Category → MenuItem → assign RestaurantEmployee → read back
 * + light tenant isolation (Tenant B cannot list Tenant A menu items).
 *
 * Prerequisites: same as smoke:vs1 / smoke:restaurant-a1
 * Usage: npm run smoke:restaurant-a2
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

async function signupTenant(label) {
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const email = `rest-a2-${label}-${stamp}@gmail.com`;
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
    body: { name: `tenant_a2_${label}_${stamp}` },
  });
  assertOk(tenantRes.status === 201, `tenant ${label}: ${tenantRes.status}`);
  const tenantId = tenantRes.json.data.tenant.id;
  const membershipId =
    tenantRes.json.data.membership?.id ?? tenantRes.json.data.ownerMembership?.id;

  const enable = await api(`/api/v1/tenants/${tenantId}/modules`, {
    method: "POST",
    token,
    tenantId,
    body: { moduleKey: "restaurant" },
  });
  assertOk(enable.status === 201, `enable ${label}: ${enable.status}`);

  return { token, tenantId, membershipId, email };
}

async function main() {
  console.log("A2-1) Tenant A bootstrap + enable restaurant");
  const a = await signupTenant("a");
  assertOk(a.membershipId, "missing membership id from create tenant");

  console.log("A2-2) Create category");
  const cat = await api("/api/v1/restaurant/categories", {
    method: "POST",
    token: a.token,
    tenantId: a.tenantId,
    body: { name: "Mains" },
  });
  assertOk(cat.status === 201, `category: ${cat.status} ${JSON.stringify(cat.json)}`);
  const categoryId = cat.json.data.id;

  console.log("A2-3) Create menu item");
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token: a.token,
    tenantId: a.tenantId,
    body: {
      categoryId,
      name: "Grilled Chicken",
      priceCents: 4500,
      currency: "SAR",
      available: true,
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status} ${JSON.stringify(item.json)}`);
  const itemId = item.json.data.id;

  console.log("A2-4) Assign RestaurantEmployee (cashier) on OWNER membership");
  const emp = await api("/api/v1/restaurant/employees", {
    method: "POST",
    token: a.token,
    tenantId: a.tenantId,
    body: { membershipId: a.membershipId, restaurantRole: "cashier" },
  });
  assertOk(emp.status === 201, `employee: ${emp.status} ${JSON.stringify(emp.json)}`);

  console.log("A2-5) Read back menu + employees");
  const items = await api("/api/v1/restaurant/menu-items", {
    token: a.token,
    tenantId: a.tenantId,
  });
  assertOk(items.status === 200, `list items: ${items.status}`);
  assertOk(
    (items.json.data ?? []).some((row) => row.id === itemId),
    "menu item missing from list"
  );

  const employees = await api("/api/v1/restaurant/employees", {
    token: a.token,
    tenantId: a.tenantId,
  });
  assertOk(employees.status === 200, `list employees: ${employees.status}`);
  assertOk(
    (employees.json.data ?? []).some(
      (row) =>
        row.membershipId === a.membershipId &&
        row.restaurantRole === "cashier" &&
        row.status === "active"
    ),
    "assignment missing from list"
  );

  console.log("A2-6) Tenant B isolation — cannot see Tenant A menu");
  const b = await signupTenant("b");
  const foreign = await api("/api/v1/restaurant/menu-items", {
    token: b.token,
    tenantId: b.tenantId,
  });
  assertOk(foreign.status === 200, `tenant B list: ${foreign.status}`);
  assertOk(
    !(foreign.json.data ?? []).some((row) => row.id === itemId),
    "tenant B saw tenant A menu item"
  );

  console.log("Restaurant A2 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A2",
        tenantA: a.tenantId,
        categoryId,
        itemId,
        membershipId: a.membershipId,
        isolation: "PASS",
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Restaurant A2 runtime smoke failed:", error.message);
  process.exit(1);
});
