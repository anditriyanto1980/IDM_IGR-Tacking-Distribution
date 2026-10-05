import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { formatNumber } from '../utils/formatters';
import { ProductModal } from './ProductModal';
import { 
  Package, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  Warehouse as WarehouseIcon
} from 'lucide-react';
import { ClayKurmaPackage } from './ClayIcons';

export const ProductMasterView: React.FC = () => {
  const { products, controllingSummaries, deleteProduct, getTotalStock } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`Yakin ingin menghapus produk "${p.name}"?`)) {
      const res = deleteProduct(p.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Master Data Barang
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Kelola daftar barang kurma, SKU, spesifikasi kemasan, serta pantau total alokasi dan stok
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Barang Baru</span>
        </button>
      </div>

      {/* Product Cards Grid (3D Clay Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((prod, idx) => {
          const totalStock = getTotalStock(prod.id);
          const pSummaries = controllingSummaries.filter(s => s.productId === prod.id);
          const totalForecast = pSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
          const totalSent = pSummaries.reduce((sum, s) => sum + s.sentQty, 0);
          const fulfillmentPct = totalForecast > 0 ? (totalSent / totalForecast) * 100 : 0;

          return (
            <div
              key={prod.id}
              className="clay-glass-card p-5 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/60 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-white shadow-xs border border-white text-blue-700 font-black text-xs flex items-center justify-center font-mono">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-xs font-bold text-blue-800 bg-white border border-white px-2.5 py-0.5 rounded-full shadow-xs">
                      {prod.sku}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(prod)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-white rounded-full transition-colors cursor-pointer"
                      title="Edit Data Barang"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(prod)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-full transition-colors cursor-pointer"
                      title="Hapus Barang"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title & info */}
                <div className="mt-3.5 flex items-start gap-3">
                  <div className="p-2 rounded-2xl bg-white shadow-sm border border-white shrink-0">
                    <ClayKurmaPackage size={44} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 leading-snug">{prod.name}</h3>
                    <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed">
                      {prod.description || 'Tidak ada deskripsi produk.'}
                    </p>
                  </div>
                </div>

                {/* Packaging specs inside white clay chip */}
                <div className="mt-3.5 p-3 clay-chip-white space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Satuan:</span>
                    <strong className="text-slate-900 font-bold">{prod.unit}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Kemasan per Ctn:</span>
                    <strong className="text-slate-900 font-bold">{prod.packSize}</strong>
                  </div>
                  <div className="flex justify-between text-slate-600 font-medium">
                    <span>Safety Stock Min:</span>
                    <strong className="text-slate-900 font-bold">{formatNumber(prod.minStockAlert)} ctn</strong>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/60 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Stok Gudang:</span>
                    <span className="font-black text-slate-900">{formatNumber(totalStock)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block font-medium">Target FC:</span>
                    <span className="font-black text-slate-900">{formatNumber(totalForecast)}</span>
                  </div>
                  <div>
                    <span className="text-emerald-700 text-[11px] block font-medium">Terkirim:</span>
                    <span className="font-black text-emerald-700">{formatNumber(totalSent)}</span>
                  </div>
                </div>

                {/* Fulfillment progress */}
                <div className="mt-3.5">
                  <div className="flex justify-between text-[11px] mb-1 font-semibold">
                    <span className="text-slate-600">Realisasi Nasional:</span>
                    <span className="font-black text-slate-900">{fulfillmentPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full clay-tray h-2.5 p-0.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, fulfillmentPct)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editProduct={editingProduct}
      />
    </div>
  );
};
