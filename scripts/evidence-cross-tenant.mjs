/**
 * Operational Evidence — Live Cross-Tenant isolation.
 *
 * Proves:
 *   Tenant A data is not readable by Identity B (and vice versa).
 *
 * Prerequisites (same as VS1 smoke — no infra changes in this script):
 *   - App running (npm run dev)
 *   - Supabase Auth + migrated DB
 *   - .env configured
 *
 * Usage:
 *   npm run evidence:cross-tenant
 *
 * Exit codes:
 *   0 = PASS (runtime isolation proven)
 *   1 = FAIL (runtime ran; tenant isolation broken)
 *   2 = NOT_EXECUTED (environment unavailable; no conclusion)
 *
 * Writes: docs/evidence/cross-tenant-latest.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CROSS_TENANT_CASE_SPECS,
  evaluateCase,
  isNotExecutedError,
  renderNotExecutedReport,
  summarizeResults,
} from "./lib/cross-tenant-evidence.mjs";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportPath = path.join(
  __dirname,
  "..",
  "docs",
  "evidence",
  "cross-tenant-latest.md"
);

async function api(pathname, { method = "GET", token, tenantId, body } = {}) {
  const headers = { "content-type": "application/json" };
  if (token) headers.authorization = `Bearer ${token}`;
  if (tenantId) headers["x-tenant-id"] = tenantId;

  let res;
  try {
    res = await fetch(`${baseUrl}${pathname}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const wrapped = new Error(
      `Application was not reachable at ${baseUrl} (${error instanceof Error ? error.message : String(error)})`
    );
    /** @type {Error & { cause?: unknown }} */ (wrapped).cause = error;
    throw wrapped;
  }

  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

function dataRows(payload) {
  const data = payload?.json?.data;
  if (Array.isArray(data)) return data.length;
  if (data == null) return 0;
  return 1;
}

function writeReport(contents) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, contents, "utf8");
}

function renderReport({ overall, passed, failed, results, meta }) {
  const lines = [
    "# Cross-Tenant Operational Evidence — Latest Run",
    "",
    `**Overall:** ${overall}`,
    `**Passed:** ${passed}`,
    `**Failed:** ${failed}`,
    `**Base URL:** ${meta.baseUrl}`,
    `**Ran at:** ${meta.ranAt}`,
    "",
    "| Case | Result | Detail |",
    "|------|--------|--------|",
  ];

  for (const row of results) {
    lines.push(
      `| \`${row.id}\` — ${row.title} | **${row.result}** | ${row.detail.replace(/\|/g, "/")} |`
    );
  }

  lines.push(
    "",
    "## Status legend",
    "",
    "- **PASS** — runtime ran; isolation proven",
    "- **FAIL** — runtime ran; tenant isolation broken",
    "- **NOT_EXECUTED** — environment unavailable; no conclusion",
    "",
    "## Interpretation",
    "",
    "- **PASS** means Identity/Tenant A cannot read Tenant B data via the public API (and vice versa).",
    "- Expected denials are HTTP **403** with **0** business rows exposed.",
    "- **FAIL** means a live isolation case broke — treat as a security regression.",
    "- This is Operational Evidence for Layer 1+2 isolation on the live request path — not an architecture change.",
    ""
  );

  return lines.join("\n");
}

function setupError(message) {
  const error = new Error(`setup incomplete (NOT_EXECUTED): ${message}`);
  return error;
}

