import { db } from '../../lib/db';
import { EventTypes } from '../../utils/eventTypes';
import { createEvent } from '../../utils/eventManager';

/**
 * دالة لتوليد رقم التذكرة بصيغة A001
 */
export async function generateTicket(shiftId, branchId, customerName, customerPhone) {
  // نجلب كل من انضم للطابور في هذه الوردية
  const queuedEvents = await db.events
    .where('shift_id').equals(shiftId)
    .filter(e => e.event_type === EventTypes.QUEUE_JOINED)
    .toArray();
    
  // رقم التذكرة الجديد
  const ticketNumberInt = queuedEvents.length + 1;
  const ticketNumberStr = `A${ticketNumberInt.toString().padStart(3, '0')}`;
  
  // إنشاء الحدث في Dexie
  const payload = {
    ticket_number: ticketNumberStr,
    customer_name: customerName,
    customer_phone: customerPhone,
    status: 'WAITING',
    joined_at: new Date().toISOString()
  };
  
  const newEvent = await createEvent(EventTypes.QUEUE_JOINED, payload, branchId, shiftId);
  return { event: newEvent, ticketNumber: ticketNumberStr };
}

/**
 * دالة لمعرفة كم شخص ينتظر قبل هذا العميل
 */
export async function getQueuePosition(shiftId, ticketNumberStr) {
  // نجلب جميع أحداث الطابور لمعرفة الحالة النهائية لكل شخص
  const allQueueEvents = await db.events
    .where('shift_id').equals(shiftId)
    .filter(e => [
      EventTypes.QUEUE_JOINED,
      EventTypes.QUEUE_SERVING,
      EventTypes.QUEUE_COMPLETED,
      EventTypes.QUEUE_CANCELLED
    ].includes(e.event_type))
    .toArray();
    
  // تجميع الحالة الحالية لكل تذكرة
  const ticketStates = {};
  
  // الأحداث مرتبة زمنياً غالباً، لكن للتأكد نرتبها
  allQueueEvents.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  
  for (const event of allQueueEvents) {
    const tNum = event.payload.ticket_number;
    if (event.event_type === EventTypes.QUEUE_JOINED) {
      ticketStates[tNum] = 'WAITING';
    } else if (event.event_type === EventTypes.QUEUE_SERVING) {
      ticketStates[tNum] = 'SERVING';
    } else if (event.event_type === EventTypes.QUEUE_COMPLETED || event.event_type === EventTypes.QUEUE_CANCELLED) {
      delete ticketStates[tNum]; // انتهى دوره
    }
  }
  
  // الآن لدينا كل من هم في وضع الانتظار WAITING
  const waitingTickets = Object.keys(ticketStates).filter(t => ticketStates[t] === 'WAITING');
  // نرتب التذاكر
  waitingTickets.sort();
  
  const positionIndex = waitingTickets.indexOf(ticketNumberStr);
  if (positionIndex === -1) {
    // لم يعد في قائمة الانتظار
    return 0; 
  }
  
  // عدد الأشخاص قبله هو الـ index
  return positionIndex;
}

/**
 * تحديث حالة التذكرة
 */
export async function updateTicketStatus(shiftId, branchId, ticketNumberStr, newStatus) {
  let eventType;
  if (newStatus === 'SERVING') eventType = EventTypes.QUEUE_SERVING;
  else if (newStatus === 'COMPLETED') eventType = EventTypes.QUEUE_COMPLETED;
  else if (newStatus === 'CANCELLED') eventType = EventTypes.QUEUE_CANCELLED;
  else return null;

  const payload = {
    ticket_number: ticketNumberStr,
    status: newStatus,
    updated_at: new Date().toISOString()
  };

  return await createEvent(eventType, payload, branchId, shiftId);
}
