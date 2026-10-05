import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, ArrowDownRight, Check } from 'lucide-react';

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultWarehouseId?: string;
  defaultProductId?: string;
}

export const StockInModal: React.FC<StockInModalProps> = ({
  isOpen,
  onClose,
  defaultWarehouseId,
  defaultProductId
}) => {
  const { warehouses, products, addStockIn } = useApp();

  const [warehouseId, setWarehouseId] = useState(defaultWarehouseId || warehouses[0]?.id || '');
  const [productId, setProductId] = useState(defaultProductId || products[0]?.id || '');
  const [qty, setQty] = useState<number | ''>('');
  const [refNumber, setRefNumber] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseId || !productId || !qty || Number(qty) <= 0) return;

    addStockIn(
      warehouseId,
      productId,
      Number(qty),
      refNumber.trim() || `RCV-${Date.now().toString().slice(-6)}`,
      notes.trim() || 'Penerimaan stok baru dari produksi'
    );

    onClose();
  };

  const selectedProd = products.find(p => p.id === productId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Handle Tab Indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Penerimaan Stok Masuk (Inbound)
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tambah stok barang dari produksi atau transfer masuk
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Gudang Penerima <span className="text-red-500">*</span>
            </label>
            <div className="clay-search-pill px-3.5 py-1.5">
              <select
                value={warehouseId}
                onChange={e => setWarehouseId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Barang yang Masuk <span className="text-red-500">*</span>
            </label>
            <div className="clay-search-pill px-3.5 py-1.5">
              <select
                value={productId}
                onChange={e => setProductId(e.target.value)}
                className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>
            {selectedProd && (
              <p className="mt-1.5 text-[11px] text-slate-500 font-medium pl-1">
                Kemasan: {selectedProd.packSize} · Satuan: {selectedProd.unit}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Qty Masuk ({selectedProd?.unit || 'ctn'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value, 10)))}
                placeholder="Contoh: 1000"
                className="w-full px-4 py-2 border border-slate-300 rounded-full text-sm font-black focus:outline-blue-600 bg-slate-50 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                No. Bukti / Dokumen Pabrik
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={e => setRefNumber(e.target.value)}
                placeholder="Contoh: BPB-2026/10/08"
                className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs font-medium focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Catatan / Batch Produksi
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: Hasil packing shift 1, Exp date Sept 2027"
              className="w-full px-4 py-2 border border-slate-300 rounded-2xl text-xs font-medium focus:outline-blue-600"
            />
          </div>

          {/* Side-by-side Cancel and Apply Buttons */}
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
              disabled={!qty || Number(qty) <= 0}
              className="clay-btn-emerald py-2.5 text-xs text-center cursor-pointer font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
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
