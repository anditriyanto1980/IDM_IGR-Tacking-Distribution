import React, { useState, useMemo } from 'react';
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
  Warehouse as WarehouseIcon,
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { ClayKurmaPackage } from './ClayIcons';

export const ProductMasterView: React.FC = () => {
  const { products, controllingSummaries, deleteProduct, getTotalStock } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'SAFE' | 'LOW' | 'OUT'>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'ALL' | 'ACHIEVED' | 'PROGRESS' | 'CRITICAL'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'STOCK_DESC' | 'STOCK_ASC' | 'FULFILL_DESC' | 'FULFILL_ASC'>('NAME_ASC');

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

  const isFilterActive = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      stockStatusFilter !== 'ALL' ||
      fulfillmentFilter !== 'ALL' ||
      sortBy !== 'NAME_ASC'
    );
  }, [searchQuery, stockStatusFilter, fulfillmentFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStockStatusFilter('ALL');
    setFulfillmentFilter('ALL');
    setSortBy('NAME_ASC');
  };

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .map(prod => {
        const totalStock = getTotalStock(prod.id);
        const pSummaries = controllingSummaries.filter(s => s.productId === prod.id);
        const totalForecast = pSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
        const totalSent = pSummaries.reduce((sum, s) => sum + s.sentQty, 0);
        const fulfillmentPct = totalForecast > 0 ? (totalSent / totalForecast) * 100 : 0;
        const isLow = totalStock <= prod.minStockAlert;
        const isOut = totalStock <= 0;

        return {
          prod,
          totalStock,
          totalForecast,
          totalSent,
          fulfillmentPct,
          isLow,
          isOut
        };
      })
      .filter(item => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            item.prod.name.toLowerCase().includes(q) ||
            item.prod.sku.toLowerCase().includes(q) ||
            item.prod.packSize.toLowerCase().includes(q) ||
            (item.prod.description || '').toLowerCase().includes(q);
          if (!match) return false;
        }

        // Stock Status
        if (stockStatusFilter === 'SAFE' && (item.isLow || item.isOut)) return false;
        if (stockStatusFilter === 'LOW' && (!item.isLow || item.isOut)) return false;
        if (stockStatusFilter === 'OUT' && !item.isOut) return false;

        // Fulfillment
        if (fulfillmentFilter === 'ACHIEVED' && item.fulfillmentPct < 100) return false;
        if (fulfillmentFilter === 'PROGRESS' && (item.fulfillmentPct < 50 || item.fulfillmentPct >= 100)) return false;
        if (fulfillmentFilter === 'CRITICAL' && item.fulfillmentPct >= 50) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'NAME_ASC') return a.prod.name.localeCompare(b.prod.name);
        if (sortBy === 'STOCK_DESC') return b.totalStock - a.totalStock;
        if (sortBy === 'STOCK_ASC') return a.totalStock - b.totalStock;
        if (sortBy === 'FULFILL_DESC') return b.fulfillmentPct - a.fulfillmentPct;
        if (sortBy === 'FULFILL_ASC') return a.fulfillmentPct - b.fulfillmentPct;
        return 0;
      });
  }, [products, controllingSummaries, getTotalStock, searchQuery, stockStatusFilter, fulfillmentFilter, sortBy]);

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            Master Data Barang
          </h1>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
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

      {/* Filter and Search Toolbar */}
      <div className="clay-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari nama kurma, SKU, isi kemasan..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Stock Status Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={stockStatusFilter}
              onChange={e => setStockStatusFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kondisi Stok</option>
              <option value="SAFE">Stok Aman (&gt; Batas Minimum)</option>
              <option value="LOW">Stok Menipis (&le; Batas Minimum)</option>
              <option value="OUT">Stok Habis / Kosong (0 Ctn)</option>
            </select>
          </div>

          {/* Fulfillment Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={fulfillmentFilter}
              onChange={e => setFulfillmentFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Capaian Suplai</option>
              <option value="ACHIEVED">Tercapai (&ge; 100%)</option>
              <option value="PROGRESS">Sedang Berjalan (50% - 99%)</option>
              <option value="CRITICAL">Kritis (&lt; 50%)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="NAME_ASC">Urutkan: Nama Barang (A - Z)</option>
              <option value="STOCK_DESC">Urutkan: Stok Fisik Terbanyak</option>
              <option value="STOCK_ASC">Urutkan: Stok Fisik Tersedikit</option>
              <option value="FULFILL_DESC">Urutkan: Capaian % Tertinggi</option>
              <option value="FULFILL_ASC">Urutkan: Capaian % Terendah</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-semibold">
              Menampilkan <strong>{filteredProducts.length}</strong> dari <strong>{products.length}</strong> produk
            </span>
            {isFilterActive && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                Filter Aktif
              </span>
            )}
          </div>

          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="clay-btn-white px-3 py-1 text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Cards Grid (3D Clay Cards) */}
      {filteredProducts.length === 0 ? (
        <div className="clay-glass-card p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada produk yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ditemukan barang kurma yang sesuai dengan kata kunci atau filter status yang dipilih.
          </p>
          <button
            onClick={handleResetFilters}
            className="clay-btn-apply px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Filter</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredProducts.map(({ prod, totalStock, totalForecast, totalSent, fulfillmentPct }, idx) => {
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
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editProduct={editingProduct}
      />
    </div>
  );
};
