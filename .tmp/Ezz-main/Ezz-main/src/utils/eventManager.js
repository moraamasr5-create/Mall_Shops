import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/db';

/**
 * دالة لإنشاء حدث جديد وحفظه محلياً في Dexie
 * هذه الدالة لا تتصل بالإنترنت أبداً، هي سريعة ولحظية
 * 
 * @param {string} eventType - نوع الحدث (مثلاً: 'SERVICE_ADDED', 'SHIFT_CLOSE')
 * @param {object} payload - تفاصيل الحدث (البيانات)
 * @param {string} branchId - معرّف الفرع
 * @param {string} shiftId - معرّف الوردية الحالية
 * @returns {object} الحدث الذي تم إنشاؤه لكي يتم تحديث الواجهة مباشرة
 */
export async function createEvent(eventType, payload, branchId, shiftId) {
  // 1. بناء الكائن (الحدث) بكامل الحقول المطلوبة
  const newEvent = {
    id: uuidv4(), // توليد UUID فريد محلياً
    branch_id: branchId,
    shift_id: shiftId,
    event_type: eventType,
    payload: payload,
    created_at: new Date().toISOString(), // وقت حدوثه الفعلي
    sync_status: 'pending', // يبدأ دائماً كمعلّق
    synced_at: null // لم يُزامن بعد
  };

  // 2. حفظ الحدث في قاعدة البيانات المحلية (Dexie)
  await db.events.add(newEvent);

  // 3. إرجاع الحدث للواجهة لتحديث الـ State فورا بدون انتظار أي شبكة
  return newEvent;
}
