/**
 * Restaurant Phase A — A8 Negative OUT Check (scope discipline)
 *
 * Claim: Phase A completed without introducing Thesis Explicit OUT / Never P0
 * domains, Shared products without Trigger+OP, or a separate Restaurant app.
 *
 * This is a discipline gate — not a Feature. Evidence = absence proofs.
 *
 * Usage: npm run smoke:restaurant-a8
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function assertOk(condition, message) {
  if (!condition) throw new Error(message);
}

function listFilesRecursive(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFilesRecursive(full, acc);
    else acc.push(full);
  }
  return acc;
}

function main() {
  console.log("A8-1) Prisma schema — forbidden Domain models absent");
  const schema = fs.readFileSync(path.join(root, "prisma", "schema.prisma"), "utf8");
  const modelNames = [...schema.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]);

  const forbidden = [
    "Shift",
    "RestaurantShift",
    "Reservation",
    "RestaurantReservation",
    "Dispatch",
    "DispatchQueue",
    "Driver",
    "Pilot",
    "PilotDuty",
    "Trip",
    "KitchenTicket",
    "Payment",
    "PaymentAggregate",
    "Invoice",
    "Settlement",
    "BusinessDay",
    "DailyReport",
    "AnalyticsEvent",
  ];
  for (const name of forbidden) {
    assertOk(!modelNames.includes(name), `forbidden model present: ${name}`);
  }

  console.log("A8-2) Allowed Restaurant persistence only");
  const allowedRestaurant = [
    "RestaurantCategory",
    "RestaurantMenuItem",
    "RestaurantEmployeeAssignment",
    "RestaurantOrder",
    "RestaurantOrderLine",
  ];
  for (const name of allowedRestaurant) {
    assertOk(modelNames.includes(name), `expected Restaurant model missing: ${name}`);
  }
  const restaurantModels = modelNames.filter((n) => n.startsWith("Restaurant"));
  for (const name of restaurantModels) {
    assertOk(
      allowedRestaurant.includes(name),
      `unexpected Restaurant* model (scope creep): ${name}`,
    );
  }

  console.log("A8-3) Restaurant API routes stay inside A1–A7 surface");
  const apiRoot = path.join(root, "src", "app", "api", "v1", "restaurant");
  const apiFiles = listFilesRecursive(apiRoot).map((f) =>
    path.relative(apiRoot, f).replace(/\\/g, "/"),
  );
  const allowedApiFragments = [
    "categories/route.ts",
    "categories/[categoryId]/route.ts",
    "menu-items/route.ts",
    "employees/route.ts",
    "orders/route.ts",
    "orders/[orderId]/route.ts",
  ];
  for (const f of apiFiles) {
    assertOk(
      allowedApiFragments.includes(f),
      `unexpected restaurant API route: ${f}`,
    );
  }
  for (const f of [
    "shifts",
    "reservations",
    "dispatch",
    "drivers",
    "pilots",
    "kitchen",
    "payments",
    "invoices",
    "settlement",
    "reports",
    "analytics",
  ]) {
    assertOk(
      !apiFiles.some((p) => p.includes(f)),
      `OUT domain route leaked: ${f}`,
    );
  }

  console.log("A8-4) Portal — single Orders surface; no OUT screens");
  const portalRest = path.join(root, "src", "app", "(portal)", "restaurant");
  const portalFiles = listFilesRecursive(portalRest).map((f) =>
    path.relative(portalRest, f).replace(/\\/g, "/"),
  );
  assertOk(
    portalFiles.includes("orders/page.tsx"),
    "missing /restaurant/orders page",
  );
  assertOk(
    portalFiles.every((f) => f === "orders/page.tsx"),
    `unexpected portal restaurant pages: ${portalFiles.join(", ")}`,
  );

  console.log("A8-5) No new Shared Capability packages");
  const sharedDir = path.join(root, "src", "shared");
  const sharedFiles = listFilesRecursive(sharedDir).map((f) =>
    path.relative(sharedDir, f).replace(/\\/g, "/"),
  );
  assertOk(
    sharedFiles.every((f) => ["errors.ts", "slug.ts"].includes(f)),
    `unexpected shared files (possible Shared creep): ${sharedFiles.join(", ")}`,
  );
  assertOk(
    !fs.existsSync(path.join(root, "src", "shared", "notify")),
    "notify Shared present",
  );
  assertOk(
    !fs.existsSync(path.join(root, "src", "modules", "restaurant", "app")),
    "separate restaurant app package present",
  );

  console.log("Restaurant A8 negative OUT check passed.");
  console.log(
    JSON.stringify(
      {
        gate: "A8",
        claim:
          "Phase A completed without Thesis Explicit OUT / Never P0 / dual-app / Shared creep",
        prismaModels: modelNames,
        restaurantModels: allowedRestaurant,
        restaurantApiRoutes: apiFiles,
        portalSurfaces: portalFiles,
        sharedFiles,
        absent: forbidden,
        note:
          "restaurantRole vocabulary may include 'pilot' as a string on Employee assignment — Pilot/dispatch *product* is still OUT",
      },
      null,
      2,
    ),
  );
}

main();
