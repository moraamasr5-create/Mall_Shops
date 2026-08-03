import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { createEvent } from '../../utils/eventManager';
import { EventTypes } from '../../utils/eventTypes';
import { syncPendingEvents } from '../../lib/syncWorker';

const BARBERS = [
  { id: 'b1', name: 'أحمد' },
  { id: 'b2', name: 'محمود' },
  { id: 'b3', name: 'خالد' }
];

export default function BarberDashboard({ branchId = 'branch-main-01', shiftId = 'shift-20240616-01' }) {
  const [selectedBarber, setSelectedBarber] = useState(BARBERS[0].id);

  // Fetch all queue events for the current shift
  const queueEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(shiftId)
      .filter(e => e.event_type === EventTypes.CUSTOMER_QUEUED || e.event_type === EventTypes.QUEUE_COMPLETED)
      .toArray(),
    [shiftId]
  ) || [];

  // Process events to build current active queue state
  const activeQueue = [];
  const completedIds = new Set();

  queueEvents.forEach(e => {
    if (e.event_type === EventTypes.QUEUE_COMPLETED) {
      completedIds.add(e.payload.queue_event_id);
    }
  });

  queueEvents.forEach(e => {
    if (e.event_type === EventTypes.CUSTOMER_QUEUED && !completedIds.has(e.id)) {
      activeQueue.push({
        id: e.id,
        ...e.payload,
        created_at: e.created_at
      });
    }
  });

  // Filter by selected barber and sort by time (FIFO)
  const myQueue = activeQueue
    .filter(q => q.barber_id === selectedBarber)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleComplete = async (queueEventId) => {
    await createEvent(
      EventTypes.QUEUE_COMPLETED,
      { queue_event_id: queueEventId, barber_id: selectedBarber },
      branchId,
      shiftId
    );
    syncPendingEvents();
  };

  return (
    <div className="p-6 min-h-screen bg-[#121212] text-white font-sans" dir="rtl">
      <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#D4AF37]/50 pb-4 mb-6">
        <div>
          <h1 className="text-3xl text-[#D4AF37] font-bold">لوحة المصففين</h1>
          <p className="text-gray-400 mt-1">إدارة الطابور الشخصي</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          {BARBERS.map(b => (
            <button
              key={b.id}
              onClick={() => setSelectedBarber(b.id)}
              className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                selectedBarber === b.id 
                  ? 'bg-[#D4AF37] text-[#121212]' 
                  : 'bg-[#1a1a1a] border border-[#B08D57] text-[#D4AF37] hover:bg-[#B08D57]/20'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myQueue.length === 0 ? (
          <div className="col-span-full text-center py-20 text-gray-500 text-xl border border-dashed border-gray-700 rounded-xl bg-[#1a1a1a]/50">
            لا يوجد زبائن في الانتظار حالياً. وقت الراحة ☕
          </div>
        ) : (
          myQueue.map((customer, index) => (
            <div key={customer.id} className="bg-[#1a1a1a] border-l-4 border-[#D4AF37] rounded-lg p-6 shadow-lg hover:shadow-[#D4AF37]/10 transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full text-sm font-bold mb-2 inline-block">
                    الدور: {index + 1}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-2">{customer.customer_name}</h3>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(customer.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => handleComplete(customer.id)}
                  className="flex-1 bg-green-600/20 text-green-400 border border-green-600/50 hover:bg-green-600 hover:text-white py-3 rounded-lg font-bold transition-all"
                >
                  إنهاء الخدمة ✓
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
