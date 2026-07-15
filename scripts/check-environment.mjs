/**
 * PR-01 Environment Validation — fast ops check (no secrets printed).
 *
 * Usage: npm run check:env
 * Writes: docs/evidence/environment-validation-latest.md
 *
 * Exit: 0 = PASS, 1 = FAIL
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const reportPath = path.join(root, "docs", "evidence", "environment-validation-latest.md");
const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const REQUIRED_ENV = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "DATABASE_URL",
  "DIRECT_URL",
];

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

/** @type {{ id: string, title: string, result: 'PASS' | 'FAIL' | 'SKIP', detail: string }[]} */
const rows = [];

function record(id, title, result, detail) {
  rows.push({ id, title, result, detail });
  const mark = result === "PASS" ? "✓" : result === "SKIP" ? "·" : "✗";
  console.log(`${mark} ${id}: ${detail}`);
}

async function checkEnvKeys() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]?.trim());
  if (missing.length) {
    record("env_keys", "Required env keys", "FAIL", `missing: ${missing.join(", ")}`);
    return;
  }
  const db = process.env.DATABASE_URL ?? "";
  const direct = process.env.DIRECT_URL ?? "";
  if (db === direct) {
    record(
      "env_keys",
      "Required env keys",
      "FAIL",
      "DATABASE_URL and DIRECT_URL are identical — OP-002 expects a role split on Staging"
    );
    return;
  }
  record("env_keys", "Required env keys", "PASS", "all required keys present; DATABASE_URL ≠ DIRECT_URL");
}

async function checkDb(label, url) {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: ["error"],
  });
  try {
    const result = await client.$queryRawUnsafe("SELECT 1::int AS ok");
    const ok = Array.isArray(result) && result[0]?.ok === 1;
    if (!ok) {
      record(label, `Database (${label})`, "FAIL", "unexpected query result");
      return;
    }
    record(label, `Database (${label})`, "PASS", "trivial query succeeded");
  } catch (error) {
    record(
      label,
      `Database (${label})`,
      "FAIL",
      error instanceof Error ? error.message.split("\n")[0] : String(error)
    );
  } finally {
    await client.$disconnect();
  }
}

async function checkAuth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    record("auth", "Supabase Auth", "FAIL", "URL or anon key missing");
    return;
  }
  try {
    const supabase = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await supabase.auth.getSession();
    if (error) {
      record("auth", "Supabase Auth", "FAIL", error.message);
      return;
    }
    record("auth", "Supabase Auth", "PASS", "Auth API reachable via anon client");
  } catch (error) {
    record(
      "auth",
      "Supabase Auth",
      "FAIL",
      error instanceof Error ? error.message : String(error)
    );
  }
}

async function checkStorage() {
  record("storage", "Supabase Storage", "SKIP", "N/A for VS1 MVP (Storage not used)");
}

async function checkHealth() {
  try {
    const res = await fetch(`${baseUrl}/api/health`);
    const json = await res.json().catch(() => ({}));
    if (res.ok && json?.ok === true) {
      record("health", "Health endpoint", "PASS", `GET ${baseUrl}/api/health → ${res.status}`);
      return;
    }
    record(
      "health",
      "Health endpoint",
      "FAIL",
      `GET ${baseUrl}/api/health → ${res.status} ${JSON.stringify(json)}`
    );
  } catch (error) {
    record(
      "health",
      "Health endpoint",
      "FAIL",
      `app not reachable at ${baseUrl} (${error instanceof Error ? error.message : String(error)}) — start npm run dev`
    );
  }
}

function checkVersions() {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const prismaClient = JSON.parse(
    fs.readFileSync(path.join(root, "node_modules/@prisma/client/package.json"), "utf8")
  );
  const detail = `app=${pkg.version}; @prisma/client=${prismaClient.version}; node=${process.version}`;
  record("versions", "Tooling versions", "PASS", detail);
}

function writeReport(overall) {
  const lines = [
    "# Environment Validation — Latest Run (PR-01)",
    "",
    `**Overall:** ${overall}`,
    `**Ran at:** ${new Date().toISOString()}`,
    `**Base URL (health):** ${baseUrl}`,
    "",
    "| Check | Result | Detail |",
    "|-------|--------|--------|",
  ];
  for (const row of rows) {
    lines.push(
      `| \`${row.id}\` — ${row.title} | **${row.result}** | ${row.detail.replace(/\|/g, "/")} |`
    );
  }
  lines.push(
    "",
    "## Notes",
    "",
    "- Part of [PRODUCTION_READINESS.md](../PRODUCTION_READINESS.md) **PR-01**.",
    "- Does not print secrets.",
    "- Storage is SKIP for VS1 MVP.",
    ""
  );
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join("\n"), "utf8");
  console.log(`Report written: ${reportPath}`);
}

async function main() {
  loadEnvFile();
  console.log("PR-01 Environment Validation");
  await checkEnvKeys();
  await checkDb("database_url", process.env.DATABASE_URL);
  await checkDb("direct_url", process.env.DIRECT_URL);
  await checkAuth();
  await checkStorage();
  await checkHealth();
  checkVersions();

  const failed = rows.some((r) => r.result === "FAIL");
  const overall = failed ? "FAIL" : "PASS";
  writeReport(overall);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
