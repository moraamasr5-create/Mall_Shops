import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { 
  buildInvoices, 
  buildCustomers, 
  getCurrentShiftState 
} from '../utils/eventReducer';

/**
 * Custom hook to show how we read raw events from Dexie
 * and run them through the eventReducer to get usable projections.
 */
export const useEventData = (shiftId) => {
  // Fetch all events from local Dexie database
  const events = useLiveQuery(() => db.events.toArray(), []) || [];

  const [projections, setProjections] = useState({
    invoices: [],
    customers: [],
    shiftState: { opened: false, closed: false, openedBy: null, closedBy: null, total: 0 }
  });

  useEffect(() => {
    // Process raw events using our pure event reducers
    const invoices = buildInvoices(events);
    const customers = buildCustomers(events);
    const shiftState = getCurrentShiftState(events, shiftId);

    setProjections({
      invoices,
      customers,
      shiftState
    });
  }, [events, shiftId]);

  return projections;
};
