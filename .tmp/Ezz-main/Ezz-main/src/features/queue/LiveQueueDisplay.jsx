import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { EventTypes } from '../../utils/eventTypes';

export default function LiveQueueDisplay({ shiftId = 'shift-20240616-01' }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all queue events for the current shift
  const queueEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(shiftId)
      .filter(e => e.event_type === EventTypes.CUSTOMER_QUEUED || e.event_type === EventTypes.QUEUE_COMPLETED)
      .toArray(),
    [shiftId]
  ) || [];

  const activeQueue = [];
  const completedIds = new Set();

  queueEvents.forEach(e => {
    if (e.event_type === EventTypes.QUEUE_COMPLETED) completedIds.add(e.payload.queue_event_id);
  });

  queueEvents.forEach(e => {
    if (e.event_type === EventTypes.CUSTOMER_QUEUED && !completedIds.has(e.id)) {
      activeQueue.push({ id: e.id, ...e.payload, created_at: e.created_at });
    }
  });

  activeQueue.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Estimate time (rough estimate: 20 mins per person ahead of you for the same barber)
  const getEstimatedWait = (barberId, indexInTotalQueue) => {
    const aheadForSameBarber = activeQueue
      .slice(0, indexInTotalQueue)
      .filter(q => q.barber_id === barberId).length;
    
    // Assume minimum 5 mins if you are next, +20 mins for each person ahead
    return aheadForSameBarber * 20 + 5;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b-2 border-[#D4AF37]/30 pb-6">
        <div>
          <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#FFF8DC]">
            صالون عز الفاخر
          </h1>
          <p className="text-2xl text-gray-400 mt-2 tracking-wide">شاشة الانتظار المباشرة</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold text-[#D4AF37] font-mono">
            {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-xl text-gray-500 mt-1">
            {currentTime.toLocaleDateString('ar-SA')}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {activeQueue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center mt-32 animate-pulse">
            <span className="text-8xl mb-6">✨</span>
            <h2 className="text-4xl text-[#D4AF37] font-bold">لا يوجد انتظار حالياً</h2>
            <p className="text-2xl text-gray-400 mt-4">تفضل بالدخول، نحن في خدمتك فوراً!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-6 py-4 bg-[#1a1a1a]/80 rounded-t-xl border-b border-[#D4AF37]/50 text-xl font-bold text-[#D4AF37]">
              <div>الرقم</div>
              <div>الزبون</div>
              <div>المصفف</div>
              <div className="text-center">الوقت التقريبي</div>
            </div>
            
            <div className="space-y-3">
              {activeQueue.map((customer, idx) => (
                <div 
                  key={customer.id} 
                  className={`grid grid-cols-4 gap-4 px-6 py-5 rounded-xl border border-gray-800 items-center transform transition-all duration-500
                    ${idx === 0 ? 'bg-gradient-to-r from-[#D4AF37]/20 to-[#1a1a1a] border-[#D4AF37] scale-[1.02] shadow-[0_0_20px_rgba(212,175,55,0.15)]' : 'bg-[#121212]'}`}
                >
                  <div className="text-3xl font-black text-gray-300">
                    #{String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className={`text-2xl font-bold ${idx === 0 ? 'text-white' : 'text-gray-300'}`}>
                    {customer.customer_name}
                  </div>
                  <div className="text-xl text-[#B08D57]">
                    {customer.barber_name}
                  </div>
                  <div className="text-center">
                    <span className={`inline-block px-4 py-2 rounded-lg text-xl font-bold ${idx === 0 ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-gray-800 text-gray-400'}`}>
                      {idx === 0 ? 'التالي مباشرة' : `~ ${getEstimatedWait(customer.barber_id, idx)} دقيقة`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="mt-8 overflow-hidden bg-[#D4AF37]/10 py-3 rounded-lg border border-[#D4AF37]/20">
        <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap text-[#D4AF37] text-lg font-bold">
          ✨ أهلاً بكم في صالون عز الفاخر - نرجو منكم الانتظار في الاستراحة لحين النداء على رقمكم - تتوفر خدمة الواي فاي المجانية والمشروبات ✨
        </div>
      </div>
    </div>
  );
}
