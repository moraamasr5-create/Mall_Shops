import React from 'react';

/**
 * مكون طباعة الفاتورة الحرارية
 * يستخدم tailwind و css المخصص لطباعة محاكية لورق 80mm.
 * جميع العناصر هنا ستكون مخفية في الشاشة وتظهر فقط عند الطباعة بفضل `@media print`.
 */
export default function ReceiptPrinter({ invoice, branchId, shiftId, tips }) {
  if (!invoice) return null;

  return (
    <div className="receipt-container hidden print:block bg-white text-black text-sm mx-auto" dir="rtl">
      {/* رأس الفاتورة */}
      <div className="text-center font-bold text-xl mb-2">صالون عز</div>
      <div className="text-center text-xs mb-4 border-b-2 border-black pb-2 border-dashed">
        <p>فرع: الخارجة</p>
        <p>
          رقم الفاتورة: {invoice.invoice_number || (invoice.id || '').substring(0, 8).toUpperCase()}
        </p>
        <p>التاريخ: {new Date(invoice.created_at).toLocaleDateString('en-GB')} - {new Date(invoice.created_at).toLocaleTimeString('en-US', {hour: '2-digit', minute:'2-digit', hour12: true})}</p>
      </div>

      {/* بيانات العميل إن وجدت */}
      {(invoice.customer_name || invoice.customer_phone) && (
        <div className="mb-3 text-xs border-b-2 border-black pb-2 border-dashed">
          {invoice.customer_name && <p>العميل: <span className="font-bold">{invoice.customer_name}</span></p>}
          {invoice.customer_phone && <p>جوال: {invoice.customer_phone}</p>}
        </div>
      )}

      {/* جدول الخدمات والأصناف */}
      <table className="w-full text-xs mb-4 border-b-2 border-black pb-2 border-dashed">
        <thead>
          <tr className="border-b border-black">
            <th className="text-right py-1">الخدمة</th>
            <th className="text-left py-1">السعر</th>
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, index) => (
            <tr key={index}>
              <td className="text-right py-1 truncate">{item.name}</td>
              <td className="text-left py-1 whitespace-nowrap">{item.price} ج.م</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* الإجمالي */}
      <div className="flex justify-between font-bold text-lg mb-4 border-b-2 border-black pb-2 border-dashed">
        <span>الإجمالي الشامل:</span>
        <span>{invoice.total} ج.م</span>
      </div>

      {/* محرك النصائح الذكي المطبوع */}
      {tips && tips.length > 0 && (
        <div className="mt-2 border border-black p-2 rounded text-center">
          <h4 className="font-bold text-sm mb-1 text-black">💡 نصائح العناية الذكية 💡</h4>
          <ul className="text-xs text-right list-disc list-inside">
            {tips.map((tip, idx) => (
              <li key={idx} className="mb-1 text-black font-semibold">{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-6 text-xs mb-2 font-bold">
        شكراً لزيارتكم صالون عز
      </div>
    </div>
  );
}
