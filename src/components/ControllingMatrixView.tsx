import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber, formatPercent } from '../utils/formatters';
import { DCControllingSummary } from '../types';
import { DCModal } from './DCModal';
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Truck,
  Building2,
  RotateCcw
} from 'lucide-react';

interface ControllingMatrixViewProps {
  onOpenShipmentForDC: (dcId: string, productId: string) => void;
  initialProductId?: string;
}

export const ControllingMatrixView: React.FC<ControllingMatrixViewProps> = ({
  onOpenShipmentForDC,
  initialProductId
}) => {
  const { controllingSummaries, products, dcs, exportToCSV } = useApp();

  const [dcModalOpen, setDcModalOpen] = useState(false);
  const [networkFilter, setNetworkFilter] = useState<'ALL' | 'Indomarco' | 'Indogrosir'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [productFilter, setProductFilter] = useState<string>(initialProductId || 'ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract regions
  const regions = useMemo(() => Array.from(new Set(dcs.map(d => d.region))), [dcs]);

  // Filtered list
  const filteredSummaries = useMemo(() => {
    return controllingSummaries.filter(item => {
      // Network filter
      if (networkFilter !== 'ALL' && item.dc.network !== networkFilter) return false;

      // Region filter
      if (regionFilter !== 'ALL' && item.dc.region !== regionFilter) return false;

      // Product filter
      if (productFilter !== 'ALL' && item.productId !== productFilter) return false;

      // Status filter
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'TERCAPAI' && item.percentFulfilled < 100) return false;
        if (statusFilter === 'PROGRES' && (item.sentQty === 0 || item.percentFulfilled >= 100)) return false;
        if (statusFilter === 'BELUM' && item.sentQty > 0) return false;
        if (statusFilter === 'OVER' && item.status !== 'OVER_FORECAST') return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchDc = item.dc.name.toLowerCase().includes(query);
        const matchCode = item.dc.code.toLowerCase().includes(query);
        const matchCity = item.dc.city.toLowerCase().includes(query);
        const matchProd = item.productName.toLowerCase().includes(query);
        if (!matchDc && !matchCode && !matchCity && !matchProd) return false;
      }

      return true;
    });
  }, [controllingSummaries, networkFilter, regionFilter, productFilter, statusFilter, searchTerm]);

  // Aggregated totals for the active filtered set
  const filteredTotals = useMemo(() => {
    const totalFc = filteredSummaries.reduce((sum, i) => sum + i.forecastQty, 0);
    const totalSent = filteredSummaries.reduce((sum, i) => sum + i.sentQty, 0);
    const totalRemaining = Math.max(0, totalFc - totalSent);
    const avgPct = totalFc > 0 ? (totalSent / totalFc) * 100 : 0;
    const avgRemainingPct = Math.max(0, 100 - avgPct);

    return {
      forecast: totalFc,
      sent: totalSent,
      remaining: totalRemaining,
      fulfilledPct: avgPct,
      remainingPct: avgRemainingPct,
      count: filteredSummaries.length
    };
  }, [filteredSummaries]);

  // Export to CSV
  const handleExport = () => {
    const rows = filteredSummaries.map((item, idx) => ({
      No: idx + 1,
      Jaringan: item.dc.network,
      Kode_DC: item.dc.code,
      Nama_DC: item.dc.name,
      Kota: item.dc.city,
      Wilayah: item.dc.region,
      Kode_SKU: item.productSku,
      Nama_Barang: item.productName,
      Satuan: item.productUnit,
      Forecast_Target: item.forecastQty,
      Realisasi_Terkirim: item.sentQty,
      Sisa_Belum_Kirim: item.remainingQty,
      Persen_Terkirim: `${item.percentFulfilled.toFixed(1)}%`,
      Persen_Belum_Kirim: `${item.percentRemaining.toFixed(1)}%`,
      Status_Capaian: item.status
    }));

    exportToCSV(`Controlling_Distribusi_DC_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleResetFilters = () => {
    setNetworkFilter('ALL');
    setRegionFilter('ALL');
    setProductFilter('ALL');
    setStatusFilter('ALL');
    setSearchTerm('');
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Matriks Controlling Realisasi vs Forecast
          </h1>
          <p className="text-xs text-slate-600 font-semibold mt-0.5">
            Evaluasi persentase capaian pengiriman ke DC Indomarco & Indogrosir per wilayah dan produk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setDcModalOpen(true)}
            className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Tambah titik DC baru ke sistem"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Tambah DC & Wilayah</span>
          </button>

          <button
            onClick={handleExport}
            className="clay-btn-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar (Pill Search + Glass Card) */}
      <div className="clay-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Pill Search Input (Matching the 'Dharts fied  v' bar in reference!) */}
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari DC, kota, barang..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Network Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={networkFilter}
              onChange={e => setNetworkFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jaringan DC</option>
              <option value="Indomarco">DC Indomarco</option>
              <option value="Indogrosir">DC Indogrosir</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={regionFilter}
              onChange={e => setRegionFilter(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Wilayah</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Barang</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status Capaian</option>
              <option value="TERCAPAI">Tercapai 100%</option>
              <option value="PROGRES">Sedang Berjalan (&gt;0% &lt;100%)</option>
              <option value="BELUM">Belum Ada Pengiriman (0%)</option>
              <option value="OVER">Melebihi Forecast (&gt;100%)</option>
            </select>
          </div>
        </div>

        {/* Filter Indicator / Reset */}
        {(networkFilter !== 'ALL' || regionFilter !== 'ALL' || productFilter !== 'ALL' || statusFilter !== 'ALL' || searchTerm) && (
          <div className="flex items-center justify-between pt-2 border-t border-white/60 text-xs font-semibold text-slate-700">
            <span>
              Menampilkan <strong>{filteredSummaries.length}</strong> data terfilter
            </span>
            <button
              onClick={handleResetFilters}
              className="clay-btn-white px-3 py-1 text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Aggregate Banner for Filtered Results (3D Clay Blue Card) */}
      <div className="clay-chip-blue p-5 text-white">
        <div className="text-xs uppercase tracking-wider text-blue-100 font-bold mb-3">
          Ringkasan Akumulasi Realisasi (Sesuai Filter Aktif)
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <span className="text-[11px] text-blue-100 block font-medium">Total Forecast:</span>
            <span className="text-lg sm:text-xl font-black text-white">
              {formatNumber(filteredTotals.forecast)} <span className="text-xs font-normal text-blue-200">ctn</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-emerald-200 block font-medium">Realisasi Terkirim:</span>
            <span className="text-lg sm:text-xl font-black text-white">
              {formatNumber(filteredTotals.sent)} <span className="text-xs font-normal text-blue-200">ctn</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-amber-200 block font-medium">Sisa Belum Kirim:</span>
            <span className="text-lg sm:text-xl font-black text-white">
              {formatNumber(filteredTotals.remaining)} <span className="text-xs font-normal text-blue-200">ctn</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-blue-100 block font-medium">% Realisasi Terkirim:</span>
            <span className="text-lg sm:text-xl font-black text-white">
              {formatPercent(filteredTotals.fulfilledPct)}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-blue-100 block font-medium">% Belum Terkirim:</span>
            <span className="text-lg sm:text-xl font-black text-blue-100">
              {formatPercent(filteredTotals.remainingPct)}
            </span>
          </div>
        </div>
      </div>

      {/* Controlling Table (White 3D Clay Sheet) */}
      <div className="clay-table-sheet overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3.5 text-center w-10">No</th>
                <th className="py-3.5 px-3.5">Jaringan & DC Tujuan</th>
                <th className="py-3.5 px-3.5">Wilayah & Kota</th>
                <th className="py-3.5 px-3.5">Nama Barang</th>
                <th className="py-3.5 px-3.5 text-right">Target Forecast</th>
                <th className="py-3.5 px-3.5 text-right text-emerald-700">Terkirim</th>
                <th className="py-3.5 px-3.5 text-right text-amber-700">Sisa Belum</th>
                <th className="py-3.5 px-3.5 text-center w-36">Progres & % Terkirim</th>
                <th className="py-3.5 px-3.5 text-right">% Belum</th>
                <th className="py-3.5 px-3.5 text-center">Status</th>
                <th className="py-3.5 px-3.5 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-500 font-medium">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Tidak ada data DC atau pengiriman yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((item, index) => {
                  const is100 = item.percentFulfilled >= 100;
                  const isOver = item.status === 'OVER_FORECAST';
                  const isZero = item.sentQty === 0;

                  return (
                    <tr
                      key={`${item.dc.id}-${item.productId}`}
                      className="hover:bg-blue-50/40 transition-colors"
                    >
                      <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-medium">
                        {index + 1}
                      </td>

                      {/* Jaringan & DC */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${item.dc.network === 'Indomarco' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                          <span className="font-bold text-slate-900">{item.dc.name}</span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono font-medium">
                          {item.dc.network} · {item.dc.code}
                        </span>
                      </td>

                      {/* Wilayah & Kota */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800">{item.dc.region}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{item.dc.city}</div>
                      </td>

                      {/* Barang */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{item.productName}</div>
                        <div className="text-[11px] text-slate-500 font-mono font-medium">{item.productSku}</div>
                      </td>

                      {/* Forecast */}
                      <td className="py-3 px-3.5 text-right font-bold text-slate-900">
                        {formatNumber(item.forecastQty)}
                      </td>

                      {/* Terkirim */}
                      <td className="py-3 px-3.5 text-right font-black text-emerald-700">
                        {formatNumber(item.sentQty)}
                      </td>

                      {/* Sisa Belum */}
                      <td className="py-3 px-3.5 text-right font-black text-amber-700">
                        {formatNumber(item.remainingQty)}
                      </td>

                      {/* % Terkirim & Progress bar */}
                      <td className="py-3 px-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-slate-800">
                              {formatPercent(item.percentFulfilled)}
                            </span>
                            <span className="text-slate-500 text-[10px] font-medium">
                              {formatNumber(item.sentQty)}/{formatNumber(item.forecastQty)}
                            </span>
                          </div>
                          <div className="w-full clay-tray h-2 p-0.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isOver
                                  ? 'bg-purple-600'
                                  : is100
                                  ? 'bg-emerald-500'
                                  : isZero
                                  ? 'bg-transparent'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, item.percentFulfilled)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* % Belum Terkirim */}
                      <td className="py-3 px-3.5 text-right font-bold text-slate-600">
                        {formatPercent(item.percentRemaining)}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 text-center">
                        {isOver ? (
                          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            Over Target
                          </span>
                        ) : is100 ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Tuntas
                          </span>
                        ) : isZero ? (
                          <span className="text-[11px] font-medium text-slate-400">
                            Belum Ada
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-600" /> Progres
                          </span>
                        )}
                      </td>

                      {/* Aksi (Tactile Pill Button) */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => onOpenShipmentForDC(item.dc.id, item.productId)}
                          className="clay-btn-apply px-3 py-1 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs"
                          title="Buat Surat Jalan pengiriman untuk DC & barang ini"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Kirim</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add DC */}
      <DCModal
        isOpen={dcModalOpen}
        onClose={() => setDcModalOpen(false)}
      />
    </div>
  );
};
