-- VS1 init: schema + Layer 1 RLS (tenant isolation only).
-- Policies evolve with Prisma migrations — do not maintain a parallel standalone RLS SQL file.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership" (
    "id" TEXT NOT NULL,
    "identity_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "invited_by" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_module" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "module_key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "activated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salon_service" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration_min" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salon_employee" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salon_customer" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaurant_category" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "membership_identity_id_idx" ON "membership"("identity_id");

-- CreateIndex
CREATE INDEX "membership_tenant_id_idx" ON "membership"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "membership_identity_id_tenant_id_key" ON "membership"("identity_id", "tenant_id");

-- CreateIndex
CREATE INDEX "tenant_module_tenant_id_idx" ON "tenant_module"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_module_tenant_id_module_key_key" ON "tenant_module"("tenant_id", "module_key");

-- CreateIndex
CREATE INDEX "salon_service_tenant_id_idx" ON "salon_service"("tenant_id");

-- CreateIndex
CREATE INDEX "salon_employee_tenant_id_idx" ON "salon_employee"("tenant_id");

-- CreateIndex
CREATE INDEX "salon_customer_tenant_id_idx" ON "salon_customer"("tenant_id");

-- CreateIndex
CREATE INDEX "restaurant_category_tenant_id_idx" ON "restaurant_category"("tenant_id");

-- AddForeignKey
ALTER TABLE "membership" ADD CONSTRAINT "membership_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_module" ADD CONSTRAINT "tenant_module_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Grants: authenticated role participates in RLS (no BYPASSRLS).
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  tenant,
  membership,
  tenant_module,
  salon_service,
  salon_employee,
  salon_customer,
  restaurant_category
TO authenticated;

-- ---------------------------------------------------------------------------
-- Layer 1: enable + FORCE RLS (table owner still subject to policies;
-- superuser / BYPASSRLS roles remain reserved for migrations only).
-- ---------------------------------------------------------------------------
ALTER TABLE tenant ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant FORCE ROW LEVEL SECURITY;
ALTER TABLE membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership FORCE ROW LEVEL SECURITY;
ALTER TABLE tenant_module ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_module FORCE ROW LEVEL SECURITY;
ALTER TABLE salon_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_service FORCE ROW LEVEL SECURITY;
ALTER TABLE salon_employee ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_employee FORCE ROW LEVEL SECURITY;
ALTER TABLE salon_customer ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_customer FORCE ROW LEVEL SECURITY;
ALTER TABLE restaurant_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_category FORCE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- tenant: bootstrap INSERT for authenticated identities; isolation otherwise
-- ---------------------------------------------------------------------------
CREATE POLICY tenant_insert_bootstrap
  ON tenant FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY tenant_select_isolation
  ON tenant FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

CREATE POLICY tenant_update_isolation
  ON tenant FOR UPDATE
  TO authenticated
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

CREATE POLICY tenant_delete_isolation
  ON tenant FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = tenant.id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- membership: first-member bootstrap OR existing active member invite path
-- (no business roles encoded — Layer 2 owns OWNER/ADMIN rules)
-- ---------------------------------------------------------------------------
CREATE POLICY membership_insert_bootstrap
  ON membership FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      identity_id = auth.uid()::text
      AND NOT EXISTS (
        SELECT 1 FROM membership AS m
        WHERE m.tenant_id = membership.tenant_id
          AND m.status = 'active'
      )
    )
    OR EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

CREATE POLICY membership_select_isolation
  ON membership FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

CREATE POLICY membership_update_isolation
  ON membership FOR UPDATE
  TO authenticated
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

CREATE POLICY membership_delete_isolation
  ON membership FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership AS m
      WHERE m.tenant_id = membership.tenant_id
        AND m.identity_id = auth.uid()::text
        AND m.status = 'active'
    )
  );

-- ---------------------------------------------------------------------------
-- tenant_module + module tables: membership-based tenant isolation only
-- ---------------------------------------------------------------------------
CREATE POLICY tenant_isolation_tenant_module
  ON tenant_module FOR ALL
  TO authenticated
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

CREATE POLICY tenant_isolation_salon_service
  ON salon_service FOR ALL
  TO authenticated
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

CREATE POLICY tenant_isolation_salon_employee
  ON salon_employee FOR ALL
  TO authenticated
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

CREATE POLICY tenant_isolation_salon_customer
  ON salon_customer FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_customer.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = salon_customer.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );

CREATE POLICY tenant_isolation_restaurant_category
  ON restaurant_category FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = restaurant_category.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM membership
      WHERE membership.tenant_id = restaurant_category.tenant_id
        AND membership.identity_id = auth.uid()::text
        AND membership.status = 'active'
    )
  );
