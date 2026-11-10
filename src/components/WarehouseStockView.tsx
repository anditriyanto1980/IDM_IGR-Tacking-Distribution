import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse } from '../types';
import { formatNumber } from '../utils/formatters';
import { WarehouseModal } from './WarehouseModal';
import { 
  Warehouse as WarehouseIcon, 
  ArrowDownRight, 
  ArrowUpRight, 
  History, 
  SlidersHorizontal,
  Plus,
  Check,
  X,
  Edit,
  Trash2,
  Building2,
  Sparkles,
  AlertCircle,
  Search,
  RotateCcw,
  Calendar,
  Filter
} from 'lucide-react';
import { ClayWarehouse } from './ClayIcons';

interface WarehouseStockViewProps {
  onOpenStockInModal: (warehouseId?: string, productId?: string) => void;
}

export const WarehouseStockView: React.FC<WarehouseStockViewProps> = ({
  onOpenStockInModal
}) => {
  const { warehouses, products, stocks, mutations, adjustStock, deleteWarehouse } = useApp();

  // Warehouse list filters
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState<'ALL' | 'MAIN' | 'BRANCH'>('ALL');

  // Mutation log filters
  const [activeWhId, setActiveWhId] = useState<string>('ALL');
  const [mutationSearch, setMutationSearch] = useState('');
  const [mutationTypeFilter, setMutationTypeFilter] = useState<string>('ALL');
  const [mutationProdId, setMutationProdId] = useState<string>('ALL');
  const [mutationDateFrom, setMutationDateFrom] = useState('');
  const [mutationDateTo, setMutationDateTo] = useState('');

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [adjustWhId, setAdjustWhId] = useState(warehouses[0]?.id || '');
  const [adjustProdId, setAdjustProdId] = useState(products[0]?.id || '');
  const [adjustNewQty, setAdjustNewQty] = useState<number | ''>('');
  const [adjustNotes, setAdjustNotes] = useState('');

  // Warehouse Add & Edit Modal State
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [selectedWarehouseForEdit, setSelectedWarehouseForEdit] = useState<Warehouse | null>(null);

  const handleOpenCreateWh = () => {
    setSelectedWarehouseForEdit(null);
    setWarehouseModalOpen(true);
  };

  const handleOpenEditWh = (wh: Warehouse) => {
    setSelectedWarehouseForEdit(wh);
    setWarehouseModalOpen(true);
  };

  const handleDeleteWh = (wh: Warehouse) => {
    if (window.confirm(`Yakin ingin menghapus data gudang "${wh.name}" (${wh.code})?`)) {
      const res = deleteWarehouse(wh.id);
      if (!res.success) {
        alert(res.message || 'Gagal menghapus gudang.');
      }
    }
  };

  // Handle Opname Adjustment
  const handleOpenAdjust = (whId: string, prodId: string) => {
    setAdjustWhId(whId);
    setAdjustProdId(prodId);
    const curr = stocks.find(s => s.warehouseId === whId && s.productId === prodId)?.qty || 0;
    setAdjustNewQty(curr);
    setAdjustNotes('');
    setAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustWhId || !adjustProdId || adjustNewQty === '') return;
    adjustStock(adjustWhId, adjustProdId, Number(adjustNewQty), adjustNotes || 'Penyesuaian stok fisik opname');
    setAdjustModalOpen(false);
  };

  // Filtered warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(wh => {
      if (warehouseTypeFilter === 'MAIN' && !wh.isMain) return false;
      if (warehouseTypeFilter === 'BRANCH' && wh.isMain) return false;

      if (warehouseSearch.trim()) {
        const q = warehouseSearch.toLowerCase();
        const mName = wh.name.toLowerCase().includes(q);
        const mCode = wh.code.toLowerCase().includes(q);
        const mLoc = wh.location.toLowerCase().includes(q);
        if (!mName && !mCode && !mLoc) return false;
      }
      return true;
    });
  }, [warehouses, warehouseTypeFilter, warehouseSearch]);

  const isWarehouseFilterActive = Boolean(warehouseSearch.trim() || warehouseTypeFilter !== 'ALL');

  // Filtered mutations
  const filteredMutations = useMemo(() => {
    return mutations.filter(m => {
      if (activeWhId !== 'ALL' && m.warehouseId !== activeWhId) return false;
      if (mutationTypeFilter !== 'ALL' && m.type !== mutationTypeFilter) return false;
      if (mutationProdId !== 'ALL' && m.productId !== mutationProdId) return false;

      if (mutationDateFrom && m.timestamp.split(' ')[0] < mutationDateFrom) return false;
      if (mutationDateTo && m.timestamp.split(' ')[0] > mutationDateTo) return false;

      if (mutationSearch.trim()) {
        const q = mutationSearch.toLowerCase();
        const prod = products.find(p => p.id === m.productId)?.name.toLowerCase() || '';
        const wh = warehouses.find(w => w.id === m.warehouseId)?.name.toLowerCase() || '';
        const ref = m.referenceNumber.toLowerCase();
        const notes = m.notes.toLowerCase();
        if (!ref.includes(q) && !notes.includes(q) && !prod.includes(q) && !wh.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [mutations, activeWhId, mutationTypeFilter, mutationProdId, mutationDateFrom, mutationDateTo, mutationSearch, products, warehouses]);

  const isMutationFilterActive = Boolean(
    activeWhId !== 'ALL' ||
    mutationTypeFilter !== 'ALL' ||
    mutationProdId !== 'ALL' ||
    mutationDateFrom ||
    mutationDateTo ||
    mutationSearch.trim()
  );

  const handleResetMutationFilters = () => {
    setActiveWhId('ALL');
    setMutationTypeFilter('ALL');
    setMutationProdId('ALL');
    setMutationDateFrom('');
    setMutationDateTo('');
    setMutationSearch('');
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            Manajemen & Saldo Stok Gudang
          </h1>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
            Monitoring ketersediaan barang di setiap gudang, mutasi pengiriman, dan penerimaan stok baru
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateWh}
            className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Tambah titik gudang atau pabrik baru"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Gudang Baru</span>
          </button>

          <button
            onClick={() => onOpenStockInModal()}
            className="clay-btn-emerald px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Penerimaan Stok Masuk</span>
          </button>
        </div>
      </div>

      {/* Warehouse Filter Bar */}
      <div className="clay-glass-card p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 w-full">
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5 flex-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={warehouseSearch}
              onChange={e => setWarehouseSearch(e.target.value)}
              placeholder="Filter gudang berdasarkan nama, kode, atau alamat..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          <div className="clay-search-pill px-3 py-1.5 shrink-0">
            <select
              value={warehouseTypeFilter}
              onChange={e => setWarehouseTypeFilter(e.target.value as any)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jenis Fasilitas ({warehouses.length})</option>
              <option value="MAIN">Hanya Pabrik Utama</option>
              <option value="BRANCH">Gudang Cabang / Penyangga</option>
            </select>
          </div>
        </div>

        {isWarehouseFilterActive && (
          <button
            onClick={() => {
              setWarehouseSearch('');
              setWarehouseTypeFilter('ALL');
            }}
            className="clay-btn-white px-3 py-1 text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Warehouse Stock Matrix Cards (Frosted Glass with White Clay Chips) */}
      {filteredWarehouses.length === 0 ? (
        <div className="clay-glass-card p-8 text-center space-y-2">
          <WarehouseIcon className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="font-bold text-slate-700 text-sm">Tidak ada gudang yang cocok</h4>
          <p className="text-xs text-slate-400">Silakan sesuaikan kata kunci pencarian atau tipe gudang.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filteredWarehouses.map(wh => {
            const whStocks = stocks.filter(s => s.warehouseId === wh.id);
            const totalUnitsInWh = whStocks.reduce((sum, s) => sum + s.qty, 0);

            return (
              <div
                key={wh.id}
                className="clay-glass-card p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-white/60 pb-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-md flex items-center justify-center font-bold border border-white shrink-0">
                        <WarehouseIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-bold text-slate-900 text-sm leading-tight">{wh.name}</h2>
                          {wh.isMain && (
                            <span className="text-[10px] uppercase font-bold text-blue-800 bg-white border border-white px-2 py-0.5 rounded-full shadow-xs">
                              Utama
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono font-semibold">{wh.code}</span>
                      </div>
                    </div>

                    {/* Actions: Edit & Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditWh(wh)}
                        className="p-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-blue-600 shadow-xs border border-white/80 transition-all cursor-pointer"
                        title="Edit Informasi Gudang"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteWh(wh)}
                        className="p-1.5 rounded-xl bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 shadow-xs border border-white/80 transition-all cursor-pointer"
                        title="Hapus Gudang"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 font-medium mt-2">{wh.location}</p>

                  {/* Products Stock in this Warehouse */}
                  <div className="mt-4 space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Ketersediaan per Barang
                    </span>
                    {products.map(prod => {
                      const entry = whStocks.find(s => s.productId === prod.id);
                      const qty = entry ? entry.qty : 0;
                      const isLow = qty <= prod.minStockAlert;

                      return (
                        <div
                          key={prod.id}
                          className="clay-chip-white p-3 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-xs">{prod.name}</div>
                            <span className="text-[11px] text-slate-500 font-mono font-semibold">{prod.sku}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="text-right">
                              <div className={`font-black text-sm ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                                {formatNumber(qty)}
                              </div>
                              <span className="text-[10px] text-slate-500 font-medium">{prod.unit}</span>
                            </div>
                            <button
                              onClick={() => handleOpenAdjust(wh.id, prod.id)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                              title="Koreksi Stok Opname"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-4 pt-3.5 border-t border-white/60 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">
                    Total Fisik: <strong className="text-slate-900 font-bold">{formatNumber(totalUnitsInWh)}</strong> ctn
                  </span>
                  <button
                    onClick={() => onOpenStockInModal(wh.id)}
                    className="clay-btn-white px-3 py-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Stok Masuk
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stock Mutation Log (Clay Table Sheet) */}
      <div className="clay-table-sheet overflow-hidden space-y-3 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">
                Kartu Mutasi & Riwayat Keluar-Masuk Gudang
              </h2>
              <p className="text-[11px] text-slate-500">
                Audit trail seluruh perpindahan stok pengiriman SO dan penerimaan pabrik
              </p>
            </div>
          </div>
        </div>

        {/* Mutation Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Search Input */}
          <div className="relative clay-search-pill flex items-center px-3 py-1.5">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={mutationSearch}
              onChange={e => setMutationSearch(e.target.value)}
              placeholder="Cari No SO, referensi, catatan..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Warehouse Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={activeWhId}
              onChange={e => setActiveWhId(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Gudang</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Mutation Type Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={mutationTypeFilter}
              onChange={e => setMutationTypeFilter(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jenis Mutasi</option>
              <option value="IN_RECEIPT">Penerimaan Pabrik (+ Masuk)</option>
              <option value="OUT_SHIPMENT">Pengiriman SO (- Keluar)</option>
              <option value="ADJUSTMENT">Koreksi Opname Fisik</option>
              <option value="VOID_SHIPMENT">Pembatalan Surat Jalan</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={mutationProdId}
              onChange={e => setMutationProdId(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Barang</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter & Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-500">Rentang Tanggal:</span>
              <div className="clay-search-pill px-2.5 py-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <input
                  type="date"
                  value={mutationDateFrom}
                  onChange={e => setMutationDateFrom(e.target.value)}
                  className="text-[11px] font-semibold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-slate-400">-</span>
              <div className="clay-search-pill px-2.5 py-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <input
                  type="date"
                  value={mutationDateTo}
                  onChange={e => setMutationDateTo(e.target.value)}
                  className="text-[11px] font-semibold text-slate-800 bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <span className="text-slate-500 font-medium">
              ({filteredMutations.length} mutasi)
            </span>
          </div>

          {isMutationFilterActive && (
            <button
              onClick={handleResetMutationFilters}
              className="clay-btn-white px-3 py-1 text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filter Mutasi</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Waktu</th>
                <th className="py-3 px-3.5">Jenis Mutasi</th>
                <th className="py-3 px-3.5">Gudang</th>
                <th className="py-3 px-3.5">Nama Barang</th>
                <th className="py-3 px-3.5">No. Referensi / SO</th>
                <th className="py-3 px-3.5 text-right">Perubahan Qty</th>
                <th className="py-3 px-3.5 text-right">Saldo Akhir</th>
                <th className="py-3 px-3.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMutations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                    Belum ada riwayat mutasi stok.
                  </td>
                </tr>
              ) : (
                filteredMutations.map(m => {
                  const wh = warehouses.find(w => w.id === m.warehouseId);
                  const prod = products.find(p => p.id === m.productId);
                  const isNegative = m.qtyChange < 0;

                  return (
                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-mono text-slate-500 whitespace-nowrap font-medium">
                        {m.timestamp}
                      </td>
                      <td className="py-2.5 px-3.5">
                        {m.type === 'OUT_SHIPMENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-red-700 font-bold bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                            Kirim ke DC
                          </span>
                        )}
                        {m.type === 'IN_RECEIPT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                            Penerimaan Pabrik
                          </span>
                        )}
                        {m.type === 'VOID_SHIPMENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                            <Check className="w-3.5 h-3.5 text-blue-500 stroke-[3]" />
                            Pembatalan SO
                          </span>
                        )}
                        {m.type === 'ADJUSTMENT' && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-purple-500" />
                            Penyesuaian Opname
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-800">
                        {wh?.name || '-'}
                      </td>
                      <td className="py-2.5 px-3.5 font-bold text-slate-900">
                        {prod?.name || '-'}
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-slate-700 font-bold">
                        {m.referenceNumber}
                      </td>
                      <td className={`py-2.5 px-3.5 text-right font-black ${isNegative ? 'text-red-700' : 'text-emerald-700'}`}>
                        {isNegative ? '' : '+'}{formatNumber(m.qtyChange)} {prod?.unit || 'ctn'}
                      </td>
                      <td className="py-2.5 px-3.5 text-right font-bold text-slate-900 font-mono">
                        {formatNumber(m.resultingQty)}
                      </td>
                      <td className="py-2.5 px-3.5 text-slate-600 text-[11px] font-medium">
                        {m.notes}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Adjust Stock (Light Sky-Blue 3D Clay with Drag Handle & Apply/Cancel Buttons) */}
      {adjustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Handle Tab Indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
            </div>

            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Koreksi Stok Fisik (Stock Opname)
              </h2>
              <button
                onClick={() => setAdjustModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gudang
                </label>
                <select
                  disabled
                  value={adjustWhId}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Barang
                </label>
                <select
                  disabled
                  value={adjustProdId}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-full text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Stok Fisik Baru (Hasil Opname) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={adjustNewQty}
                  onChange={e => setAdjustNewQty(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                  className="w-full px-4 py-2 border border-slate-300 rounded-full text-sm focus:outline-blue-600 font-black bg-slate-50 shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={e => setAdjustNotes(e.target.value)}
                  placeholder="Contoh: Selisih opname akhir bulan / barang reject"
                  className="w-full px-4 py-2 border border-slate-300 rounded-full text-xs focus:outline-blue-600 font-medium"
                />
              </div>

              {/* Side-by-side Cancel and Apply Buttons */}
              <div className="pt-3 grid grid-cols-2 gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModalOpen(false)}
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
      )}

      {/* Warehouse Create / Edit Modal */}
      <WarehouseModal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        editWarehouse={selectedWarehouseForEdit}
      />
    </div>
  );
};