async function main() {
  const stamp = Date.now();
  const password = "EvidenceTest1!";

  console.log("Operational Evidence: Cross-Tenant");
  console.log(`Base URL: ${baseUrl}`);

  const signupA = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email: `evidence-a-${stamp}@example.com`, password },
  });
  if (signupA.status !== 201 || !signupA.json?.data?.accessToken) {
    throw setupError(
      `signup A → ${signupA.status} ${JSON.stringify(signupA.json)}`
    );
  }
  const tokenA = signupA.json.data.accessToken;

  const signupB = await api("/api/v1/auth/signup", {
    method: "POST",
    body: { email: `evidence-b-${stamp}@example.com`, password },
  });
  if (signupB.status !== 201 || !signupB.json?.data?.accessToken) {
    throw setupError(
      `signup B → ${signupB.status} ${JSON.stringify(signupB.json)}`
    );
  }
  const tokenB = signupB.json.data.accessToken;

  const tenantARes = await api("/api/v1/tenants", {
    method: "POST",
    token: tokenA,
    body: { name: `Evidence Tenant A ${stamp}` },
  });
  if (tenantARes.status !== 201) {
    throw setupError(
      `tenant A → ${tenantARes.status} ${JSON.stringify(tenantARes.json)}`
    );
  }
  const tenantA = tenantARes.json.data.tenant.id;

  const tenantBRes = await api("/api/v1/tenants", {
    method: "POST",
    token: tokenB,
    body: { name: `Evidence Tenant B ${stamp}` },
  });
  if (tenantBRes.status !== 201) {
    throw setupError(
      `tenant B → ${tenantBRes.status} ${JSON.stringify(tenantBRes.json)}`
    );
  }
  const tenantB = tenantBRes.json.data.tenant.id;

  const serviceARes = await api("/api/v1/salon/services", {
    method: "POST",
    token: tokenA,
    tenantId: tenantA,
    body: {
      name: `Secret Cut ${stamp}`,
      durationMin: 30,
      priceCents: 9900,
      currency: "SAR",
    },
  });
  if (serviceARes.status !== 201) {
    throw setupError(
      `service A → ${serviceARes.status} ${JSON.stringify(serviceARes.json)}`
    );
  }
  const serviceAId = serviceARes.json.data.id;

  const listA = await api("/api/v1/salon/services", {
    token: tokenA,
    tenantId: tenantA,
  });
  const denyBWithA = await api("/api/v1/salon/services", {
    token: tokenB,
    tenantId: tenantA,
  });
  const denyAWithB = await api("/api/v1/salon/services", {
    token: tokenA,
    tenantId: tenantB,
  });
  const listB = await api("/api/v1/salon/services", {
    token: tokenB,
    tenantId: tenantB,
  });
  const denyBGetA = await api(`/api/v1/salon/services/${serviceAId}`, {
    token: tokenB,
    tenantId: tenantA,
  });
  const denyBWriteA = await api("/api/v1/salon/services", {
    method: "POST",
    token: tokenB,
    tenantId: tenantA,
    body: {
      name: `Hostile Write ${stamp}`,
      durationMin: 15,
      priceCents: 1,
      currency: "SAR",
    },
  });

  const actualById = {
    A_lists_own_services: {
      actualStatus: listA.status,
      dataRows: dataRows(listA),
    },
    B_with_A_tenant_header: {
      actualStatus: denyBWithA.status,
      dataRows: dataRows(denyBWithA),
    },
    A_with_B_tenant_header: {
      actualStatus: denyAWithB.status,
      dataRows: dataRows(denyAWithB),
    },
    B_lists_own_services_empty_of_A: {
      actualStatus: listB.status,
      dataRows: dataRows(listB),
    },
    B_get_A_service_by_id_denied: {
      actualStatus: denyBGetA.status,
      dataRows: dataRows(denyBGetA),
    },
    B_write_A_tenant_denied: {
      actualStatus: denyBWriteA.status,
      dataRows: dataRows(denyBWriteA),
    },
  };

  const evaluated = CROSS_TENANT_CASE_SPECS.map((spec) => {
    const actual = actualById[spec.id];
    const caseInput = {
      id: spec.id,
      title: spec.title,
      actualStatus: actual.actualStatus,
      expectedStatuses: spec.expectedStatuses,
      dataRows: actual.dataRows,
      maxDataRows: spec.maxDataRows,
    };

    if (spec.requireMinRows != null) {
      if (
        !spec.expectedStatuses.includes(actual.actualStatus) ||
        (actual.dataRows ?? 0) < spec.requireMinRows
      ) {
        return {
          id: spec.id,
          title: spec.title,
          result: "FAIL",
          detail: `expected status ${spec.expectedStatuses.join("|")} and >= ${spec.requireMinRows} row(s); got status ${actual.actualStatus}, rows ${actual.dataRows}`,
        };
      }
      return {
        id: spec.id,
        title: spec.title,
        result: "PASS",
        detail: `status ${actual.actualStatus}, rows ${actual.dataRows}`,
      };
    }

    return evaluateCase(caseInput);
  });

  const summary = summarizeResults(evaluated);
  const report = renderReport({
    ...summary,
    meta: {
      baseUrl,
      ranAt: new Date().toISOString(),
      tenantA,
      tenantB,
      serviceAId,
    },
  });

  writeReport(report);
  console.log("");
  console.log(report);
  console.log(`Report written: ${reportPath}`);

  if (summary.overall === "PASS") {
    process.exit(0);
  }

  process.exit(1);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  const notExecuted =
    isNotExecutedError(error) ||
    message.includes("NOT_EXECUTED") ||
    message.includes("setup incomplete");

  const ranAt = new Date().toISOString();

  if (notExecuted) {
    const report = renderNotExecutedReport({
      baseUrl,
      ranAt,
      reason: message,
    });
    try {
      writeReport(report);
    } catch {
      // ignore write errors during environment failure
    }
    console.log(report);
    console.error("Cross-tenant evidence NOT_EXECUTED:", message);
    process.exit(2);
  }

  const failReport = [
    "# Cross-Tenant Operational Evidence — Latest Run",
    "",
    "**Overall:** FAIL",
    "",
    `Unexpected runtime error after evidence execution started: ${message}`,
    "",
    `**Ran at:** ${ranAt}`,
    `**Base URL:** ${baseUrl}`,
    "",
  ].join("\n");

  try {
    writeReport(failReport);
  } catch {
    // ignore
  }

  console.error("Cross-tenant evidence FAIL:", message);
  process.exit(1);
});
