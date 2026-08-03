import React from 'react';

const BARBERS = [
  { id: 'b1', name: 'أحمد' },
  { id: 'b2', name: 'محمود' },
  { id: 'b3', name: 'خالد' }
];

export default function CustomerBarberSelector({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  selectedBarber,
  setSelectedBarber
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#B08D57]/30 rounded-xl p-5 shadow-lg flex flex-col gap-4">
      <h3 className="text-lg font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 flex items-center gap-2">
        👤 بيانات العميل والحلاق
      </h3>
      
      {/* Customer Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">اسم العميل (اختياري)</label>
          <input
            type="text"
            placeholder="مثال: محمد أحمد"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full bg-[#121212] border border-[#B08D57]/40 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] min-h-[48px] transition-all text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400 font-semibold">رقم الجوال (اختياري)</label>
          <input
            type="tel"
            placeholder="مثال: 010xxxxxxx"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full bg-[#121212] border border-[#B08D57]/40 rounded-lg p-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] min-h-[48px] transition-all text-sm"
          />
        </div>
      </div>

      {/* Barber Selection */}
      <div className="flex flex-col gap-2">
        <label className="text-xs text-gray-400 font-semibold">حلاق الخدمة</label>
        <div className="grid grid-cols-3 gap-2">
          {BARBERS.map((barber) => {
            const isSelected = selectedBarber === barber.id;
            return (
              <button
                key={barber.id}
                type="button"
                onClick={() => setSelectedBarber(barber.id)}
                className={`py-3 rounded-lg font-bold transition-all text-sm border flex items-center justify-center gap-2 min-h-[48px] touch-manipulation ${
                  isSelected
                    ? 'bg-[#D4AF37] text-[#121212] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                    : 'bg-[#121212] border-[#B08D57]/30 text-gray-300 hover:bg-[#B08D57]/10 hover:border-[#D4AF37]/50'
                }`}
              >
                <span>✂️</span>
                <span>{barber.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
