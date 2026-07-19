# AGENTS.md

## Cursor Cloud / agent instructions

### Repository state: **Internal Pilot (Learning)** — OP-006

OP-005 (Salon MVP Operational Loop) is **CLOSED**.  
Do **not** add Features, Architecture, or proactive polish.

**Allowed now:** 🔴 bugs that block completing the Visit loop (**write root cause, not only the symptom**); ⚙️ operational/environment fixes.  
**Forbidden:** Domain/Visit Aggregate changes; Business Features; Appointments / Queue / Billing / Notifications / Printing; opening RG-005.  
**🔵 asks:** record only; ~3 independent similar asks → VS1.1 candidate — never build from a single request.

**RG-005:** remains Locked until a real first client is named and officially authorized.

**VS1.1** will be shaped by Internal Pilot observation questions + request frequency in [docs/PILOT_READINESS.md](./docs/PILOT_READINESS.md) § B — not by engineer preference.

**Feature Freeze (also when RG-005 later opens):** implement **only**
🔴 Pilot Blocker fixes, 🟡 UX that blocks/confuses real use, or ⚙️ operational fixes.
**Do not** add Business Features, Domain/Schema/Architecture changes, new Modules, or
Platform Shared Services. Full rule: [docs/RELEASE_GATES.md](./docs/RELEASE_GATES.md) § RG-005.

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
| Cross-tenant evidence | Formal **release Operational Gate** (`npm run evidence:cross-tenant`). |
| Environment validation | `npm run check:env` — RG-003 **PR-01** |
| First deployment | `docs/RUNBOOK_FIRST_DEPLOYMENT.md` — empty Supabase → migrations → first Tenant → evidence (Local Docker **or** Hosted) |
| Operational pass snapshot | `docs/evidence/2026-07-15-operational-pass.md` · git tag `vs1-operational-pass` |
| Decision Log | `docs/DECISION_LOG.md` (OP-001, OP-002, …) — lifecycle + why work is deferred |
| Release Gates | `docs/RELEASE_GATES.md` (RG-001 … RG-006) — objective VS1 Complete / ship criteria |
| Pilot readiness | `docs/PILOT_READINESS.md` — Audit **CLOSED** (OP-004); Evidence `docs/evidence/pilot-readiness-audit-2026-07-19.md` |
| Operating Constitution | `docs/ENGINEERING_OPERATING_CONSTITUTION.md` — **ADOPTED / normative** (Decision Hierarchy, Owner Experience, Core Mission, amendment process) |

### Standard operating pattern (after Constitution adoption)

Do **not** rely on re-explaining project philosophy in every chat. On each task:

1. **Read** [ENGINEERING_OPERATING_CONSTITUTION.md](./docs/ENGINEERING_OPERATING_CONSTITUTION.md) (normative mind).
2. **Determine current phase** from [RELEASE_GATES.md](./docs/RELEASE_GATES.md) + [DECISION_LOG.md](./docs/DECISION_LOG.md) (temporary allow/deny).
3. **Execute only** the assigned task (Gate / Decision / explicit assignment).
4. **Brief governance report before implementing** if the task may affect governance, Architecture, Core Mission, Contracts, or Freeze rules — then wait for confirmation when required.

### Architecture rules for agents

- Start from [docs/ENGINEERING_OPERATING_CONSTITUTION.md](./docs/ENGINEERING_OPERATING_CONSTITUTION.md) — **normative**. Temporary bans/phases live in Release Gates / Decision Log / Pilot Readiness, not in the Constitution.
- Then [docs/PLATFORM_PRINCIPLES.md](./docs/PLATFORM_PRINCIPLES.md) — platform axioms.
- Architecture is **LOCKED** — do not redesign without the Decision Hierarchy path.
- Documentation wins over code when they conflict (Hierarchy → Lock → Contracts → Implementation).
- New Markdown only for **Decision**, **Evidence**, or **Policy** — do not grow docs for their own sake.
- Two authorization layers are mandatory: Layer 1 RLS + Layer 2 application RBAC.
- User-facing Prisma access must go through `withIdentityRls` / `getDb()` — never bypass RLS for normal requests.
- Tenant bootstrap (`createTenant`) is the only privileged DB path for user onboarding.
- Salon is the **Reference Implementation**, not a redefinition of the platform as a salon-only product; Restaurant is validation-only — do not expand it until authorized by Gates/Decisions.
- Never create duplicate docs (`v2`, `final`, etc.) — update the canonical file.
- Respect `docs/DECISION_LOG.md` lifecycle and `docs/RELEASE_GATES.md` for current execution rights.
- Prefer closing an existing gate over opening new scope (anti–scope creep).

### Execution Rule

Cursor never advances the roadmap autonomously.

The next implementation task must always originate from one of:

- A Release Gate becoming unblocked.
- An approved Decision changing state (see `docs/DECISION_LOG.md`).
- An explicitly assigned implementation task.

Cursor may propose improvements, but may not reorder milestones or begin blocked work.

Act as an **Executor**: implement only what a Gate, Decision Log state change, or explicit assignment authorizes — not what a chat casually suggests.

**During an active Pilot freeze (see Release Gates):** a Feature Request from a client is **not** authorization to build it —
record it for Pilot Review / Backlog after Freeze Exit Criteria.
