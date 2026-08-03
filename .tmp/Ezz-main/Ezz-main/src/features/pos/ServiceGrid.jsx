import React from 'react';

export default function ServiceGrid({
  availableServices = [],
  addToCart
}) {
  return (
    <div className="bg-[#1a1a1a] border border-[#B08D57]/30 rounded-xl p-5 shadow-lg flex flex-col h-full">
      <h3 className="text-lg font-bold text-[#D4AF37] border-b border-[#D4AF37]/20 pb-2 mb-4 flex items-center gap-2">
        💈 الخدمات المتاحة
      </h3>
      
      {/* Scrollable Services Area */}
      <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#D4AF37] scrollbar-track-[#121212] min-h-0">
        {availableServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <span className="text-3xl mb-2">📭</span>
            <p>لا توجد خدمات متاحة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {availableServices.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => addToCart(service)}
                className="bg-[#121212] border border-[#B08D57]/20 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 p-4 rounded-xl flex flex-col items-center justify-center gap-2 min-h-[90px] transition-all duration-200 active:scale-95 group touch-manipulation text-center"
              >
                <span className="font-bold text-white group-hover:text-[#D4AF37] transition-colors text-sm md:text-base">
                  {service.name}
                </span>
                <span className="text-[#B08D57] font-semibold text-xs md:text-sm">
                  {service.price} ج.م
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
