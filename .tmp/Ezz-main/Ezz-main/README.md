# 🏆 BarberySmart POS & Care System
## نظام الكاشير وخدمة العملاء الذكي لصالونات الحلاقة

---

## 📋 محتويات المشروع

```
├── index.html              # التطبيق الرئيسي كاملاً في ملف واحد
├── supabase-setup.sql      # كود إعداد قاعدة البيانات
└── README.md              # هذا الملف
```

---

## 🎯 المميزات الرئيسية

### 1️⃣ العمل الكامل أوفلاين (100% Offline-First)
- ✅ تحفظ جميع العمليات محلياً في `localStorage` فوراً
- ✅ لا حاجة لاتصال إنترنت للبدء بالمبيعات
- ✅ مزامنة تلقائية عند عودة الاتصال

### 2️⃣ محرك النصائح الذكي (Smart Care Engine)
- 🧠 يقرأ النظام الخدمات المختارة تلقائياً
- 💡 ينشئ نصائح عناية مخصصة حسب كل خدمة
- 🖨️ تطبع النصائح مباشرة في الفاتورة الحرارية

### 3️⃣ نظام المزامنة الذكي مع Supabase
- 🔄 مراقبة مستمرة لحالة الشبكة
- 📊 قائمة انتظار (Queue) لتتبع العمليات غير المزامنة
- ⚡ Exponential Backoff Policy لضمان نقل آمن للبيانات
- 🔐 منع التكرار عبر `local_id` الفريد

### 4️⃣ معاينة الطابعة الحرارية
- 📄 محاكاة واقعية للفاتورة الورقية (80mm)
- 🎨 تصميم احترافي يناسب الطباعة الفورية
- 🖥️ معاينة تفاعلية قبل الطباعة

### 5️⃣ التصميم الفاخر
- 🌙 ألوان داكنة فخمة (أسود + ذهبي + برونزي)
- 📱 واجهة عربية RTL كاملة
- 👆 واجهة سهلة اللمس للأجهزة اللوحية

---

## 🚀 البدء السريع

### الخطوة 1️⃣: فتح التطبيق
```bash
# افتح الملف مباشرة في المتصفح
open index.html
# أو
# اسحب الملف على المتصفح
```

### الخطوة 2️⃣: إعداد Supabase (اختياري للمزامنة)

#### أ. إنشاء حساب
1. اذهب إلى https://supabase.com
2. سجل حساباً جديداً مجاناً
3. أنشئ مشروع جديد

#### ب. إعداد قاعدة البيانات
1. افتح SQL Editor في لوحة التحكم
2. انسخ جميع محتويات `supabase-setup.sql`
3. الصقها في SQL Editor
4. اضغط "Run"

#### ج. دمج Supabase مع التطبيق (الكود)
أضف هذا الكود في `index.html` بعد سطر 760 (قبل إغلاق `</script>`):

```javascript
// ============= SUPABASE INTEGRATION =============
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

async function syncTransaction(transaction) {
    try {
        // Sync main transaction
        const transResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/transactions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    local_id: transaction.local_id,
                    barber_id: transaction.barber_id,
                    total_amount: transaction.total_amount,
                    discount: transaction.discount,
                    is_synced: true,
                    synced_at: new Date().toISOString()
                })
            }
        );

        if (!transResponse.ok) {
            throw new Error(`API Error: ${transResponse.status}`);
        }

        // Sync transaction items
        for (const item of transaction.items) {
            await fetch(
                `${SUPABASE_URL}/rest/v1/transaction_items`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        transaction_id: transaction.id,
                        service_id: item.service_id,
                        price: item.price
                    })
                }
            );
        }

        transaction.is_synced = true;
        return true;
    } catch (error) {
        console.error('Sync failed:', error);
        return false;
    }
}
```

---

## 📱 استخدام التطبيق

### شاشة المبيعات الرئيسية

1. **اختر الحلاق**: من القائمة المنسدلة "الحلاق المسؤول"
2. **اختر الخدمات**: اضغط على أزرار الخدمات لإضافتها للسلة
3. **راجع السلة**: على اليمين ستجد ملخص الخدمات والسعر
4. **أضف خصماً** (اختياري): في حقل الخصم
5. **اطبع الفاتورة**: اضغط "إكمال البيع وطباعة"

### معاينة الفاتورة
- اضغط "معاينة الفاتورة" لرؤية شكل الورقة قبل الطباعة
- انقر "طباعة الآن" لإرسال الفاتورة للطابعة

### لوحة المزامنة
- **المفتاح الأخضر**: متصل بالإنترنت
- **المفتاح الأحمر**: غير متصل (الوضع الأوفلاين)
- **العدد البرتقالي**: عدد العمليات المعلقة
- **زر المزامنة**: لمزامنة يدوية فورية

---

## 🗄️ هيكل قاعدة البيانات

### جدول الحلاقين (barbers)
```sql
- id (UUID) - معرف فريد
- name (TEXT) - الاسم
- commission_rate (NUMERIC) - نسبة العمولة
```

### جدول الخدمات (services)
```sql
- id (UUID) - معرف فريد
- name_ar (TEXT) - الاسم بالعربية
- price (NUMERIC) - السعر
- category (TEXT) - التصنيف (شعر، ذقن، بشرة، معالجات)
- care_instruction (TEXT) - نصيحة العناية
```

