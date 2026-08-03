import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useRealtimeNotifications() {
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Listen to new events from Supabase
    const channel = supabase
      .channel('events_realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        const newEvent = payload.new;
        
        if (newEvent.event_type === 'QUEUE_JOINED') {
          showToast(`🔔 عميل جديد انضم للطابور: ${newEvent.payload?.customer_name || 'بدون اسم'}`);
        } else if (newEvent.event_type === 'INVOICE_CREATED') {
          showToast(`💰 فاتورة جديدة تم إنشاؤها`);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  return notification;
}
