-- Phase A / A2: Restaurant MenuItem + RestaurantEmployee assignment (Module-owned).
-- Translate MENU + RESTAURANT_EMPLOYEE Contracts. No Core redesign. No Order yet.

CREATE TABLE "restaurant_menu_item" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'SAR',
    "available" BOOLEAN NOT NULL DEFAULT true,
    "retired" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_menu_item_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "restaurant_employee_assignment" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "membership_id" TEXT NOT NULL,
    "restaurant_role" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_employee_assignment_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "restaurant_menu_item_tenant_id_idx" ON "restaurant_menu_item"("tenant_id");
CREATE INDEX "restaurant_menu_item_tenant_id_category_id_idx" ON "restaurant_menu_item"("tenant_id", "category_id");
CREATE INDEX "restaurant_employee_assignment_tenant_id_idx" ON "restaurant_employee_assignment"("tenant_id");
CREATE INDEX "restaurant_employee_assignment_membership_id_idx" ON "restaurant_employee_assignment"("membership_id");

CREATE UNIQUE INDEX "restaurant_employee_assignment_tenant_id_membership_id_restaurant_role_key"
  ON "restaurant_employee_assignment"("tenant_id", "membership_id", "restaurant_role");

ALTER TABLE "restaurant_menu_item" ADD CONSTRAINT "restaurant_menu_item_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "restaurant_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE restaurant_menu_item, restaurant_employee_assignment TO authenticated;

ALTER TABLE restaurant_menu_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_menu_item FORCE ROW LEVEL SECURITY;
ALTER TABLE restaurant_employee_assignment ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_employee_assignment FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_restaurant_menu_item
  ON restaurant_menu_item FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));

CREATE POLICY tenant_isolation_restaurant_employee_assignment
  ON restaurant_employee_assignment FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));
