
# 🔌 دليل التكامل مع Supabase - BarberySmart POS

## إعدادات Supabase المتقدمة

### 1. إنشاء مشروع Supabase

```bash
# زيارة الموقع
https://app.supabase.com

# الخطوات:
1. اضغط "New Project"
2. أدخل اسم المشروع: "barberysmart"
3. اختر المنطقة الأقرب لك
4. اختر كلمة مرور قوية
5. اضغط "Create new project"
```

### 2. استخراج بيانات الاتصال

بعد إنشاء المشروع:

```javascript
// ستجد هذه البيانات في Project Settings > API
const SUPABASE_URL = 'https://xxxxxxxxxxxx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## 📝 SQL Setup - خطوات الإعداد

### الطريقة 1️⃣: استخدام SQL Editor

```
1. افتح Supabase Dashboard
2. اذهب إلى "SQL Editor"
3. اضغط "New Query"
4. انسخ محتويات supabase-setup.sql
5. اضغط "Run"
6. تحقق من الجداول الجديدة في "Table Editor"
```

### الطريقة 2️⃣: استخدام CLI

```bash
# تثبيت CLI
npm install -g supabase

# تسجيل الدخول
supabase login

# ربط المشروع
supabase projects list
supabase db push --linked

# استيراد SQL من ملف
cat supabase-setup.sql | supabase db execute
```

---

## 🔐 تفعيل Row Level Security (RLS)

```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- سياسة لقراءة البيانات علناً (قراءة)
CREATE POLICY "Read services" ON services
FOR SELECT USING (true);

-- سياسة لإدراج المعاملات
CREATE POLICY "Insert transactions" ON transactions
FOR INSERT WITH CHECK (true);

-- سياسة لقراءة المعاملات
CREATE POLICY "Read transactions" ON transactions
FOR SELECT USING (true);

-- سياسة لإدراج تفاصيل المعاملات
CREATE POLICY "Insert transaction items" ON transaction_items
FOR INSERT WITH CHECK (true);
```

---

## 🌐 CORS تفعيل

```
Dashboard Settings > API > CORS
الإضافة:
- http://localhost:3000
- http://localhost
- https://yourdomain.com
```

---

## 🧪 اختبار الاتصال

```javascript
// أضف هذا الكود في console المتصفح

const SUPABASE_URL = 'YOUR_URL';
const SUPABASE_ANON_KEY = 'YOUR_KEY';

// اختبار الاتصال
fetch(`${SUPABASE_URL}/rest/v1/services?select=*`, {
    headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
    }
})
.then(res => res.json())
.then(data => console.log('✓ Connection OK', data))
.catch(err => console.error('✗ Connection Failed', err));
```

---

## 📡 أمثلة API Calls

### 1️⃣ جلب قائمة الخدمات

```javascript
async function getServices() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/services?select=*`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.json();
}
```

### 2️⃣ جلب الحلاقين

```javascript
async function getBarbers() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barbers?select=*`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.json();
}
```

### 3️⃣ إنشاء معاملة جديدة

```javascript
async function createTransaction(data) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                local_id: data.local_id,
                barber_id: data.barber_id,
                total_amount: data.total_amount,
                discount: data.discount,
                is_synced: true,
                synced_at: new Date().toISOString()
            })
        }
    );
    return response.json();
}
```

### 4️⃣ إضافة تفاصيل المعاملة

```javascript
async function addTransactionItem(data) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transaction_items`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                transaction_id: data.transaction_id,
                service_id: data.service_id,
                service_name: data.service_name,
                price: data.price,
                quantity: data.quantity || 1
            })
        }
    );
    return response.json();
}
```

### 5️⃣ جلب التقارير اليومية

```javascript
async function getDailyRevenue(date) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/daily_revenue?date=eq.${date}&select=*`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.json();
}
```

### 6️⃣ جلب أداء الحلاقين

```javascript
async function getBarberPerformance() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/barber_performance?select=*`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.json();
}
```

### 7️⃣ تحديث معاملة

```javascript
async function updateTransaction(id, data) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`,
        {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify({
                ...data,
                updated_at: new Date().toISOString()
            })
        }
    );
    return response.json();
}
```

### 8️⃣ حذف معاملة

```javascript
async function deleteTransaction(id) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/transactions?id=eq.${id}`,
        {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return response.status === 204;
}
```

---

## 🔄 نمط المزامنة الكاملة

```javascript
// ============= FULL SYNC IMPLEMENTATION =============

class SupabaseSync {
    constructor(url, key) {
        this.url = url;
        this.key = key;
        this.retryCount = 0;
        this.maxRetries = 5;
        this.baseDelay = 1000; // 1 second
    }

    // حساب التأخير المتزايد
    getExponentialBackoff() {
        return this.baseDelay * Math.pow(2, this.retryCount);
    }

    // محاولة بحد أقصى من المحاولات
    async syncWithRetry(transaction) {
        for (let i = 0; i < this.maxRetries; i++) {
            try {
                this.retryCount = i;
                const result = await this.syncTransaction(transaction);
                this.retryCount = 0; // إعادة تعيين عند النجاح
                return result;
            } catch (error) {
                console.warn(`Sync attempt ${i + 1} failed:`, error);
                
                if (i < this.maxRetries - 1) {
                    const delay = this.getExponentialBackoff();
                    console.log(`Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        throw new Error('Max retries exceeded');
    }

    // المزامنة الفعلية
    async syncTransaction(transaction) {
        // 1. إنشاء المعاملة الرئيسية
        const transactionResponse = await fetch(
            `${this.url}/rest/v1/transactions`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.key}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=representation'
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

        if (!transactionResponse.ok) {
            throw new Error(`HTTP ${transactionResponse.status}`);
        }

        const createdTransaction = await transactionResponse.json();
        const transactionId = createdTransaction[0]?.id;

        // 2. إضافة تفاصيل المعاملة
        for (const item of transaction.items) {
            const itemResponse = await fetch(
                `${this.url}/rest/v1/transaction_items`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.key}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        service_id: item.service_id,
                        service_name: item.service_name,
                        price: item.price
                    })
                }
            );

            if (!itemResponse.ok) {
                throw new Error(`Failed to sync item`);
            }
        }

        return true;
    }
}

