-- Phase A / A3: Restaurant Order Success Loop (Thesis §4 minimum).
-- No Shift, Reservation, KitchenTicket, Payment Aggregate, or delivery dispatch product.

CREATE TABLE "restaurant_order" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'created',
    "fulfillment_mode" TEXT NOT NULL,
    "guest_name" TEXT,
    "payment_accepted" BOOLEAN NOT NULL DEFAULT false,
    "payment_method" TEXT,
    "payment_accepted_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "restaurant_order_line" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "restaurant_order_line_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "restaurant_order_tenant_id_idx" ON "restaurant_order"("tenant_id");
CREATE INDEX "restaurant_order_tenant_id_status_idx" ON "restaurant_order"("tenant_id", "status");
CREATE INDEX "restaurant_order_tenant_id_opened_at_idx" ON "restaurant_order"("tenant_id", "opened_at");
CREATE INDEX "restaurant_order_line_tenant_id_idx" ON "restaurant_order_line"("tenant_id");
CREATE INDEX "restaurant_order_line_order_id_idx" ON "restaurant_order_line"("order_id");

ALTER TABLE "restaurant_order_line" ADD CONSTRAINT "restaurant_order_line_order_id_fkey"
  FOREIGN KEY ("order_id") REFERENCES "restaurant_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE restaurant_order, restaurant_order_line TO authenticated;

ALTER TABLE restaurant_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order FORCE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order_line ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_order_line FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_restaurant_order
  ON restaurant_order FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));

CREATE POLICY tenant_isolation_restaurant_order_line
  ON restaurant_order_line FOR ALL
  TO authenticated
  USING (app_identity_is_active_member(tenant_id))
  WITH CHECK (app_identity_is_active_member(tenant_id));
