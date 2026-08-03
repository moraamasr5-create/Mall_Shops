import React, { useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import POSScreen from './features/pos/POSScreen'
import BarberDashboard from './features/dashboard/BarberDashboard'
import LiveQueueDisplay from './features/queue/LiveQueueDisplay'
import CustomerCheckIn from './features/queue/CustomerCheckIn'
import TabletQueueScreen from './features/queue/TabletQueueScreen'
import { initSyncWorker } from './lib/syncWorker'
import { seedServices } from './lib/db'
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications'

function App() {
  const location = useLocation();
  const notification = useRealtimeNotifications();

  useEffect(() => {
    seedServices();
    initSyncWorker();
  }, []);

  // Hide nav on specific screens
  const hideNav = location.pathname === '/queue-display' || location.pathname === '/check-in' || location.pathname === '/tablet';

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans flex flex-col">
      {/* Realtime Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-[9999] bg-[#D4AF37] text-black px-6 py-4 rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.4)] font-bold border-2 border-white/20 transition-all" dir="rtl">
          {notification}
        </div>
      )}

      {!hideNav && (
        <nav className="print:hidden bg-[#1a1a1a] border-b border-[#D4AF37]/50 p-4 flex justify-center gap-4 shadow-md flex-wrap">
          <Link to="/" className={`px-4 py-2 font-bold rounded transition-colors ${location.pathname === '/' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>نقطة البيع (POS)</Link>
          <Link to="/barbers" className={`px-4 py-2 font-bold rounded transition-colors ${location.pathname === '/barbers' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>لوحة المصففين</Link>
          <Link to="/queue-display" className={`px-4 py-2 font-bold rounded transition-colors ${location.pathname === '/queue-display' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>شاشة الانتظار</Link>
          <Link to="/check-in" className={`px-4 py-2 font-bold rounded transition-colors ${location.pathname === '/check-in' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>شاشة العميل (QR)</Link>
          <Link to="/tablet" className={`px-4 py-2 font-bold rounded transition-colors ${location.pathname === '/tablet' ? 'bg-[#D4AF37] text-black' : 'text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}>التابلت</Link>
        </nav>
      )}

      {location.pathname === '/queue-display' && (
        <Link to="/" className="fixed top-4 left-4 bg-black/50 text-white px-3 py-1 rounded opacity-20 hover:opacity-100 transition-opacity z-50 print:hidden">
          العودة
        </Link>
      )}

      <div className="flex-1">
        <Routes>
          <Route path="/" element={<POSScreen />} />
          <Route path="/barbers" element={<BarberDashboard />} />
          <Route path="/queue-display" element={<LiveQueueDisplay />} />
          <Route path="/check-in" element={<CustomerCheckIn />} />
          <Route path="/tablet" element={<TabletQueueScreen />} />
        </Routes>
      </div>
    </div>
  )
}

export default App

