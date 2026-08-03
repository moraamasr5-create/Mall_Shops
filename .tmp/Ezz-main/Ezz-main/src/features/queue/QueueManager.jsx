import React, { useState } from 'react';
import { createEvent } from '../../utils/eventManager';
import { EventTypes } from '../../utils/eventTypes';
import { syncPendingEvents } from '../../lib/syncWorker';

const BARBERS = [
  { id: 'b1', name: 'أحمد' },
  { id: 'b2', name: 'محمود' },
  { id: 'b3', name: 'خالد' }
];

export default function QueueManager({ branchId, shiftId, disabled }) {
  const [customerName, setCustomerName] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(BARBERS[0].id);

  const handleAddToQueue = async () => {
    if (!customerName.trim()) return;

    await createEvent(
      EventTypes.CUSTOMER_QUEUED,
      {
        customer_name: customerName,
        barber_id: selectedBarber,
        barber_name: BARBERS.find(b => b.id === selectedBarber)?.name || 'غير محدد',
        status: 'WAITING'
      },
      branchId,
      shiftId
    );

    setCustomerName('');
    syncPendingEvents();
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#B08D57] mt-6">
      <h3 className="text-xl text-[#D4AF37] mb-4 border-b border-[#D4AF37]/30 pb-2">إدارة الطابور (الانتظار)</h3>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="اسم الزبون للانتظار"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#121212] border border-[#B08D57] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37]"
        />
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          disabled={disabled}
          className="w-full bg-[#121212] border border-[#B08D57] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37]"
        >
          {BARBERS.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
        <button
          onClick={handleAddToQueue}
          disabled={disabled || !customerName.trim()}
          className="w-full bg-[#D4AF37] hover:bg-[#B08D57] disabled:bg-gray-600 disabled:text-gray-400 text-[#121212] py-3 rounded-lg font-bold transition-colors"
        >
          إضافة للانتظار ⏳
        </button>
      </div>
    </div>
  );
}
