import React from 'react';
import { useEventData } from '../../hooks/useEventData';

/**
 * Example component demonstrating the use of eventReducer
 * via the useEventData hook.
 */
const DashboardExample = ({ shiftId = 'shift_123' }) => {
  const { invoices, customers, shiftState } = useEventData(shiftId);

  return (
    <div className="p-6 bg-[#1a1a1a] rounded-lg shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-4 text-[#e0a96d]">لوحة معلومات الوردية (مثال Event Reducer)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#333]">
          <h3 className="text-gray-400 mb-1">حالة الوردية</h3>
          <p className="text-lg font-semibold">
            {shiftState.opened ? (shiftState.closed ? 'مغلقة' : 'مفتوحة') : 'لم تفتح بعد'}
          </p>
        </div>
        <div className="p-4 bg-[#2a2a2a] rounded-lg border border-[#333]">
          <h3 className="text-gray-400 mb-1">عدد العملاء المسجلين</h3>
          <p className="text-lg font-semibold">{customers.length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 border-b border-[#333] pb-2 text-gray-200">
          الفواتير الحالية ({invoices.length})
        </h3>
        {invoices.length === 0 ? (
          <p className="text-gray-500 text-sm">لا توجد فواتير لهذه الوردية.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map(inv => (
              <li key={inv.id} className="bg-[#2a2a2a] p-3 rounded flex justify-between items-center text-sm">
                <div>
                  <span className="font-bold block text-gray-200">{inv.customer_name}</span>
                  <span className="text-gray-500 text-xs">{inv.created_at}</span>
                </div>
                <div className="font-bold text-green-400">{inv.total} ج.م</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DashboardExample;
