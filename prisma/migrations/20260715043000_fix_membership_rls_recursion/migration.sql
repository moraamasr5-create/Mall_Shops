-- Operational Hotfix: break infinite recursion on membership RLS policies.
-- Cause: policies on membership subquery membership → re-enter same policies.
-- Fix: SECURITY DEFINER helpers evaluate the same predicates without RLS re-entry.
-- Security semantics unchanged: still require active membership for auth.uid().

CREATE OR REPLACE FUNCTION app_identity_is_active_member(p_tenant_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM membership AS m
    WHERE m.tenant_id = p_tenant_id
      AND m.identity_id = auth.uid()::text
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION app_tenant_has_active_member(p_tenant_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM membership AS m
    WHERE m.tenant_id = p_tenant_id
      AND m.status = 'active'
  );
$$;

REVOKE ALL ON FUNCTION app_identity_is_active_member(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION app_tenant_has_active_member(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_identity_is_active_member(text) TO authenticated;
GRANT EXECUTE ON FUNCTION app_tenant_has_active_member(text) TO authenticated;

DROP POLICY IF EXISTS membership_insert_bootstrap ON membership;
DROP POLICY IF EXISTS membership_select_isolation ON membership;
DROP POLICY IF EXISTS membership_update_isolation ON membership;
DROP POLICY IF EXISTS membership_delete_isolation ON membership;

CREATE POLICY membership_insert_bootstrap
  ON membership FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      identity_id = auth.uid()::text
      AND NOT app_tenant_has_active_member(tenant_id)
    )
    OR app_identity_is_active_member(tenant_id)
  );

CREATE POLICY membership_select_isolation
  ON membership FOR SELECT
  TO authenticated
  USING (app_identity_is_active_member(tenant_id));

CREATE POLICY membership_update_isolation
  ON membership FOR UPDATE
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));

CREATE POLICY membership_delete_isolation
  ON membership FOR DELETE
  TO authenticated
  USING (app_identity_is_active_member(tenant_id));
