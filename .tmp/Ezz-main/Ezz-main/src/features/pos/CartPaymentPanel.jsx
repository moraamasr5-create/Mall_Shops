import React from 'react';

export default function CartPaymentPanel({
  cart = [],
  removeFromCart,
  cartTotal = 0,
  handleCheckout,
  disabled = false
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#B08D57] rounded-xl p-5 shadow-lg flex flex-col h-full justify-between">
      {/* Top Header & Scrollable List Container */}
      <div className="flex flex-col flex-1 min-h-0">
        <h3 className="text-lg font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-3 flex items-center gap-2">
          🛒 سلة الخدمات
        </h3>
        
        {/* Scrollable list with fixed space */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-[#121212] mb-4 min-h-0">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <span className="text-3xl mb-2">🛒</span>
              <p className="text-sm">السلة فارغة حالياً</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {cart.map((item, index) => (
                <li
                  key={`${item.id}-${index}`}
                  className="flex justify-between items-center bg-[#121212] p-3 rounded-lg border border-[#B08D57]/20 hover:border-[#B08D57]/40 transition-colors"
                >
                  <div className="flex flex-col">
                    <span className="text-white font-medium text-sm">{item.name}</span>
                    {item.barberName && (
                      <span className="text-gray-400 text-xs mt-0.5">الحلاق: {item.barberName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#D4AF37] font-bold text-sm">{item.price} ج.م</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(index)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      title="حذف"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Checkout and Totals */}
      <div className="border-t border-[#D4AF37]/30 pt-4 bg-[#1a1a1a]">
        <div className="flex justify-between items-center text-xl font-bold mb-4 px-1">
          <span className="text-gray-300">الإجمالي:</span>
          <span className="text-[#D4AF37]">{cartTotal} ج.م</span>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={cart.length === 0 || disabled}
          className="w-full bg-[#D4AF37] hover:bg-[#B08D57] disabled:bg-gray-700 disabled:text-gray-400 text-[#121212] py-4 rounded-xl font-extrabold text-lg transition-all active:scale-98 shadow-lg shadow-[#D4AF37]/10 disabled:shadow-none min-h-[48px] touch-manipulation flex items-center justify-center gap-2"
        >
          <span>تأكيد وطباعة الفاتورة</span>
          <span>🖨️</span>
        </button>
      </div>
    </div>
  );
}
