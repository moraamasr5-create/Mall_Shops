/**
 * Ops prep (NOT part of BAS-001): enable mailer_autoconfirm on Hosted Staging
 * so Public signup returns a session without email confirmation.
 *
 * Requires: SUPABASE_ACCESS_TOKEN (https://supabase.com/dashboard/account/tokens)
 * Usage:
 *   set SUPABASE_ACCESS_TOKEN=...
 *   node scripts/ops-staging-mailer-autoconfirm.mjs
 *
 * Default project ref: ovjbgxhhfjmgatdwqagb (Mall_Full). Override with PROJECT_REF.
 */

const projectRef = process.env.PROJECT_REF ?? "ovjbgxhhfjmgatdwqagb";
const token = process.env.SUPABASE_ACCESS_TOKEN;

if (!token) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN. Create one at https://supabase.com/dashboard/account/tokens"
  );
  console.error(
    "Or disable Confirm email manually: Dashboard → Authentication → Providers → Email → Confirm email OFF"
  );
  process.exit(1);
}

const url = `https://api.supabase.com/v1/projects/${projectRef}/config/auth`;

const getRes = await fetch(url, {
  headers: { authorization: `Bearer ${token}`, accept: "application/json" },
});
const before = await getRes.json().catch(() => ({}));
if (!getRes.ok) {
  console.error("GET auth config failed:", getRes.status, before);
  process.exit(1);
}

console.log("Before mailer_autoconfirm =", before.mailer_autoconfirm);

const patchRes = await fetch(url, {
  method: "PATCH",
  headers: {
    authorization: `Bearer ${token}`,
    "content-type": "application/json",
    accept: "application/json",
  },
  body: JSON.stringify({ mailer_autoconfirm: true }),
});
const after = await patchRes.json().catch(() => ({}));
if (!patchRes.ok) {
  console.error("PATCH auth config failed:", patchRes.status, after);
  process.exit(1);
}

console.log("After mailer_autoconfirm =", after.mailer_autoconfirm);
console.log("Staging Auth prep complete. Re-run: node scripts/bas-001.mjs");
