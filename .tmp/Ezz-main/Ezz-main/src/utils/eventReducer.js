/**
 * Event Reducer Layer
 * Transforms raw events (Event Sourcing) into usable state/projections.
 * Pure functions, robust to missing or legacy data.
 */

export const buildInvoices = (events) => {
  if (!Array.isArray(events)) return [];

  return events
    .filter(e => e?.event_type === 'INVOICE_CREATED')
    .map(e => {
      const payload = e?.payload || {};
      return {
        id: payload.id || e?.id || 'unknown',
        shift_id: payload.shift_id || e?.shift_id || null,
        branch_id: payload.branch_id || e?.branch_id || null,
        items: Array.isArray(payload.items) ? payload.items : [],
        total: Number(payload.total) || 0,
        customer_name: payload.customer_name || 'عميل نقدي',
        customer_phone: payload.customer_phone || '',
        created_at: e?.created_at || new Date().toISOString()
      };
    });
};

export const buildCustomers = (events) => {
  if (!Array.isArray(events)) return [];

  const customersMap = new Map();

  events
    .filter(e => e?.event_type === 'CUSTOMER_REGISTERED')
    .forEach(e => {
      const payload = e?.payload || {};
      const phone = payload.phone || payload.customer_phone;
      
      if (phone && !customersMap.has(phone)) {
        customersMap.set(phone, {
          id: payload.id || e?.id,
          name: payload.name || payload.customer_name || 'غير معروف',
          phone: phone,
          created_at: e?.created_at || new Date().toISOString()
        });
      }
    });

  return Array.from(customersMap.values());
};

export const calculateShiftTotal = (events, shiftId) => {
  if (!Array.isArray(events) || !shiftId) return 0;

  return events
    .filter(e => 
      e?.event_type === 'INVOICE_CREATED' && 
      (e?.payload?.shift_id === shiftId || e?.shift_id === shiftId)
    )
    .reduce((total, e) => {
      const payload = e?.payload || {};
      return total + (Number(payload.total) || 0);
    }, 0);
};

export const getCurrentShiftState = (events, shiftId) => {
  const defaultState = {
    opened: false,
    closed: false,
    openedBy: null,
    closedBy: null,
    total: 0
  };

  if (!Array.isArray(events) || !shiftId) return defaultState;

  const shiftEvents = events.filter(e => 
    e?.payload?.shift_id === shiftId || e?.shift_id === shiftId
  );

  const openedEvent = shiftEvents.find(e => e?.event_type === 'SHIFT_OPENED');
  const closedEvent = shiftEvents.find(e => e?.event_type === 'SHIFT_CLOSED');
  
  const total = calculateShiftTotal(shiftEvents, shiftId);

  return {
    opened: !!openedEvent,
    closed: !!closedEvent,
    openedBy: openedEvent?.payload?.opened_by || openedEvent?.payload?.user_id || null,
    closedBy: closedEvent?.payload?.closed_by || closedEvent?.payload?.user_id || null,
    total
  };
};
