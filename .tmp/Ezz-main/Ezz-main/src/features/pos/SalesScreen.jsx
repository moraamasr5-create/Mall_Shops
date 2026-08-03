import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { createEvent } from '../../utils/eventManager';
import { syncPendingEvents } from '../../lib/syncWorker';
import { EventTypes } from '../../utils/eventTypes';
import { getCombinedCareTips } from '../../utils/SmartCareEngine';

// Import newly refactored modular components
import CustomerBarberSelector from './CustomerBarberSelector';
import ServiceGrid from './ServiceGrid';
import CartPaymentPanel from './CartPaymentPanel';
import ReceiptPrinter from './ReceiptPrinter';

export default function SalesScreen() {
  const currentBranchId = 'branch-main-01'; 
  const currentShiftId = 'shift-20240616-01';

  // Customer & Barber Selection state
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('b1'); // Default to first barber

  // Cart state
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Print Invoice states
  const [lastInvoice, setLastInvoice] = useState(null);
  const [lastTips, setLastTips] = useState([]);

  // Fetch available services from local DB
  const availableServices = useLiveQuery(() => db.services.toArray(), []) || [];

  // Fetch sales events to count invoice sequence
  const salesEvents = useLiveQuery(
    () => db.events
      .where('shift_id').equals(currentShiftId)
      .filter(e => e.event_type === EventTypes.INVOICE_CREATED)
      .toArray(),
    [currentShiftId]
  ) || [];

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  // Clear toast message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const addToCart = (service) => {
    // Lookup barber name for display in the cart
    const barberNames = { b1: 'أحمد', b2: 'محمود', b3: 'خالد' };
    const selectedBarberName = barberNames[selectedBarber] || 'عام';

    // Add item to cart with associated barber info
    setCart([
      ...cart,
      {
        ...service,
        barberId: selectedBarber,
        barberName: selectedBarberName
      }
    ]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    try {
      // 1. Prepare invoice details payload
      const invoicePayload = {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: cart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          barber_id: item.barberId
        })),
        total: cartTotal,
        invoice_number: salesEvents.length + 1,
      };

      // 2. Generate and save INVOICE_CREATED event in Dexie
      const newEvent = await createEvent(EventTypes.INVOICE_CREATED, invoicePayload, currentBranchId, currentShiftId);

      // Register customer if they provided details
      if (customerName || customerPhone) {
        await createEvent(EventTypes.CUSTOMER_REGISTERED, {
          name: customerName,
          phone: customerPhone,
          invoice_id: newEvent.id
        }, currentBranchId, currentShiftId);
      }

      // 3. Get smart care tips
      const serviceIds = cart.map(item => item.id);
      const tips = getCombinedCareTips(serviceIds);

      // 4. Set states for printer component
      setLastInvoice(newEvent.payload);
      setLastTips(tips);

      // 5. Reset states
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setMessage('💰 تم تسجيل الفاتورة بنجاح! جاري تحضير الطباعة...');

      // 6. Trigger background sync
      syncPendingEvents();

      // 7. Invoke thermal printer
      setTimeout(() => {
        window.print();
      }, 500);

    } catch (error) {
      console.error('Checkout error:', error);
      setMessage('❌ حدث خطأ أثناء إتمام عملية الدفع');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col p-4 md:p-6 bg-[#121212] text-white" dir="rtl">
      
      {/* Header section (hidden in printing) */}
      <div className="print:hidden flex justify-between items-center border-b border-[#D4AF37]/50 pb-4 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl text-[#D4AF37] font-bold">شاشة المبيعات الفاخرة</h1>
          <p className="text-[#B08D57] text-xs md:text-sm">صالون عز - الوردية الحالية: {currentShiftId}</p>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className="print:hidden mb-4 p-3 bg-[#B08D57]/20 border border-[#D4AF37] text-[#D4AF37] rounded-lg text-sm text-center flex-shrink-0">
          {message}
        </div>
      )}

      {/* Main Grid: height constrained to fit exactly within parent viewport */}
      <div className="print:hidden flex-1 grid grid-cols-[2fr_1fr] gap-4 min-h-0 overflow-hidden">
        
        {/* Left Column: Selector & Services Grid (2fr) */}
        <div className="flex flex-col gap-4 overflow-hidden min-h-0">
          
          {/* Component 1: Customer and Barber Selection */}
          <div className="flex-shrink-0">
            <CustomerBarberSelector
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerPhone={customerPhone}
              setCustomerPhone={setCustomerPhone}
              selectedBarber={selectedBarber}
              setSelectedBarber={setSelectedBarber}
            />
          </div>

          {/* Component 2: Services Grid */}
          <div className="flex-1 min-h-0">
            <ServiceGrid
              availableServices={availableServices}
              addToCart={addToCart}
            />
          </div>
        </div>

        {/* Right Column: Component 3: Cart and Payment (1fr) */}
        <div className="h-full min-h-0">
          <CartPaymentPanel
            cart={cart}
            removeFromCart={removeFromCart}
            cartTotal={cartTotal}
            handleCheckout={handleCheckout}
            disabled={loading}
          />
        </div>
      </div>

      {/* Component 4: Printable Receipt representation */}
      <ReceiptPrinter 
        invoice={lastInvoice} 
        branchId={currentBranchId} 
        shiftId={currentShiftId} 
        tips={lastTips} 
      />
    </div>
  );
}
