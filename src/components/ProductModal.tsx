import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { X, Package, Check, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  editProduct
}) => {
  const { addProduct, updateProduct } = useApp();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [unit, setUnit] = useState('Karton (Ctn)');
  const [packSize, setPackSize] = useState('');
  const [minStockAlert, setMinStockAlert] = useState<number | ''>(1000);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editProduct) {
      setName(editProduct.name);
      setSku(editProduct.sku);
      setUnit(editProduct.unit);
      setPackSize(editProduct.packSize);
      setMinStockAlert(editProduct.minStockAlert);
      setDescription(editProduct.description || '');
    } else {
      setName('');
      setSku('');
      setUnit('Karton (Ctn)');
      setPackSize('24 x 250g');
      setMinStockAlert(1000);
      setDescription('');
    }
    setError('');
  }, [isOpen, editProduct]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama barang wajib diisi');
      return;
    }
    if (!sku.trim()) {
      setError('Kode / SKU barang wajib diisi');
      return;
    }

    if (editProduct) {
      updateProduct(editProduct.id, {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        unit: unit.trim(),
        packSize: packSize.trim(),
        minStockAlert: Number(minStockAlert) || 0,
        description: description.trim()
      });
    } else {
      addProduct({
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        unit: unit.trim(),
        packSize: packSize.trim(),
        minStockAlert: Number(minStockAlert) || 0,
        description: description.trim()
      });
    }

    onClose();
  };

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
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editProduct ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Kelola master produk, SKU, dan spesifikasi kemasan
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Contoh: Akram Khalas 200g"
              className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs font-bold focus:outline-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kode / SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="Contoh: AKR-200G"
                className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs font-bold focus:outline-blue-600 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Satuan Distribusi
              </label>
              <div className="clay-search-pill px-3 py-1.5">
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="Karton (Ctn)">Karton (Ctn)</option>
                  <option value="Pcs / Pouch">Pcs / Pouch</option>
                  <option value="Box">Box</option>
                  <option value="Pack">Pack</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Isi Kemasan per Karton
              </label>
              <input
                type="text"
                value={packSize}
                onChange={e => setPackSize(e.target.value)}
                placeholder="Contoh: 24 pouch x 200g"
                className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs font-medium focus:outline-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Batas Minimum Stok Alert
              </label>
              <input
                type="number"
                min="0"
                value={minStockAlert}
                onChange={e => setMinStockAlert(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Contoh: 1000"
                className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs font-bold focus:outline-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Deskripsi Barang
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Keterangan varian, spesifikasi, atau catatan penting..."
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
