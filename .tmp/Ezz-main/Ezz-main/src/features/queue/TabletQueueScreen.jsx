import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { updateTicketStatus } from './QueueService';
import { syncPendingEvents } from '../../lib/syncWorker';

export default function TabletQueueScreen() {
  const currentBranchId = 'branch-main-01'; 
  const currentShiftId = 'shift-20240616-01';

  // Get all queue events to reconstruct the latest state for each ticket
  const allQueueEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(currentShiftId)
      .filter(e => ['QUEUE_JOINED', 'QUEUE_SERVING', 'QUEUE_COMPLETED', 'QUEUE_CANCELLED'].includes(e.event_type))
      .toArray(),
    [currentShiftId]
  ) || [];

  // Reconstruct ticket states
  const ticketMap = {};
  
  // Sort events chronologically to process state changes in order
  const sortedEvents = [...allQueueEvents].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  for (const event of sortedEvents) {
    const tNum = event.payload.ticket_number;
    
    if (event.event_type === 'QUEUE_JOINED') {
      ticketMap[tNum] = {
        ...event.payload,
        status: 'WAITING'
      };
    } else if (event.event_type === 'QUEUE_SERVING') {
      if (ticketMap[tNum]) ticketMap[tNum].status = 'SERVING';
    } else if (event.event_type === 'QUEUE_COMPLETED') {
      if (ticketMap[tNum]) ticketMap[tNum].status = 'COMPLETED';
    } else if (event.event_type === 'QUEUE_CANCELLED') {
      if (ticketMap[tNum]) ticketMap[tNum].status = 'CANCELLED';
    }
  }

  // Filter out completed and cancelled for the active display
  const activeTickets = Object.values(ticketMap).filter(t => t.status === 'WAITING' || t.status === 'SERVING');
  
  // Sort: SERVING first, then WAITING by join time (which correlates with ticket number normally)
  activeTickets.sort((a, b) => {
    if (a.status === 'SERVING' && b.status === 'WAITING') return -1;
    if (a.status === 'WAITING' && b.status === 'SERVING') return 1;
    return new Date(a.joined_at) - new Date(b.joined_at);
  });

  const handleStatusChange = async (ticketNumber, newStatus) => {
    await updateTicketStatus(currentShiftId, currentBranchId, ticketNumber, newStatus);
    syncPendingEvents();
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6" dir="rtl">
      <h1 className="text-3xl font-bold text-[#D4AF37] mb-8 border-b border-[#D4AF37]/30 pb-4">
        إدارة الطابور (التابلت)
      </h1>

      {activeTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <span className="text-5xl mb-4">📭</span>
          <p className="text-xl">لا يوجد عملاء في الانتظار حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTickets.map(ticket => (
            <div 
              key={ticket.ticket_number} 
              className={`rounded-xl p-5 border-2 transition-all shadow-lg flex flex-col justify-between min-h-[220px] ${
                ticket.status === 'SERVING' 
                  ? 'bg-[#1a1a1a] border-green-500 shadow-green-500/20' 
                  : 'bg-[#121212] border-[#B08D57]/50 hover:border-[#D4AF37]'
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="text-3xl font-black text-[#D4AF37]">{ticket.ticket_number}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ticket.status === 'SERVING' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {ticket.status === 'SERVING' ? 'جاري الخدمة' : 'في الانتظار'}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-1">{ticket.customer_name || 'عميل بدون اسم'}</h3>
                {ticket.customer_phone && <p className="text-gray-400 text-sm mb-4">{ticket.customer_phone}</p>}
              </div>

              <div className="flex gap-2 mt-4 border-t border-gray-700 pt-4">
                {ticket.status === 'WAITING' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange(ticket.ticket_number, 'SERVING')}
                      className="flex-1 bg-[#D4AF37] hover:bg-[#B08D57] text-black font-bold py-3 rounded-lg text-sm transition-colors"
                    >
                      بدء الخدمة ▶
                    </button>
                    <button 
                      onClick={() => handleStatusChange(ticket.ticket_number, 'CANCELLED')}
                      className="bg-red-900/40 hover:bg-red-800 text-red-200 font-bold py-3 px-4 rounded-lg text-sm border border-red-800 transition-colors"
                    >
                      تخطي ✕
                    </button>
                  </>
                )}
                
                {ticket.status === 'SERVING' && (
                  <button 
                    onClick={() => handleStatusChange(ticket.ticket_number, 'COMPLETED')}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg text-sm transition-colors"
                  >
                    إكمال الخدمة ✓
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
