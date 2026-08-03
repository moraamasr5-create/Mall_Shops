import { db } from './db';
import { supabase } from './supabaseClient';

let isSyncing = false;
let syncInterval = null;

/**
 * محرك المزامنة الأساسي (Sync Engine)
 * يسحب الأحداث المعلقة من Local DB ويرسلها لـ Supabase
 */
export async function syncPendingEvents() {
  // 1. فحص الاتصال بالإنترنت أولاً + التأكد أننا لا نقوم بالمزامنة حالياً
  if (!navigator.onLine || isSyncing) return;
  
  isSyncing = true;

  try {
    // 2. سحب الأحداث المعلقة أو الفاشلة من Dexie (بالترتيب من الأقدم للأحدث)
    const pendingEvents = await db.events
      .where('sync_status')
      .anyOf(['pending', 'failed'])
      .sortBy('created_at');

    if (pendingEvents.length === 0) {
      isSyncing = false;
      return; // لا يوجد شيء للمزامنة
    }

    // 3. تجهيز الدفعة (Batch) للإرسال
    // نحذف الأعمدة الخاصة بالـ Offline قبل الإرسال لـ Supabase (لأنها مش موجودة في الجدول السحابي)
    const eventsToSync = pendingEvents.map(evt => {
      const { sync_status, synced_at, ...supabaseEvent } = evt;
      return supabaseEvent;
    });

    // 4. إرسال الأحداث لـ Supabase باستخدام upsert + ignoreDuplicates
    // هذا يحمينا من التكرار إذا انقطع النت لحظة استلام الرد (Idempotency)
    const { error } = await supabase
      .from('events')
      .upsert(eventsToSync, { onConflict: 'id', ignoreDuplicates: true });

    if (error) {
      throw error; // سيتم التقاط الخطأ في الـ catch
    }

    // 5. في حال النجاح، تحديث حالة الأحداث محلياً لـ synced
    const syncedAt = new Date().toISOString();
    const eventIds = pendingEvents.map(e => e.id);
    
    // التحديث دفعة واحدة في Dexie
    await db.events.bulkUpdate(
      eventIds.map(id => ({
        key: id,
        changes: { sync_status: 'synced', synced_at: syncedAt }
      }))
    );

    console.log(`تمت مزامنة ${eventIds.length} حدث بنجاح.`);

  } catch (error) {
    console.error('فشلت المزامنة، ستتم المحاولة لاحقاً:', error);
    
    // تحويل الأحداث إلى failed لتتم إعادة محاولتها في المرة القادمة
    // (لم أقم بتحديثها لـ failed هنا، لأن الاستعلام الأول يسحب pending و failed معاً)
    // هنا يمكن تطبيق Exponential Backoff بتأخير استدعاء الدالة القادمة
  } finally {
    isSyncing = false;
  }
}

/**
 * تهيئة عامل المزامنة ليعمل تلقائياً
 */
export function initSyncWorker() {
  // المزامنة فور استعادة الاتصال بالإنترنت
  window.addEventListener('online', () => {
    console.log('تم استعادة الاتصال.. جاري المزامنة');
    syncPendingEvents();
  });

  // المزامنة الدورية كـ Fallback (كل 30 ثانية)
  if (syncInterval) clearInterval(syncInterval);
  syncInterval = setInterval(() => {
    syncPendingEvents();
  }, 30000);

  // مزامنة مبدئية عند فتح التطبيق
  syncPendingEvents();
}
