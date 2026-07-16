/**
 * RC1 Environment Validation (pre-flight) — NOT a Release Gate / Decision / Feature.
 *
 * Verifies Staging is not blocking BAS-001. Does NOT freeze a forever signup
 * response shape — that follows the current Product Policy (OP-003 Staging).
 *
 * Usage:
 *   node scripts/rc1-env-preflight.mjs
 *
 * Optional:
 *   RC1_EMAIL_POLICY=staging_op003   (default) — expect session on signup
 *   RC1_EMAIL_POLICY=pending_verification — expect signup without session (future)
 */

const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";
const emailPolicy = process.env.RC1_EMAIL_POLICY ?? "staging_op003";

const checks = [];

function record(name, ok, detail) {
  checks.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}: ${detail}`);
}

async function main() {
  console.log("RC1 Environment Validation (pre-flight)");
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Email policy: ${emailPolicy}`);
  console.log("Environment Blockers only — never Product Release Blockers.\n");

  // Health
  {
    const res = await fetch(`${baseUrl}/api/health`);
    const ok = res.status === 200;
    record("Health", ok, ok ? "HTTP 200" : `HTTP ${res.status}`);
  }

  // Signup probe (one attempt — unique email; does not reuse prior identities)
  const stamp = `${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
  const email = `rc1.preflight.${stamp}@gmail.com`;
  const password = `Rc1Preflight-${stamp.slice(-8)}!`;
  const res = await fetch(`${baseUrl}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json().catch(() => ({}));
  const msg = json?.error?.message ?? "";
  const hasToken = Boolean(json?.data?.accessToken);
  const rateLimited = /rate limit/i.test(msg);
  const confirmBlocked =
    /confirm email/i.test(msg) || /no session was returned/i.test(msg);

  // Rate limit — environment
  record(
    "Rate limit",
    !rateLimited,
    rateLimited
      ? "ENVIRONMENT: email rate limit blocking BAS-001 — fix Staging Auth quota/wait"
      : "Not blocking BAS-001"
  );

  // Email policy matches OP-003 Staging (or future pending_verification)
  let policyOk = false;
  let policyDetail = "";
  if (emailPolicy === "staging_op003") {
    policyOk = res.status === 201 && hasToken;
    policyDetail = policyOk
      ? "Matches OP-003 Staging (session on signup)"
      : confirmBlocked
        ? "ENVIRONMENT: Confirm email ON — does not match OP-003 Staging"
        : `ENVIRONMENT: expected session under OP-003 Staging — HTTP ${res.status} ${msg || "(no token)"}`;
  } else if (emailPolicy === "pending_verification") {
    policyOk =
      (res.status === 201 && !hasToken) ||
      (res.status === 400 && confirmBlocked && !rateLimited);
    policyDetail = policyOk
      ? "Matches pending_verification policy (no session until confirm)"
      : `ENVIRONMENT: unexpected under pending_verification — HTTP ${res.status} ${msg}`;
  } else {
    policyOk = false;
    policyDetail = `Unknown RC1_EMAIL_POLICY=${emailPolicy}`;
  }
  record("Email policy", policyOk, policyDetail);

  // Auth configuration = same as policy match for this pre-flight
  record(
    "Auth configuration",
    policyOk && !rateLimited,
    policyOk && !rateLimited
      ? "Matches current Product Policy for this environment"
      : "Does not match current Product Policy / environment blocked"
  );

  // Signup path operational = not blocked by environment (rate limit / misconfig vs policy)
  const signupOperational = !rateLimited && policyOk;
  record(
    "Signup path",
    signupOperational,
    signupOperational
      ? "Operational (not blocked by environment)"
      : "Blocked by environment — do not run BAS-001"
  );

  const allOk = checks.every((c) => c.ok);
  console.log("");
  if (allOk) {
    console.log("RC1 Environment Validation: PASS");
    console.log("Business Acceptance (BAS-001) may resume.");
    process.exit(0);
  }

  console.log("RC1 Environment Validation: FAIL");
  console.log("Environment Blockers suspend Business Acceptance execution.");
  console.log("Fix Staging Environment Only — then re-run this pre-flight.");
  process.exit(1);
}

main().catch((error) => {
  console.error("RC1 Environment Validation error:", error.message);
  process.exit(1);
});
