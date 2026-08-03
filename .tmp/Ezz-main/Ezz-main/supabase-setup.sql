-- ============================================
-- BarberySmart POS - Supabase Database Schema
-- ============================================
-- نسخ هذا الكود في Supabase SQL Editor وقم بتشغيله

-- ============================================
-- 1. جدول الحلاقين (Barbers Table)
-- ============================================
CREATE TABLE barbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    commission_rate NUMERIC NOT NULL DEFAULT 0.15 CHECK (commission_rate >= 0 AND commission_rate <= 1),
    phone TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. جدول الخدمات (Services Table)
-- ============================================
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT,
    price NUMERIC NOT NULL CHECK (price > 0),
    category TEXT NOT NULL CHECK (category IN ('شعر', 'ذقن', 'بشرة', 'معالجات')),
    care_instruction TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. جدول المعاملات والمبيعات (Transactions Table)
-- ============================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    local_id TEXT UNIQUE NOT NULL,
    barber_id UUID REFERENCES barbers(id) ON DELETE SET NULL,
    total_amount NUMERIC NOT NULL CHECK (total_amount >= 0),
    discount NUMERIC DEFAULT 0 CHECK (discount >= 0),
    final_amount NUMERIC GENERATED ALWAYS AS (total_amount - discount) STORED,
    payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'card', 'transfer')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_synced BOOLEAN DEFAULT true,
    synced_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. جدول تفاصيل المعاملات (Transaction Items Table)
-- ============================================
CREATE TABLE transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE RESTRICT,
    service_name TEXT NOT NULL,
    price NUMERIC NOT NULL CHECK (price > 0),
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. جدول السجلات (Audit Logs Table)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 6. جدول إحصائيات الحلاقين (Barber Stats Table)
-- ============================================
CREATE TABLE barber_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    barber_id UUID UNIQUE REFERENCES barbers(id) ON DELETE CASCADE,
    total_revenue NUMERIC DEFAULT 0,
    total_commissions NUMERIC DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    average_service_price NUMERIC DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES - لتحسين الأداء
