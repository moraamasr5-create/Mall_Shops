-- 1. جدول الأحداث (events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY, -- بدون DEFAULT، لأن التطبيق هو من سيقوم بتوليد الـ UUID محلياً
    branch_id TEXT NOT NULL,
    shift_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_in_db_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إضافة Index لتسريع الاستعلامات
CREATE INDEX IF NOT EXISTS idx_events_branch_shift ON public.events(branch_id, shift_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);

-- ==========================================
-- إعدادات الأمان (Row Level Security - RLS)
-- ==========================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- السماح بإدخال بيانات جديدة فقط للمستخدمين المسجلين (الكاشير)
CREATE POLICY "Allow inserts for authenticated users" 
ON public.events 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- سياسة مبسطة مؤقتاً: السماح لأي مستخدم مسجل بقراءة الأحداث
-- يجب تشديد هذه السياسة لاحقاً عند إضافة نظام صلاحيات الفروع (Custom Claims)
CREATE POLICY "Allow select for authenticated users" 
ON public.events 
FOR SELECT 
TO authenticated 
USING (true);

-- لا يوجد سياسات للـ UPDATE أو DELETE (نظام Event Sourcing فقط يضيف بيانات)
