# AGENTS.md

## Cursor Cloud specific instructions

### Repository state: implemented platform (Architecture v1.0 Proven)

This repository is a multi-tenant, multi-module Business Operating Platform
(Next.js + Supabase Auth + Prisma + TypeScript).

Architecture v1.0 is **FINAL LOCKED** and **Proven by Implementation**
(see `docs/architecture/ARCHITECTURE_AUDIT_V1.md`). Work proceeds via Vertical
Slices and feature delivery — not architectural redesign.

### Toolchain

```bash
npm install
npm run verify              # architecture gate + prisma generate + typecheck + tests
npm run check:architecture  # Core/Modules boundary + freeze + layer rules
npm run dev                 # Next.js app (requires .env — see .env.example)
```

Key paths:

| Area | Path |
|------|------|
| Core | `src/core/` |
| Modules | `src/modules/` |
| Infrastructure | `src/infrastructure/` |
| API routes | `src/app/api/` |
| Prisma schema | `prisma/schema.prisma` |
| RLS | `supabase/rls.sql` |
| Architecture Lock | `docs/ARCHITECTURE_LOCK.md` |
| Architecture Audit | `docs/architecture/ARCHITECTURE_AUDIT_V1.md` |

### Hard rules for agents

- Do **not** import Modules from Core.
- Do **not** put module-specific permissions or module names in Core.
- Do **not** import `@prisma/client` or `@supabase/*` outside `src/infrastructure`.
- Do **not** encode business roles/permissions in RLS (tenant isolation only).
- Prefer extending Modules over changing Core. Core changes require Architecture Review
  and `ARCH_ALLOW_CORE_CHANGES=true` for the architecture gate.
