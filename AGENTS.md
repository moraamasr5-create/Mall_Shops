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
| Verify | `ARCH_ALLOW_CORE_CHANGES=true npm run verify` only when a reviewed Core Security Improvement is in the working tree; otherwise `npm run verify` |
| Smoke (Salon path) | `npm run smoke:vs1` (app + Supabase must be running) |

### Architecture rules for agents

- Architecture is **LOCKED** — do not redesign.
- Documentation (Lock → Contracts → Security → Implementation docs) wins over code.
- Two authorization layers are mandatory: Layer 1 RLS + Layer 2 application RBAC.
- User-facing Prisma access must go through `withIdentityRls` / `getDb()` — never bypass RLS for normal requests.
- Tenant bootstrap (`createTenant`) is the only privileged DB path for user onboarding.
- Salon is the MVP reference module; Restaurant is validation-only — do not expand it.
- Never create duplicate docs (`v2`, `final`, etc.) — update the canonical file.