### جدول المعاملات (transactions)
```sql
- id (UUID) - معرف فريد
- local_id (TEXT) - معرف محلي (فريد)
- barber_id (UUID) - معرف الحلاق
- total_amount (NUMERIC) - المبلغ الكلي
- discount (NUMERIC) - الخصم
- is_synced (BOOLEAN) - هل تمت المزامنة
```

### جدول تفاصيل المعاملات (transaction_items)
```sql
- id (UUID) - معرف فريد
- transaction_id (UUID) - معرف المعاملة
- service_id (UUID) - معرف الخدمة
- price (NUMERIC) - السعر وقت البيع
```

---

## 🔧 التقنيات المستخدمة

| التقنية | الغرض |
|---------|-------|
| **HTML5** | هيكل الصفحة |
| **Tailwind CSS** | التصميم عبر CDN |
| **Vanilla JavaScript** | منطق التطبيق |
| **LocalStorage** | التخزين المحلي |
| **Supabase** | قاعدة البيانات السحابية |
| **PostgreSQL** | قاعدة البيانات |

---

## 🛡️ قوانين البرمجة المطبقة

### 1. Offline-First Architecture
```javascript
// البيانات تُحفظ محلياً أولاً
saveToLocalStorage(); // حفظ فوري
// ثم المزامنة عند عودة الاتصال
performSync();
```

### 2. Idempotency (منع التكرار)
```javascript
// كل معاملة لها local_id فريد
{
    local_id: "LOCAL_1718526000000_abc123",
    // ... بقية البيانات
}
```

### 3. Exponential Backoff Policy
```javascript
// محاولات إعادة المزامنة مع تأخير متزايد
await syncTransaction(transaction); // المحاولة الأولى
// إذا فشلت: انتظر 1 ثانية
// إذا فشلت: انتظر 2 ثانية
// إذا فشلت: انتظر 4 ثوان
// وهكذا...
```

### 4. Network Listener
```javascript
// مراقبة الاتصال المستمرة
window.addEventListener('online', () => {
    attemptAutoSync(); // مزامنة تلقائية
});

window.addEventListener('offline', () => {
    updateNetworkStatus(); // تحديث الحالة
});
```

### 5. Custom Modals (بدل alert)
```javascript
// بدل alert() البدائية
showNotification('تم حفظ البيانات', 'success');
// نافذة منبثقة جميلة مع تأثيرات
```

---

## 🎨 الألوان والتصميم

| العنصر | اللون | الكود |
|--------|-------|-------|
| **الخلفية الرئيسية** | أسود فاحم | `#0f0f0f` |
| **لون أساسي** | ذهبي | `#d4af37` |
| **لون ثانوي** | برونزي | `#8b6914` |
| **الحالة - متصل** | أخضر | `#10b981` |
| **الحالة - غير متصل** | أحمر | `#ef4444` |

---

## 📊 التقارير والإحصائيات

التطبيق يحتوي على 3 views مدمجة في Supabase:

### 1. Daily Revenue
```sql
-- إجمالي الإيرادات اليومية
SELECT DATE, revenue, discounts, net_amount FROM daily_revenue;
```

### 2. Barber Performance
```sql
-- أداء كل حلاق
SELECT name, total_sales, commission FROM barber_performance;
```

### 3. Service Popularity
```sql
-- الخدمات الأكثر مبيعاً
SELECT name_ar, times_sold, revenue FROM service_popularity;
```

---

## 🐛 استكشاف الأخطاء

### المشكلة: لا تظهر الخدمات
**الحل**: امسح `localStorage` واعد تحميل الصفحة
```javascript
localStorage.clear();
location.reload();
```

### المشكلة: المزامنة لا تعمل
**الحل**: تحقق من:
1. اتصال الإنترنت ✓
2. مفتاح Supabase الصحيح ✓
3. اسم الجداول صحيح ✓
4. الأذونات مفعلة ✓

### المشكلة: الطباعة لا تظهر بشكل صحيح
**الحل**: تأكد من:
1. حجم الورقة 80mm ✓
2. خط الطباعة أحادي (monospace) ✓
3. إعدادات الطابعة الحرارية صحيحة ✓

---

## 🔐 الأمان والخصوصية

⚠️ **نقاط أمان مهمة:**

1. **لا تحفظ كلمات المرور**: التطبيق لا يحفظ أي بيانات حساسة محلياً
2. **استخدم RLS في Supabase**: فعّل Row Level Security للحماية من الوصول غير المصرح
3. **HTTPS فقط**: استخدم HTTPS عند نقل البيانات للسحابة
4. **Anon Key بحذر**: غيّر مفتاح Supabase إذا تسرب

---

## 📈 خارطة الطريق المستقبلية

- [ ] تطبيق جوال (React Native)
- [ ] تقارير متقدمة وإحصائيات
- [ ] نظام ولاء العملاء (points)
- [ ] حسابات الموظفين والرواتب
- [ ] نظام الحجوزات والمواعيد
- [ ] تكامل SMS للإشعارات
- [ ] دعم العملات المختلفة

---

## 👨‍💼 المساهمة والدعم

للتواصل أو الإبلاغ عن أخطاء:
```
📧 البريد: support@barberysmart.local
💬 الدعم: متاح 24/7
```

---

## 📄 الترخيص

هذا المشروع مرخص تحت MIT License

---

## 🙏 الشكر والتقدير

شكراً لاستخدامك **BarberySmart** - نظام الصالون الذكي!

**جُعل هذا النظام لخدمتك بكل إتقان**

---

### آخر تحديث: 2024
**الإصدار:** 1.0.0 - نسخة الإطلاق الأولى 🚀
