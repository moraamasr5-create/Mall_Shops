# AGENTS.md

## Cursor Cloud / agent instructions

### Repository state: VS1 Runnable (implementation in progress)

This repository contains Architecture Lock documentation **and** a runnable
Next.js + Prisma + Supabase implementation for Vertical Slice 1 (Salon reference module).

### Toolchain

| Concern | Command / location |
|---------|-------------------|
| Install | `npm install` |
| Env | copy `.env.example` → `.env` |
| Local Supabase | `npx supabase start` (see `supabase/config.toml`) |
| Migrations + RLS | `npx prisma migrate deploy` (RLS lives inside Prisma migrations) |
| Dev server | `npm run dev` |
| Architecture gate | `npm run check:architecture` |
| Verify | On branches that include reviewed Core Security Improvements vs `origin/main`, use `ARCH_ALLOW_CORE_CHANGES=true npm run verify`. Otherwise `npm run verify`. Gate **fails closed** if Git/base ref is missing unless `ARCH_SKIP_CORE_FREEZE=true` (explicit exemption only). |
| Smoke (Salon path) | `npm run smoke:vs1` (app + Supabase must be running) |
| Cross-tenant evidence | Formal **release Operational Gate** (`npm run evidence:cross-tenant`). Blocks DB Hardening / Production Readiness / VS1 Complete / RC1 / Tag / new Modules until **PASS**. |
| Decision Log | `docs/DECISION_LOG.md` (OP-001, OP-002, …) — lifecycle + why work is deferred |
| Release Gates | `docs/RELEASE_GATES.md` (RG-001 … RG-006) — objective VS1 Complete / ship criteria |

### Architecture rules for agents

- Start from [docs/PLATFORM_PRINCIPLES.md](./docs/PLATFORM_PRINCIPLES.md) — platform constitution.
- Architecture is **LOCKED** — do not redesign.
- Documentation wins over code when they conflict (Lock → Contracts → Security → Implementation).
- New Markdown only for **Decision**, **Evidence**, or **Policy** — do not grow docs for their own sake.
- Two authorization layers are mandatory: Layer 1 RLS + Layer 2 application RBAC.
- User-facing Prisma access must go through `withIdentityRls` / `getDb()` — never bypass RLS for normal requests.
- Tenant bootstrap (`createTenant`) is the only privileged DB path for user onboarding.
- Salon is the **Reference Implementation**, not a redefinition of the platform as a salon-only product; Restaurant is validation-only — do not expand it.
- Never create duplicate docs (`v2`, `final`, etc.) — update the canonical file.
- Respect `docs/DECISION_LOG.md` lifecycle (`PROPOSED → … → CLOSED`). **OP-001** must reach **CLOSED** before new Modules / large Features / architectural redesign. **OP-002** stays **DEFERRED** until then.
- Respect `docs/RELEASE_GATES.md`: new code should close an existing Gate/OP, not invent scope. **VS1 Complete** is undefined until RGs pass.
- Prefer closing an existing gate over opening new scope (anti–scope creep).

### Execution Rule

Cursor never advances the roadmap autonomously.

The next implementation task must always originate from one of:

- A Release Gate becoming unblocked.
- An approved Decision changing state (see `docs/DECISION_LOG.md`).
- An explicitly assigned implementation task.

Cursor may propose improvements, but may not reorder milestones or begin blocked work.

From this phase forward, act as an **Executor**: implement only what a Gate, Decision Log state change, or explicit assignment authorizes — not what a chat casually suggests.
