import React, { useState, useEffect } from 'react';
import { generateTicket, getQueuePosition } from './QueueService';
import { syncPendingEvents } from '../../lib/syncWorker';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';

export default function CustomerCheckIn() {
  const currentBranchId = 'branch-main-01'; 
  const currentShiftId = 'shift-20240616-01';

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketData, setTicketData] = useState(null); // { ticketNumber, status }
  const [loading, setLoading] = useState(false);

  // Read from LocalStorage on mount to see if already joined
  useEffect(() => {
    const savedTicket = localStorage.getItem('my_ticket');
    if (savedTicket) {
      setTicketData({ ticketNumber: savedTicket });
    }
  }, []);

  const handleJoinQueue = async (e) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);

    try {
      const result = await generateTicket(currentShiftId, currentBranchId, name, phone);
      setTicketData({ ticketNumber: result.ticketNumber });
      localStorage.setItem('my_ticket', result.ticketNumber);
      
      // Trigger sync immediately to upload this queue event to Supabase
      syncPendingEvents();
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء الانضمام للطابور');
    } finally {
      setLoading(false);
    }
  };

  // Reactively track how many people are before this user.
  // We use useLiveQuery to re-run getQueuePosition whenever 'events' table changes.
  const queuePosition = useLiveQuery(
    async () => {
      if (!ticketData?.ticketNumber) return 0;
      return await getQueuePosition(currentShiftId, ticketData.ticketNumber);
    },
    [ticketData?.ticketNumber],
    0
  );

  // Reactively track the current state of THIS user's ticket (WAITING, SERVING, etc)
  const myTicketStatus = useLiveQuery(
    async () => {
      if (!ticketData?.ticketNumber) return null;
      const allEvents = await db.events
        .where('shift_id').equals(currentShiftId)
        .toArray();
      // Filter events related to my ticket
      const myEvents = allEvents.filter(e => e.payload?.ticket_number === ticketData.ticketNumber);
      myEvents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      
      if (myEvents.length === 0) return null;
      
      // Get the latest status
      const latestEvent = myEvents[myEvents.length - 1];
      if (latestEvent.event_type === 'QUEUE_JOINED') return 'WAITING';
      if (latestEvent.event_type === 'QUEUE_SERVING') return 'SERVING';
      if (latestEvent.event_type === 'QUEUE_COMPLETED') return 'COMPLETED';
      if (latestEvent.event_type === 'QUEUE_CANCELLED') return 'CANCELLED';
      return null;
    },
    [ticketData?.ticketNumber],
    null
  );

  const clearTicket = () => {
    localStorage.removeItem('my_ticket');
    setTicketData(null);
  };

  if (ticketData) {
    if (myTicketStatus === 'COMPLETED' || myTicketStatus === 'CANCELLED') {
      return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4" dir="rtl">
          <div className="bg-[#1a1a1a] border border-[#D4AF37] p-8 rounded-xl shadow-lg shadow-[#D4AF37]/20 text-center w-full max-w-sm">
            <h2 className="text-2xl text-[#D4AF37] font-bold mb-4">انتهى دورك</h2>
            <p className="text-gray-300 mb-6">نتمنى لك يوماً سعيداً!</p>
            <button 
              onClick={clearTicket}
              className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-lg"
            >
              حجز دور جديد
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4" dir="rtl">
        <div className="bg-[#1a1a1a] border border-[#D4AF37] p-8 rounded-xl shadow-lg shadow-[#D4AF37]/20 text-center w-full max-w-sm">
          <h2 className="text-gray-400 mb-2 font-semibold text-lg">رقمك هو</h2>
          <div className="text-6xl font-black text-[#D4AF37] mb-6 tracking-wider">
            {ticketData.ticketNumber}
          </div>
          
          <div className="bg-[#121212] rounded-lg p-4 mb-6 border border-[#B08D57]/30">
            {myTicketStatus === 'SERVING' ? (
              <p className="text-xl font-bold text-green-400">تفضل، حان دورك الآن! ✂️</p>
            ) : (
              <>
                <p className="text-gray-400 text-sm mb-1">عدد الأشخاص قبلك</p>
                <p className="text-3xl font-bold text-white">{queuePosition}</p>
                {queuePosition === 0 && <p className="text-[#D4AF37] text-sm mt-2">أنت التالي! استعد.</p>}
              </>
            )}
          </div>
          
          <p className="text-gray-500 text-xs">يرجى عدم إغلاق هذه الصفحة أو يمكنك العودة إليها بنفس المتصفح.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="w-full max-w-sm bg-[#1a1a1a] border border-[#D4AF37] p-8 rounded-xl shadow-lg shadow-[#D4AF37]/20">
        <h1 className="text-2xl text-[#D4AF37] font-bold text-center mb-6">تسجيل الدخول (احجز دورك)</h1>
        
        <form onSubmit={handleJoinQueue} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">اسمك الكريم (مطلوب)</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-[#B08D57] rounded-lg p-4 text-white focus:outline-none focus:border-[#D4AF37]"
              placeholder="مثال: أحمد محمد"
            />
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-2">رقم الجوال (اختياري)</label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#121212] border border-[#B08D57] rounded-lg p-4 text-white focus:outline-none focus:border-[#D4AF37]"
              placeholder="مثال: 05xxxxxxx"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !name}
            className="w-full bg-[#D4AF37] hover:bg-[#B08D57] disabled:bg-gray-700 disabled:text-gray-500 text-black font-extrabold text-lg py-4 rounded-lg mt-4 transition-colors"
          >
            {loading ? 'جاري التسجيل...' : 'انضم للطابور الآن 🎟️'}
          </button>
        </form>
      </div>
    </div>
  );
}