-- ============================================
CREATE INDEX idx_transactions_barber ON transactions(barber_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_is_synced ON transactions(is_synced);
CREATE INDEX idx_transaction_items_transaction ON transaction_items(transaction_id);
CREATE INDEX idx_transaction_items_service ON transaction_items(service_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_audit_logs_transaction ON audit_logs(transaction_id);

-- ============================================
-- SAMPLE DATA - بيانات تجريبية
-- ============================================

-- Insert Sample Barbers
INSERT INTO barbers (name, commission_rate, phone, email) VALUES
('أحمد محمد', 0.15, '0501234567', 'ahmed@example.com'),
('محمود علي', 0.15, '0502345678', 'mahmoud@example.com'),
('فاروق سالم', 0.20, '0503456789', 'farouk@example.com'),
('سامي الزهراني', 0.18, '0504567890', 'sami@example.com');

-- Insert Sample Services
INSERT INTO services (name_ar, name_en, price, category, care_instruction, description) VALUES
('قص شعر كلاسيكي', 'Classic Haircut', 50, 'شعر', 'استخدم شامبو عالي الجودة مرتين أسبوعياً للحفاظ على الشكل المثالي', 'قص شعر تقليدي احترافي'),
('قص شعر عصري', 'Modern Haircut', 60, 'شعر', 'زر صالوننا كل 3-4 أسابيع للحفاظ على الشكل المتناسق', 'قص شعر بأحدث التقنيات'),
('صبغة شعر', 'Hair Coloring', 150, 'شعر', 'يرجى استخدام شامبو خالٍ من الكبريتات للحفاظ على لون الصبغة برونقها', 'صبغة شعر احترافية'),
('صبغة الشيب', 'Gray Coverage', 120, 'شعر', 'تجنب استخدام منتجات تحتوي على كحول لتجنب تلف الشعر', 'تغطية متقنة للشيب'),
('حلاقة ذقن احترافية', 'Professional Shave', 40, 'ذقن', 'طبق كريم مرطب يومياً للحفاظ على صحة الذقن', 'حلاقة ذقن بأدوات احترافية'),
('تنظيف لحية', 'Beard Trim', 30, 'ذقن', 'استخدم زيت اللحية الطبيعي للعناية اليومية', 'تنظيف وتشكيل اللحية'),
('تصفيف لحية', 'Beard Styling', 45, 'ذقن', 'استخدم منتجات تصفيف عالية الجودة', 'تصفيف احترافي اللحية'),
('تنظيف بشرة عميق', 'Deep Facial Cleaning', 80, 'بشرة', 'قلل التعرض للشمس واستخدم واقي شمسي يومياً', 'تنظيف عميق للبشرة'),
('تقشير بشرة', 'Facial Peeling', 60, 'بشرة', 'ترطب البشرة بعد العملية لمدة أسبوع على الأقل', 'تقشير لطيف وفعال'),
('معالجة ترطيب', 'Hydration Treatment', 70, 'معالجات', 'كرر العملية شهرياً للحصول على نتائج أفضل', 'ترطيب عميق للبشرة'),
('معالجة ضد الشيخوخة', 'Anti-Aging Treatment', 120, 'معالجات', 'ادمج عملية العناية مع برنامج منتظم للعناية المنزلية', 'معالجة متقدمة ضد الشيخوخة'),
('معالجة حب الشباب', 'Acne Treatment', 90, 'معالجات', 'تجنب لمس الوجه وحافظ على نظافة البشرة', 'معالجة متخصصة لحب الشباب'),
('فرد الشعر الكيراتيني', 'Keratin Straightening', 200, 'شعر', 'تجنب غسل الشعر لمدة 72 ساعة بعد العلاج', 'فرد دائم بتقنية الكيراتين'),
('تسليك الشعر', 'Hair Smoothing', 100, 'شعر', 'استخدم مستحضرات الحماية من الحرارة', 'تسليك احترافي للشعر');

-- ============================================
-- VIEWS - طرق عرض مفيدة للتقارير
-- ============================================

-- View: Daily Revenue
CREATE VIEW daily_revenue AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_transactions,
    SUM(total_amount) as gross_revenue,
    SUM(discount) as total_discounts,
    SUM(final_amount) as net_revenue,
    COUNT(DISTINCT barber_id) as barbers_count
FROM transactions
WHERE is_synced = true
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View: Barber Performance
CREATE VIEW barber_performance AS
SELECT 
    b.id,
    b.name,
    COUNT(t.id) as total_transactions,
    SUM(t.final_amount) as total_revenue,
    SUM(t.final_amount) * b.commission_rate as commission_earned,
    AVG(t.final_amount) as avg_transaction,
    DATE(NOW()) - DATE(MAX(t.created_at)) as days_since_last_sale
FROM barbers b
LEFT JOIN transactions t ON b.id = t.barber_id AND t.is_synced = true
GROUP BY b.id, b.name, b.commission_rate
ORDER BY total_revenue DESC;

-- View: Service Popularity
CREATE VIEW service_popularity AS
SELECT 
    s.name_ar,
    s.category,
    COUNT(ti.id) as times_sold,
    SUM(ti.price) as total_revenue,
    AVG(ti.price) as avg_price,
    COUNT(DISTINCT ti.transaction_id) as unique_transactions
FROM services s
LEFT JOIN transaction_items ti ON s.id = ti.service_id
GROUP BY s.id, s.name_ar, s.category
ORDER BY times_sold DESC;

-- ============================================
-- TRIGGERS - الدوال التلقائية
-- ============================================

-- Trigger: Update Barber Stats on Transaction Insert
CREATE OR REPLACE FUNCTION update_barber_stats()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO barber_stats (barber_id, total_revenue, total_transactions)
    VALUES (NEW.barber_id, NEW.final_amount, 1)
    ON CONFLICT (barber_id) DO UPDATE SET
        total_revenue = barber_stats.total_revenue + EXCLUDED.total_revenue,
        total_transactions = barber_stats.total_transactions + 1,
        total_commissions = (barber_stats.total_revenue + EXCLUDED.total_revenue) * 
                           (SELECT commission_rate FROM barbers WHERE id = NEW.barber_id),
        last_updated = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_barber_stats
AFTER INSERT ON transactions
FOR EACH ROW
WHEN (NEW.is_synced = true)
EXECUTE FUNCTION update_barber_stats();

-- Trigger: Log Audit Trail
CREATE OR REPLACE FUNCTION log_transaction_audit()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (transaction_id, action, details)
    VALUES (NEW.id, 'CREATE', jsonb_build_object(
        'barber_id', NEW.barber_id,
        'amount', NEW.final_amount,
        'discount', NEW.discount
    ));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_transaction
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION log_transaction_audit();

-- ============================================
-- ROW LEVEL SECURITY (Optional - for multi-tenant)
-- ============================================
-- ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- COMMENTS - التوثيق
-- ============================================
COMMENT ON TABLE barbers IS 'جدول الحلاقين والموظفين';
COMMENT ON TABLE services IS 'جدول الخدمات المتاحة في الصالون';
COMMENT ON TABLE transactions IS 'جدول معاملات المبيعات والفواتير';
COMMENT ON TABLE transaction_items IS 'تفاصيل الخدمات في كل معاملة';
COMMENT ON COLUMN transactions.local_id IS 'معرف محلي فريد لمنع تكرار المزامنة';
COMMENT ON COLUMN transactions.is_synced IS 'حالة المزامنة - true عند نقل البيانات من الجهاز للسحابة';
