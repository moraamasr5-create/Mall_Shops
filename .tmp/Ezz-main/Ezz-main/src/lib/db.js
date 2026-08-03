import Dexie from 'dexie';

// إنشاء قاعدة البيانات المحلية باسم الصالون
export const db = new Dexie('SalonDatabase');

// تعريف جداول قاعدة البيانات
// قمنا بزيادة رقم الإصدار إلى 2 لإضافة جدول services كبيانات مرجعية (Read-only)
db.version(2).stores({
  events: 'id, sync_status, created_at, branch_id, shift_id',
  services: 'id, name, price' // جدول الخدمات المرجعي
});

/**
 * دالة لزرع البيانات الأساسية (Seed Data) في جدول الخدمات محلياً.
 * تعمل مرة واحدة فقط عند عدم وجود بيانات في الجدول لمنع التكرار.
 */
export async function seedServices() {
  try {
    const count = await db.services.count();
    if (count === 0) {
      await db.services.bulkAdd([
        { id: 'haircut', name: 'قص شعر', price: 100 },
        { id: 'beard', name: 'ذقن', price: 50 },
        { id: 'blowdry', name: 'استشوار', price: 80 },
        { id: 'facial', name: 'تنظيف بشرة', price: 150 },
        { id: 'coloring', name: 'صبغة', price: 250 }
      ]);
      console.log('تم إضافة بيانات الخدمات الأساسية للـ Local DB بنجاح.');
    }
  } catch (error) {
    console.error('حدث خطأ أثناء الـ Seed:', error);
  }
}
