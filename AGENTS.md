# AGENTS.md

## Cursor Cloud specific instructions

### Repository state: documentation-only (Phase 0)

This repository currently contains **no application code**. It is a "Phase 0"
architecture/planning repository consisting entirely of Markdown documents
(`README.md`, `ARCHITECTURE.md`, and files under `docs/`).

As a result, there is:

- **No dependency manifest** (no `package.json`, `requirements.txt`,
  `pyproject.toml`, `go.mod`, etc.) and **nothing to install**.
- **No build, lint, or test tooling** wired up, and no build/lint/test commands
  to run.
- **No runnable application or services** — the described platform (a Supabase +
  Prisma + TypeScript modular "Business Operating Platform") has not been
  implemented yet. Do not attempt to "start a dev server" or "run the app";
  there is nothing to run.

The documents describe the *intended* future stack (Supabase Auth/DB/RLS, Prisma
ORM, modular TypeScript backend). Those are design intentions, not installed
dependencies. When code is eventually added, update this section (and add an
update script via the environment setup) to reflect the real toolchain.

Until then, "development" means editing Markdown docs. The only meaningful
verification is that Markdown files are well-formed and internal links are valid.