// الاستخدام
const syncer = new SupabaseSync(SUPABASE_URL, SUPABASE_ANON_KEY);
await syncer.syncWithRetry(transaction);
```

---

## 📊 مثال كامل للمزامنة في index.html

ضع هذا الكود في نهاية الـ `<script>` قبل `initialize()`:

```javascript
// ============= SUPABASE INTEGRATION =============

// استبدل هذه بقيمك الفعلية من Supabase
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

async function fetchFromSupabase(endpoint, options = {}) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1${endpoint}`,
        {
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        }
    );

    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

// تحميل الخدمات من Supabase (اختياري)
async function loadServicesFromSupabase() {
    try {
        const services = await fetchFromSupabase('/services?select=*');
        localStorage.setItem('services', JSON.stringify(services));
        state.services = services;
        return services;
    } catch (error) {
        console.error('Failed to load services:', error);
        // الاحتفاظ بالبيانات المحلية في حالة الفشل
    }
}

// تحميل الحلاقين من Supabase (اختياري)
async function loadBarbersFromSupabase() {
    try {
        const barbers = await fetchFromSupabase('/barbers?select=*');
        localStorage.setItem('barbers', JSON.stringify(barbers));
        state.barbers = barbers;
        return barbers;
    } catch (error) {
        console.error('Failed to load barbers:', error);
    }
}

// دالة المزامنة المحسّنة
async function syncTransaction(transaction) {
    if (!isConnected()) {
        return false;
    }

    try {
        // 1. إنشاء المعاملة
        const transactionPayload = {
            local_id: transaction.local_id,
            barber_id: transaction.barber_id,
            total_amount: transaction.total_amount,
            discount: transaction.discount,
            is_synced: true,
            synced_at: new Date().toISOString()
        };

        const transResponse = await fetchFromSupabase(
            '/transactions',
            {
                method: 'POST',
                body: JSON.stringify(transactionPayload),
                headers: {
                    'Prefer': 'return=representation'
                }
            }
        );

        const transactionId = transResponse[0]?.id || transaction.id;

        // 2. إضافة البنود
        for (const item of transaction.items) {
            await fetchFromSupabase(
                '/transaction_items',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        transaction_id: transactionId,
                        service_id: item.service_id,
                        price: item.price
                    }),
                    headers: {
                        'Prefer': 'return=minimal'
                    }
                }
            );
        }

        console.log('✓ Transaction synced:', transactionId);
        return true;
    } catch (error) {
        console.error('✗ Sync failed:', error);
        return false;
    }
}

// تحديث دالة performSync
const originalPerformSync = performSync;
performSync = async function() {
    if (!state.syncQueue.length) {
        updateSyncStatus('لا توجد عمليات للمزامنة');
        return;
    }

    if (!isConnected()) {
        updateSyncStatus('غير متصل بالإنترنت - سيتم المحاولة لاحقاً');
        return;
    }

    try {
        updateSyncStatus('جاري المزامنة...');
        
        const successfulSyncs = [];
        
        for (const transaction of state.syncQueue) {
            const success = await syncTransaction(transaction);
            if (success) {
                successfulSyncs.push(transaction.local_id);
                transaction.is_synced = true;
            }
        }

        // إزالة المعاملات الناجحة من الطابور
        state.syncQueue = state.syncQueue.filter(
            t => !successfulSyncs.includes(t.local_id)
        );

        saveToLocalStorage();
        updatePendingCount();
        updateSyncStatus(`تمت مزامنة ${successfulSyncs.length} عملية ✓`);
        showNotification(
            `تمت مزامنة ${successfulSyncs.length} معاملة بنجاح`,
            'success'
        );
    } catch (error) {
        console.error('Sync error:', error);
        updateSyncStatus('فشلت المزامنة - سيتم إعادة المحاولة');
        showNotification('فشلت المزامنة، سيتم إعادة المحاولة تلقائياً', 'error');
    }
};
```

---

## 🛠️ استكشاف الأخطاء

### خطأ: "Not Found (404)"
```
السبب: اسم الجدول أو الـ endpoint خاطئ
الحل: تحقق من أسماء الجداول في Dashboard
```

### خطأ: "Unauthorized (401)"
```
السبب: مفتاح API غير صحيح
الحل: استخرج المفتاح من Project Settings > API
```

### خطأ: "CORS Error"
```
السبب: النطاق غير مسموح
الحل: أضف النطاق في Settings > API > CORS
```

---

## 📚 مراجع إضافية

- [Supabase Docs](https://supabase.com/docs)
- [PostgREST API](https://postgrest.org)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [API Authorization](https://supabase.com/docs/guides/api/oauth)

---

**آخر تحديث:** 2024 | **النسخة:** 1.0.0
