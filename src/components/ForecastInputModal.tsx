import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../utils/formatters';
import { X, Target, Check, Building2 } from 'lucide-react';

interface ForecastInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDcId?: string;
}

export const ForecastInputModal: React.FC<ForecastInputModalProps> = ({
  isOpen,
  onClose,
  defaultDcId
}) => {
  const { dcs, products, forecasts, updateForecast } = useApp();

  const [selectedDcId, setSelectedDcId] = useState(defaultDcId || dcs[0]?.id || '');
  const [productQuantities, setProductQuantities] = useState<Record<string, number | ''>>({});

  useEffect(() => {
    if (!isOpen) return;

    const dcIdToUse = defaultDcId || selectedDcId || dcs[0]?.id || '';
    setSelectedDcId(dcIdToUse);

    // Initialize quantities for this DC
    const initialQtys: Record<string, number | ''> = {};
    products.forEach(p => {
      const existing = forecasts.find(f => f.dcId === dcIdToUse && f.productId === p.id);
      initialQtys[p.id] = existing ? existing.forecastQty : 0;
    });
    setProductQuantities(initialQtys);
  }, [isOpen, defaultDcId, selectedDcId, products, forecasts]);

  const handleDcChange = (newDcId: string) => {
    setSelectedDcId(newDcId);
    const initialQtys: Record<string, number | ''> = {};
    products.forEach(p => {
      const existing = forecasts.find(f => f.dcId === newDcId && f.productId === p.id);
      initialQtys[p.id] = existing ? existing.forecastQty : 0;
    });
    setProductQuantities(initialQtys);
  };

  const handleQtyChange = (productId: string, val: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: val === '' ? '' : Math.max(0, parseInt(val, 10))
    }));
  };

  if (!isOpen) return null;

  const selectedDc = dcs.find(d => d.id === selectedDcId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDcId) return;

    // Update forecast for each product
    products.forEach(p => {
      const val = productQuantities[p.id];
      const safeQty = typeof val === 'number' ? val : 0;
      updateForecast(selectedDcId, p.id, safeQty);
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Handle Tab Indicator (Matching Reference Image!) */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Target className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Input Target Forecast per DC
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Alokasi kuantiti forecast pengiriman awal untuk titik DC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Pilih Tujuan DC <span className="text-red-500">*</span>
            </label>
            <div className="clay-search-pill px-3.5 py-1.5">
              <select
                value={selectedDcId}
                onChange={e => handleDcChange(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                <optgroup label="DC Indomarco">
                  {dcs.filter(d => d.network === 'Indomarco').map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region} - {d.city})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="DC Indogrosir">
                  {dcs.filter(d => d.network === 'Indogrosir').map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.region} - {d.city})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {selectedDc && (
            <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-100 flex items-center gap-2 text-xs text-blue-900 font-medium">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Jaringan: <strong>{selectedDc.network}</strong> · Wilayah: <strong>{selectedDc.region}</strong> · Kota: <strong>{selectedDc.city}</strong>
              </span>
            </div>
          )}

          {/* Product Forecast Inputs (Stylized Clay Chips) */}
          <div className="space-y-2.5 pt-1">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Target Forecast per Barang (Satuan Karton)
            </label>

            {products.map(p => {
              const currentVal = productQuantities[p.id] ?? 0;

              return (
                <div
                  key={p.id}
                  className="clay-chip-white p-3 flex items-center justify-between"
                >
                  <div className="pr-3">
                    <div className="text-xs font-bold text-slate-900">{p.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {p.sku} · {p.packSize}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      required
                      value={currentVal}
                      onChange={e => handleQtyChange(p.id, e.target.value)}
                      placeholder="0"
                      className="w-28 px-3 py-1.5 border border-slate-300 rounded-full text-sm text-right font-black focus:outline-blue-600 bg-slate-50 shadow-inner"
                    />
                    <span className="text-xs text-slate-600 font-bold w-8">ctn</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Total summary */}
          <div className="p-3 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Total Forecast DC Ini:</span>
            <span className="text-sm font-black text-blue-700">
              {formatNumber(
                Object.values(productQuantities).reduce<number>((sum, val) => {
                  return sum + (typeof val === 'number' ? val : 0);
                }, 0)
              )}{' '}
              <span className="font-normal text-xs text-slate-600">Karton</span>
            </span>
          </div>

          {/* Actions: Side-by-side Apply and Cancel buttons matching reference */}
          <div className="pt-3 grid grid-cols-2 gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-white py-2.5 text-xs text-center cursor-pointer font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="clay-btn-apply py-2.5 text-xs text-center cursor-pointer font-bold flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
