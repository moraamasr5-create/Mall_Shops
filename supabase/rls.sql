-- Vertical Slice 1 — Authorization Layer 1 (Database Isolation)
-- Tenant isolation only. Do NOT encode business permissions here.

ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_employee ENABLE ROW LEVEL SECURITY;

-- tenant
CREATE POLICY tenant_isolation_tenant
  ON tenant FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

-- membership
CREATE POLICY tenant_isolation_membership
  ON membership FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

-- tenant_module
CREATE POLICY tenant_isolation_tenant_module
  ON tenant_module FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant_module.tenant_id
        AND membership.identity_id = auth.uid()::text
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

-- salon_employee (reference module)
CREATE POLICY tenant_isolation_salon_employee
  ON salon_employee FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_employee.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_employee.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
