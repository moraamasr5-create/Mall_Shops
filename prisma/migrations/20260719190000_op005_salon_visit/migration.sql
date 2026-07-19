-- OP-005: Salon MVP Operational Loop — SalonVisit + SalonVisitService
-- Module-owned only. No Core changes. Visit ≠ VisitService orphans via FK.

CREATE TABLE "salon_visit" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "customer_id" TEXT NOT NULL,
    "employee_id" TEXT,
    "notes" TEXT,
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salon_visit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "salon_visit_service" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "salon_visit_service_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "salon_visit_tenant_id_idx" ON "salon_visit"("tenant_id");
CREATE INDEX "salon_visit_tenant_id_status_idx" ON "salon_visit"("tenant_id", "status");
CREATE INDEX "salon_visit_tenant_id_opened_at_idx" ON "salon_visit"("tenant_id", "opened_at");
CREATE INDEX "salon_visit_service_tenant_id_idx" ON "salon_visit_service"("tenant_id");
CREATE INDEX "salon_visit_service_visit_id_idx" ON "salon_visit_service"("visit_id");

ALTER TABLE "salon_visit_service" ADD CONSTRAINT "salon_visit_service_visit_id_fkey"
  FOREIGN KEY ("visit_id") REFERENCES "salon_visit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE salon_visit, salon_visit_service TO authenticated;

ALTER TABLE salon_visit ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_visit FORCE ROW LEVEL SECURITY;
ALTER TABLE salon_visit_service ENABLE ROW LEVEL SECURITY;
ALTER TABLE salon_visit_service FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_salon_visit
  ON salon_visit FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));

CREATE POLICY tenant_isolation_salon_visit_service
  ON salon_visit_service FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));
