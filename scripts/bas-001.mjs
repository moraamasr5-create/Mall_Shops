/**
 * BAS-001 — First salon owner user story (Public APIs only).
 *
 * Determinism: every run uses a unique runId → unique email, tenant name,
 * and fresh business entity names. Never reuses prior identities/tenants.
 *
 * Forbidden in-scenario: Service Role, SQL, Dashboard.
 * Artifacts: docs/evidence/bas-001-latest.md only (summary written by operator/agent after run).
 * Usage: node scripts/bas-001.mjs  (only after rc1-env-preflight PASS)
 */

import { writeFileSync, mkdirSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const __dirname = dirname(fileURLToPath(import.meta.url));
const evidencePath = join(__dirname, "..", "docs", "evidence", "bas-001-latest.md");

const steps = [];

function record(step, status, summary, ok, requestId = null) {
  steps.push({ step, status, summary, ok, requestId: requestId || "—" });
  const rid = requestId ? ` requestId=${requestId}` : "";
  console.log(`[${ok ? "PASS" : "FAIL"}] ${step} → HTTP ${status}: ${summary}${rid}`);
}

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

function summarize(json) {
  if (json?.error?.message) return json.error.message;
  if (json?.data?.tenant?.id) return `tenantId=${json.data.tenant.id}`;
  if (json?.data?.id) return `id=${json.data.id}`;
  if (json?.data?.identity?.email) return `email=${json.data.identity.email}`;
  if (Array.isArray(json?.data)) return `count=${json.data.length}`;
  return JSON.stringify(json).slice(0, 160);
}

function requestIdOf(json) {
  return json?.meta?.requestId ?? null;
}

function gitCommit() {
  try {
    return execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
  } catch {
    return process.env.GIT_COMMIT ?? "unknown";
  }
}

function writeArtifacts({ allOk, email, tenantId, tenantName, commit, runId }) {
  mkdirSync(dirname(evidencePath), { recursive: true });
  const tableRows = steps.map(
    (s) =>
      `| ${s.step} | ${s.status} | ${s.summary.replace(/\|/g, "\\|")} | ${s.requestId} | ${s.ok ? "PASS" : "FAIL"} |`
  );
  writeFileSync(
    evidencePath,
    [
      "# BAS-001 Evidence",
      "",
      `**Date (UTC):** ${new Date().toISOString()}`,
      `**Run ID:** ${runId}`,
      `**Base URL:** ${baseUrl}`,
      `**Commit:** ${commit}`,
      `**Owner email:** ${email}`,
      `**Tenant:** ${tenantName} (\`${tenantId}\`)`,
      `**Isolation:** unique identity + tenant + fresh business data (no reuse)`,
      `**Constraints:** Public APIs only · no Service Role · no SQL · no Dashboard`,
      `**Overall:** ${allOk ? "PASS" : "FAIL"}`,
      "",
      "| Step | HTTP | Summary | requestId | Result |",
      "|------|------|---------|-----------|--------|",
      ...tableRows,
      "",
    ].join("\n"),
    "utf8"
  );
  console.log(`Wrote ${evidencePath}`);
}

async function main() {
  // Unique per execution — previous runs must never affect the result.
  const runId = `${Date.now()}-${randomBytes(4).toString("hex")}`;
  const email = `bas001.owner.${runId}@gmail.com`;
  const password = `Bas001-${randomBytes(6).toString("hex")}!`;
  const tenantName = `BAS-001 Salon ${runId}`;
  const commit = gitCommit();
  const serviceName = `Haircut ${runId}`;
  const patchedServiceName = `Cut Deluxe ${runId}`;
  const employeeName = `Lina ${runId}`;
  const patchedEmployeeTitle = `Senior Stylist ${runId}`;
  const customerName = `Sara ${runId}`;
  const patchedCustomerNotes = `VIP walk-in ${runId}`;

  let token = null;
  let tenantId = null;
  let serviceId = null;
  let employeeId = null;
  let customerId = null;

  console.log(`BAS-001 runId=${runId}`);
  console.log(`email=${email}`);
  console.log(`tenantName=${tenantName}`);

  {
    const res = await api("/api/v1/auth/signup", {
      method: "POST",
      body: { email, password },
    });
    const ok = res.status === 201 && Boolean(res.json?.data?.accessToken);
    record("1 Signup", res.status, summarize(res.json), ok, requestIdOf(res.json));
    assertOk(ok, `signup failed: ${res.status} ${JSON.stringify(res.json)}`);
    token = res.json.data.accessToken;
  }

  {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const ok = res.status === 200 && Boolean(res.json?.data?.accessToken);
    record("2 Login", res.status, summarize(res.json), ok, requestIdOf(res.json));
    assertOk(ok, `login failed: ${res.status} ${JSON.stringify(res.json)}`);
    token = res.json.data.accessToken;
  }

  {
    const res = await api("/api/v1/tenants", {
      method: "POST",
      token,
      body: { name: tenantName },
    });
    const ok = res.status === 201 && Boolean(res.json?.data?.tenant?.id);
    record("3 Create Tenant", res.status, summarize(res.json), ok, requestIdOf(res.json));
    assertOk(ok, `create tenant failed: ${res.status} ${JSON.stringify(res.json)}`);
    tenantId = res.json.data.tenant.id;
  }

  {
    const res = await api(`/api/v1/tenants/${tenantId}/modules`, { token, tenantId });
    const salonEnabled = (res.json?.data ?? []).some(
      (row) => row.moduleKey === "salon" && row.enabled
    );
    const ok = res.status === 200 && salonEnabled;
    record(
      "4 Salon auto activation",
      res.status,
      salonEnabled ? "salon enabled" : summarize(res.json),
      ok,
      requestIdOf(res.json)
    );
    assertOk(ok, "salon module not auto-enabled");
  }

  // Service: Create → GET → PATCH → GET
  {
    const create = await api("/api/v1/salon/services", {
      method: "POST",
      token,
      tenantId,
      body: { name: serviceName, durationMin: 30, priceCents: 5000, currency: "SAR" },
    });
    serviceId = create.json?.data?.id;
    record(
      "5a Create Service",
      create.status,
      summarize(create.json),
      create.status === 201 && Boolean(serviceId),
      requestIdOf(create.json)
    );
    assertOk(create.status === 201 && serviceId, "create service failed");

    const get1 = await api(`/api/v1/salon/services/${serviceId}`, { token, tenantId });
    record(
      "5b GET Service",
      get1.status,
      summarize(get1.json),
      get1.status === 200 && get1.json?.data?.id === serviceId,
      requestIdOf(get1.json)
    );
    assertOk(get1.status === 200, "get service failed");

    const patch = await api(`/api/v1/salon/services/${serviceId}`, {
      method: "PATCH",
      token,
      tenantId,
      body: { name: patchedServiceName, priceCents: 7500 },
    });
    record(
      "5c Update Service",
      patch.status,
      summarize(patch.json),
      patch.status === 200 && patch.json?.data?.name === patchedServiceName,
      requestIdOf(patch.json)
    );
    assertOk(patch.status === 200, "update service failed");

    const get2 = await api(`/api/v1/salon/services/${serviceId}`, { token, tenantId });
    record(
      "5d GET Service after update",
      get2.status,
      summarize(get2.json),
      get2.status === 200 && get2.json?.data?.name === patchedServiceName,
      requestIdOf(get2.json)
    );
    assertOk(get2.status === 200 && get2.json?.data?.name === patchedServiceName, "get after update service failed");
  }

  // Employee: Create → GET → Update → GET
  {
    const create = await api("/api/v1/salon/employees", {
      method: "POST",
      token,
      tenantId,
      body: { name: employeeName, title: "Stylist", phone: "+966500000001" },
    });
    employeeId = create.json?.data?.id;
    record(
      "6a Create Employee",
      create.status,
      summarize(create.json),
      create.status === 201 && Boolean(employeeId),
      requestIdOf(create.json)
    );
    assertOk(create.status === 201 && employeeId, "create employee failed");

    const get1 = await api(`/api/v1/salon/employees/${employeeId}`, { token, tenantId });
    record(
      "6b GET Employee",
      get1.status,
      summarize(get1.json),
      get1.status === 200 && get1.json?.data?.id === employeeId,
      requestIdOf(get1.json)
    );
    assertOk(get1.status === 200, "get employee failed");

    const patch = await api(`/api/v1/salon/employees/${employeeId}`, {
      method: "PATCH",
      token,
      tenantId,
      body: { title: patchedEmployeeTitle },
    });
    record(
      "6c Update Employee",
      patch.status,
      summarize(patch.json),
      patch.status === 200 && patch.json?.data?.title === patchedEmployeeTitle,
      requestIdOf(patch.json)
    );
    assertOk(patch.status === 200, "update employee failed");

    const get2 = await api(`/api/v1/salon/employees/${employeeId}`, { token, tenantId });
    record(
      "6d GET Employee after update",
      get2.status,
      summarize(get2.json),
      get2.status === 200 && get2.json?.data?.title === patchedEmployeeTitle,
      requestIdOf(get2.json)
    );
    assertOk(get2.status === 200 && get2.json?.data?.title === patchedEmployeeTitle, "get after update employee failed");
  }

  // Customer: Create → GET → Update → GET
  {
    const create = await api("/api/v1/salon/customers", {
      method: "POST",
      token,
      tenantId,
      body: { name: customerName, phone: "+966500000002", notes: `first visit ${runId}` },
    });
    customerId = create.json?.data?.id;
    record(
      "7a Create Customer",
      create.status,
      summarize(create.json),
      create.status === 201 && Boolean(customerId),
      requestIdOf(create.json)
    );
    assertOk(create.status === 201 && customerId, "create customer failed");

    const get1 = await api(`/api/v1/salon/customers/${customerId}`, { token, tenantId });
    record(
      "7b GET Customer",
      get1.status,
      summarize(get1.json),
      get1.status === 200 && get1.json?.data?.id === customerId,
      requestIdOf(get1.json)
    );
    assertOk(get1.status === 200, "get customer failed");

    const patch = await api(`/api/v1/salon/customers/${customerId}`, {
      method: "PATCH",
      token,
      tenantId,
      body: { notes: patchedCustomerNotes },
    });
    record(
      "7c Update Customer",
      patch.status,
      summarize(patch.json),
      patch.status === 200 && patch.json?.data?.notes === patchedCustomerNotes,
      requestIdOf(patch.json)
    );
    assertOk(patch.status === 200, "update customer failed");

    const get2 = await api(`/api/v1/salon/customers/${customerId}`, { token, tenantId });
    record(
      "7d GET Customer after update",
      get2.status,
      summarize(get2.json),
      get2.status === 200 && get2.json?.data?.notes === patchedCustomerNotes,
      requestIdOf(get2.json)
    );
    assertOk(get2.status === 200 && get2.json?.data?.notes === patchedCustomerNotes, "get after update customer failed");
  }

  {
    token = null;
    record("8 Logout", 200, "client discarded access/refresh tokens", true, "n/a");
  }

  {
    const res = await api("/api/v1/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const ok = res.status === 200 && Boolean(res.json?.data?.accessToken);
    record("9 Login again", res.status, summarize(res.json), ok, requestIdOf(res.json));
    assertOk(ok, `re-login failed: ${res.status} ${JSON.stringify(res.json)}`);
    token = res.json.data.accessToken;
  }

  {
    const services = await api("/api/v1/salon/services", { token, tenantId });
    const employees = await api("/api/v1/salon/employees", { token, tenantId });
    const customers = await api("/api/v1/salon/customers", { token, tenantId });

    const serviceOk =
      services.status === 200 &&
      (services.json?.data ?? []).some(
        (s) => s.id === serviceId && s.name === patchedServiceName && s.priceCents === 7500
      );
    const employeeOk =
      employees.status === 200 &&
      (employees.json?.data ?? []).some(
        (e) => e.id === employeeId && e.title === patchedEmployeeTitle
      );
    const customerOk =
      customers.status === 200 &&
      (customers.json?.data ?? []).some(
        (c) => c.id === customerId && c.notes === patchedCustomerNotes
      );

    const ok = serviceOk && employeeOk && customerOk;
    const rid =
      requestIdOf(services.json) ||
      requestIdOf(employees.json) ||
      requestIdOf(customers.json);
    record(
      "10 Verify persistence",
      ok ? 200 : 409,
      ok ? "service/employee/customer persist after re-login" : `svc=${serviceOk} emp=${employeeOk} cust=${customerOk}`,
      ok,
      rid
    );
    assertOk(ok, "persistence verification failed");
  }

  const allOk = steps.every((s) => s.ok);
  writeArtifacts({ allOk, email, tenantId, tenantName, commit, runId });
  console.log(allOk ? "\nBAS-001 PASSED." : "\nBAS-001 FAILED.");
  process.exit(allOk ? 0 : 1);
}

main().catch((error) => {
  console.error("BAS-001 failed:", error.message);
  try {
    writeArtifacts({
      allOk: false,
      email: "n/a",
      tenantId: "n/a",
      tenantName: "n/a",
      commit: gitCommit(),
      runId: "failed-before-runId",
    });
  } catch {
    /* ignore */
  }
  process.exit(1);
});
