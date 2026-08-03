import { createClient } from '@supabase/supabase-js';

// استبدل هذه القيم ببيانات مشروعك في Supabase لاحقاً
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
