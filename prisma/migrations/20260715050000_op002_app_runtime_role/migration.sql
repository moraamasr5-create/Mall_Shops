-- OP-002: DB Role Hardening — app_runtime LOGIN role (no BYPASSRLS).
-- Privileged postgres (DIRECT_URL) remains for migrations + createTenant only.
-- Password is set out-of-band (ALTER ROLE) so secrets are not committed.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_runtime') THEN
    CREATE ROLE app_runtime WITH
      LOGIN
      NOSUPERUSER
      NOCREATEDB
      NOCREATEROLE
      NOINHERIT
      NOBYPASSRLS
      NOREPLICATION;
  END IF;
END
$$;

-- Allow SET LOCAL ROLE authenticated from the app connection.
GRANT authenticated TO app_runtime;

GRANT CONNECT ON DATABASE postgres TO app_runtime;
GRANT USAGE ON SCHEMA public TO app_runtime;

-- Defense in depth: app_runtime may touch tables only after SET ROLE authenticated
-- in normal request path; direct DML as app_runtime is not the intended model.
-- No BYPASSRLS. No table-owner privileges.
