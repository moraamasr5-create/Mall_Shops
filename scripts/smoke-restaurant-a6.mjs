/**
 * Restaurant Phase A — A6 Runtime Evidence (Time-based Order listing)
 *
 * Claim: Owner day Order list is time-bounded by openedAt query filters —
 * without Shift Aggregate / Open–Close / BusinessDay entity.
 *
 * Scenario:
 *   Order A openedAt inside window W
 *   Order B openedAt outside W
 *   GET /orders?openedFrom=&openedTo= → A in, B out
 *   No Shift required
 *
 * Fixture note: Order B's openedAt is backdated via DIRECT_URL (privileged
 * test setup only) so the window can be proven deterministically. Filtering
 * remains query behavior on restaurant_order.opened_at — not a BusinessDay Aggregate.
 *
 * Usage: npm run smoke:restaurant-a6
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.trim().startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 1) continue;
    const key = line.slice(0, i).trim();
    const value = line.slice(i + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile();

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
  const email = `rest-a6-${stamp}@gmail.com`;
  const password = `SmokeTest-${stamp.slice(-8)}!`;

  console.log("A6-1) signup + tenant + enable + catalog (no Shift)");
  const signup = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email, password },
  });
  assertOk(signup.status === 201, `signup: ${signup.status}`);
  const token = signup.json.data.accessToken;

  const tenantRes = await api("/api/v1/tenants", {
    method: "POST",
    token,
    body: { name: `tenant_a6_${stamp}` },
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
    body: { name: "A6" },
  });
  assertOk(cat.status === 201, `category: ${cat.status}`);
  const item = await api("/api/v1/restaurant/menu-items", {
    method: "POST",
    token,
    tenantId,
    body: {
      categoryId: cat.json.data.id,
      name: "Soup",
      priceCents: 800,
      currency: "SAR",
    },
  });
  assertOk(item.status === 201, `menu item: ${item.status}`);
  const menuItemId = item.json.data.id;

  console.log("A6-2) Create Order A (inside window) + Order B (will move outside)");
  const createA = await api("/api/v1/restaurant/orders", {
    method: "POST",
    token,
    tenantId,
    body: {
      fulfillmentMode: "dine_in",
      guestName: "Inside",
      lines: [{ menuItemId, quantity: 1 }],
    },
  });
  assertOk(createA.status === 201, `order A: ${createA.status}`);
  const orderA = createA.json.data;

  const createB = await api("/api/v1/restaurant/orders", {
    method: "POST",
    token,
    tenantId,
    body: {
      fulfillmentMode: "pickup",
      guestName: "Outside",
      lines: [{ menuItemId, quantity: 1 }],
    },
  });
  assertOk(createB.status === 201, `order B: ${createB.status}`);
  const orderB = createB.json.data;

  const openedA = new Date(orderA.openedAt);
  const windowFrom = new Date(openedA.getTime() - 60_000).toISOString();
  const windowTo = new Date(openedA.getTime() + 60_000).toISOString();
  const outsideOpenedAt = new Date(openedA.getTime() - 24 * 60 * 60_000);

  const directUrl = process.env.DIRECT_URL;
  assertOk(directUrl, "DIRECT_URL required for A6 fixture backdate");
  const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
  try {
    await prisma.restaurantOrder.update({
      where: { id: orderB.id },
      data: { openedAt: outsideOpenedAt },
    });
  } finally {
    await prisma.$disconnect();
  }

  console.log("A6-3) GET orders with openedFrom/openedTo — A in, B out");
  const qs = new URLSearchParams({
    openedFrom: windowFrom,
    openedTo: windowTo,
  });
  const listed = await api(`/api/v1/restaurant/orders?${qs}`, {
    token,
    tenantId,
  });
  assertOk(listed.status === 200, `list: ${listed.status} ${JSON.stringify(listed.json)}`);
  const ids = (listed.json.data ?? []).map((o) => o.id);
  assertOk(ids.includes(orderA.id), "Order A (inside W) missing from time-bounded list");
  assertOk(!ids.includes(orderB.id), "Order B (outside W) must not appear in time-bounded list");

  console.log("A6-4) Unfiltered list still sees both (query behavior, not delete)");
  const all = await api("/api/v1/restaurant/orders", { token, tenantId });
  assertOk(all.status === 200, `all list: ${all.status}`);
  const allIds = (all.json.data ?? []).map((o) => o.id);
  assertOk(allIds.includes(orderA.id) && allIds.includes(orderB.id), "unfiltered should include A and B");

  console.log("Restaurant A6 runtime smoke passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A6",
        claim: "Owner day queried by openedAt time boundary — no Shift",
        tenantId,
        orderA: orderA.id,
        orderB: orderB.id,
        window: { openedFrom: windowFrom, openedTo: windowTo },
        inWindow: [orderA.id],
        excluded: [orderB.id],
        shiftRequired: false,
        openShift: false,
        closeShift: false,
        businessDayEntity: false,
        explicitOut: [
          "Shift table",
          "BusinessDay Aggregate",
          "daily_reports",
          "sales summary",
          "owner dashboard",
          "end-of-day closing",
          "analytics",
        ],
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error("Restaurant A6 runtime smoke failed:", error.message);
  process.exit(1);
});
