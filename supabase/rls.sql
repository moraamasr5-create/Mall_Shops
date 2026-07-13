-- Vertical Slice 1 — Authorization Layer 1 (Database Isolation)
-- Tenant isolation only. Do NOT encode business permissions here.

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_service ENABLE ROW LEVEL SECURITY;

-- tenant
CREATE POLICY members_read_own_tenants
  ON tenant FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

CREATE POLICY owners_update_tenant
  ON tenant FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.role = 'OWNER'
        AND membership.status = 'active'
    )
  );

-- membership
CREATE POLICY members_read_tenant_memberships
  ON membership FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

CREATE POLICY admins_manage_memberships_insert
  ON membership FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.role IN ('OWNER', 'ADMIN')
        AND m.status = 'active'
    )
  );

-- tenant_module
CREATE POLICY members_read_tenant_modules
  ON tenant_module FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

CREATE POLICY admins_manage_tenant_modules
  ON tenant_module FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.role IN ('OWNER', 'ADMIN')
        AND membership.status = 'active'
    )
  );

-- salon_service (reference module)
CREATE POLICY tenant_isolation_salon_service
  ON salon_service FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_service.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_service.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
