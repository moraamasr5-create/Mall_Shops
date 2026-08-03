import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { syncPendingEvents } from '../lib/syncWorker';

/**
 * مكون SyncIndicator
 * يعرض حالة المزامنة الحالية وعدد الأحداث المعلقة في طابور الرفع (Queue).
 * Dexie هو المصدر الأساسي، لذلك نستمع للتغييرات محلياً ونعرضها فورا.
 */
export default function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // استخدام useLiveQuery لمراقبة عدد الأحداث المعلقة في Dexie بشكل حي (Reactive)
  const pendingCount = useLiveQuery(
    () => db.events.where('sync_status').anyOf(['pending', 'failed']).count(),
    []
  );

  // تحديث حالة الاتصال بالإنترنت
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2 space-x-reverse text-sm font-medium">
      {/* حالة الاتصال */}
      <div className={`flex items-center ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
        <span className={`h-3 w-3 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isOnline ? 'متصل' : 'أوفلاين'}
      </div>

      {/* عدد الأحداث المعلقة في الـ Queue */}
      {(pendingCount > 0) && (
        <div className="flex items-center bg-yellow-600/20 text-yellow-500 px-2 py-1 rounded">
          <span className="mr-1">⏳</span>
          <span>{pendingCount} في الانتظار</span>
          {isOnline && (
            <button 
              onClick={syncPendingEvents}
              className="ml-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded hover:bg-yellow-500"
            >
              مزامنة
            </button>
          )}
        </div>
      )}
      
      {(pendingCount === 0) && (
        <div className="text-gray-400 px-2 py-1">
          ✓ تمت المزامنة
        </div>
      )}
    </div>
  );
}
