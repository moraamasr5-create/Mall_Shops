import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { createEvent } from '../../utils/eventManager';
import { syncPendingEvents } from '../../lib/syncWorker';
import { EventTypes } from '../../utils/eventTypes';
import SyncIndicator from '../../components/SyncIndicator';
import ReceiptPrinter from './ReceiptPrinter';
import { getCombinedCareTips } from '../../utils/SmartCareEngine';
import DashboardExample from '../dashboard/DashboardExample';
import QueueManager from '../queue/QueueManager';

export default function POSScreen() {
  const currentBranchId = 'branch-main-01'; 
  const currentShiftId = 'shift-20240616-01'; 

  const [shiftState, setShiftState] = useState('CLOSED'); 
  const [message, setMessage] = useState('');
  
  // Cart & Customer State
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Invoice State for Printing
  const [lastInvoice, setLastInvoice] = useState(null);
  const [lastTips, setLastTips] = useState([]);

  // جلب الخدمات المرجعية من Dexie
  const availableServices = useLiveQuery(() => db.services.toArray(), []) || [];

  // إجمالي الوردية (يُقرأ من الأحداث المحفوظة)
  const salesEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(currentShiftId)
      .filter(e => e.event_type === EventTypes.INVOICE_CREATED)
      .toArray(),
    [currentShiftId]
  ) || [];
  const shiftTotalSales = salesEvents.reduce((total, event) => total + (event.payload?.total || 0), 0);

  // إجمالي السلة الحالية
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // إدارة الوردية
  const handleOpenShift = async () => {
    await createEvent(EventTypes.SHIFT_OPEN, { opened_by: 'Ahmed' }, currentBranchId, currentShiftId);
    setShiftState('OPEN');
    localStorage.setItem(`shift_start_${currentShiftId}`, Date.now().toString());
    setMessage('✅ تم فتح الوردية بنجاح');
    syncPendingEvents();
  };

  const handleStartClosing = async () => {
    const shiftStartTime = localStorage.getItem(`shift_start_${currentShiftId}`);
    if (shiftStartTime) {
      const hoursPassed = (Date.now() - parseInt(shiftStartTime)) / (1000 * 60 * 60);
      if (hoursPassed < 10) {
        setMessage('عذراً، لا يمكن إغلاق الوردية الحالية قبل مرور 10 ساعات على الأقل من بدئها');
        return;
      }
    }
    
    await createEvent(EventTypes.SHIFT_CLOSING, { expected_cash: shiftTotalSales }, currentBranchId, currentShiftId);
    setShiftState('CLOSING');
    setMessage('🔒 الوردية في وضع الإغلاق للمراجعة...');
    syncPendingEvents();
  };

  const handleConfirmClose = async () => {
    await createEvent(EventTypes.SHIFT_CLOSED, { closed_by: 'Ahmed', local_computed_total: shiftTotalSales }, currentBranchId, currentShiftId);
    setShiftState('CLOSED');
    setMessage('🛑 تم إنهاء الوردية بنجاح');
    syncPendingEvents();
  };

  // إدارة السلة (لا تكتب أحداث فورية، فقط عند الدفع)
  const addToCart = (service) => {
    if (shiftState !== 'OPEN') return;
    setCart([...cart, service]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // إتمام البيع وإنشاء حدث الفاتورة
  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // تجهيز تفاصيل الفاتورة
    const invoicePayload = {
      customer_name: customerName,
      customer_phone: customerPhone,
      items: cart,
      total: cartTotal,
      invoice_number: salesEvents.length + 1,
    };

    // 1. توليد الحدث وحفظه في Dexie
    const newEvent = await createEvent(EventTypes.INVOICE_CREATED, invoicePayload, currentBranchId, currentShiftId);
    
    // تسجيل العميل إذا أدخل بياناته
    if (customerName || customerPhone) {
      await createEvent(EventTypes.CUSTOMER_REGISTERED, {
        name: customerName,
        phone: customerPhone,
        invoice_id: newEvent.id
      }, currentBranchId, currentShiftId);
    }

    // 2. استخدام محرك النصائح الذكي
    const serviceIds = cart.map(item => item.id);
    const tips = getCombinedCareTips(serviceIds);

    // 3. تجهيز الفاتورة للطباعة
    setLastInvoice(newEvent.payload);
    setLastTips(tips);

    // 4. تصفير السلة وتحديث الواجهة
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setMessage('💰 تم الدفع بنجاح! جاري الطباعة...');
    syncPendingEvents();

    // 5. استدعاء أمر الطباعة (سيعتمد على الـ @media print في الـ CSS)
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="p-4 md:p-6 min-h-screen" dir="rtl">
      {/* إخفاء هذه العناصر عند الطباعة */}
      <div className="print:hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-[#D4AF37] pb-4 mb-6">
          <div>
            <h1 className="text-3xl text-[#D4AF37] font-bold">صالون عز الفاخر</h1>
            <p className="text-[#B08D57] mt-1">الوردية: {currentShiftId}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <SyncIndicator />
          </div>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-[#B08D57]/20 border border-[#D4AF37] text-[#D4AF37] rounded-lg">
            {message}
          </div>
        )}

        {shiftState === 'CLOSED' && (
          <div className="text-center py-20">
            <h2 className="text-2xl mb-4 text-[#B08D57]">الوردية مغلقة حالياً</h2>
            <button 
              onClick={handleOpenShift}
              className="bg-[#D4AF37] hover:bg-[#B08D57] text-[#121212] px-8 py-4 rounded-lg text-xl font-bold min-h-[48px] min-w-[48px] transition-colors"
            >
              فتح الوردية 🔓
            </button>
          </div>
        )}

        {shiftState === 'OPEN' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* قسم الخدمات (اليمين) */}
            <div className="lg:col-span-2">
              <h3 className="text-xl text-[#D4AF37] mb-4">الخدمات المتاحة</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {availableServices.map(service => (
                  <button 
                    key={service.id}
                    onClick={() => addToCart(service)}
                    className="bg-[#1a1a1a] border border-[#D4AF37]/50 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 p-6 rounded-lg text-lg flex flex-col items-center justify-center min-h-[100px] min-w-[48px] transition-all touch-manipulation"
                  >
                    <span className="font-bold text-white mb-2">{service.name}</span>
                    <span className="text-[#B08D57]">{service.price} ج.م</span>
                  </button>
                ))}
              </div>
              
              {/* زر قفل الوردية */}
              <div className="mt-12 border-t border-[#D4AF37]/30 pt-6">
                <button 
                  onClick={handleStartClosing}
                  className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-6 py-3 rounded-lg font-bold min-h-[48px] min-w-[48px]"
                >
                  قفل الوردية 🔒
                </button>
              </div>

              {/* إدارة الطابور */}
              <QueueManager branchId={currentBranchId} shiftId={currentShiftId} disabled={shiftState !== 'OPEN'} />
            </div>

            {/* قسم السلة والعميل (اليسار) */}
            <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#B08D57] flex flex-col justify-between h-full">
              <div>
                <h3 className="text-xl text-[#D4AF37] mb-4 border-b border-[#D4AF37]/30 pb-2">بيانات العميل</h3>
                <div className="space-y-3 mb-6">
                  <input 
                    type="text" 
                    placeholder="اسم العميل (اختياري)" 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-[#121212] border border-[#B08D57] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] min-h-[48px]"
                  />
                  <input 
                    type="tel" 
                    placeholder="رقم الجوال (اختياري)" 
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full bg-[#121212] border border-[#B08D57] rounded p-3 text-white focus:outline-none focus:border-[#D4AF37] min-h-[48px]"
                  />
                </div>

                <h3 className="text-xl text-[#D4AF37] mb-4 border-b border-[#D4AF37]/30 pb-2">سلة الخدمات</h3>
                {cart.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">السلة فارغة</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {cart.map((item, index) => (
                      <li key={index} className="flex justify-between items-center bg-[#121212] p-3 rounded border border-[#B08D57]/30">
                        <span>{item.name}</span>
                        <div className="flex items-center">
                          <span className="text-[#D4AF37] ml-4">{item.price} ج.م</span>
                          <button onClick={() => removeFromCart(index)} className="text-red-500 font-bold hover:text-red-400 p-2 min-h-[48px] min-w-[48px]">X</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#D4AF37]">
                <div className="flex justify-between items-center text-2xl font-bold mb-6">
                  <span>الإجمالي:</span>
                  <span className="text-[#D4AF37]">{cartTotal} ج.م</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={cart.length === 0}
                  className="w-full bg-[#D4AF37] hover:bg-[#B08D57] disabled:bg-gray-600 disabled:text-gray-400 text-[#121212] py-4 rounded-lg font-bold text-xl min-h-[48px] min-w-[48px] transition-colors"
                >
                  تأكيد وطباعة 🖨️
                </button>
              </div>
            </div>

          </div>
        )}

        {shiftState === 'CLOSING' && (
          <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#D4AF37] max-w-xl mx-auto text-center mt-10">
            <h2 className="text-2xl text-[#D4AF37] font-bold mb-6">مراجعة إغلاق الوردية</h2>
            <p className="text-gray-300 text-lg mb-8">
              هل أنت متأكد من رغبتك في إغلاق الوردية الحالية؟
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => setShiftState('OPEN')} 
                className="px-6 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold min-h-[48px] min-w-[48px]"
              >
                تراجع ↩️
              </button>
              <button 
                onClick={handleConfirmClose}
                className="px-6 py-4 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold min-h-[48px] min-w-[48px]"
              >
                تأكيد الإغلاق 🛑
              </button>
            </div>
          </div>
        )}
      </div>

      {/* مكون الطباعة يظهر فقط عند الضغط على الطباعة */}
      <ReceiptPrinter 
        invoice={lastInvoice} 
        branchId={currentBranchId} 
        shiftId={currentShiftId} 
        tips={lastTips} 
      />

      <div className="print:hidden mt-8 border-t border-[#D4AF37]/50 pt-8">
        <DashboardExample shiftId={currentShiftId} />
      </div>

    </div>
  );
}
