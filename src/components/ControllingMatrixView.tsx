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
  RotateCcw,
  ArrowUpDown,
  Globe
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
  const [forecastQtyFilter, setForecastQtyFilter] = useState<'ALL' | 'TIER_HIGH' | 'TIER_MED' | 'TIER_LOW' | 'TIER_ZERO'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'REGION_FORECAST_DESC' | 'REGION_FORECAST_ASC' | 'FORECAST_DESC' | 'FORECAST_ASC' | 'PCT_ASC' | 'PCT_DESC' | 'REMAINING_DESC' | 'DC_NAME' | 'PROD_NAME'>('DEFAULT');

  // Regional ranking sort mode
  const [regionRankingSort, setRegionRankingSort] = useState<'DESC' | 'ASC'>('DESC');

  // Extract regions
  const regions = useMemo(() => Array.from(new Set(dcs.map(d => d.region))), [dcs]);

  // Regional Aggregates for Quick Regional Ranking & Filtering
  const regionalForecastRanking = useMemo(() => {
    const map: Record<string, { forecast: number; sent: number; dcCount: Set<string> }> = {};
    controllingSummaries.forEach(item => {
      const reg = item.dc.region;
      if (!map[reg]) {
        map[reg] = { forecast: 0, sent: 0, dcCount: new Set() };
      }
      map[reg].forecast += item.forecastQty;
      map[reg].sent += item.sentQty;
      map[reg].dcCount.add(item.dc.id);
    });

    const arr = Object.entries(map).map(([region, data]) => ({
      region,
      forecast: data.forecast,
      sent: data.sent,
      pct: data.forecast > 0 ? (data.sent / data.forecast) * 100 : 0,
      dcCount: data.dcCount.size
    }));

    if (regionRankingSort === 'DESC') {
      arr.sort((a, b) => b.forecast - a.forecast);
    } else {
      arr.sort((a, b) => a.forecast - b.forecast);
    }
    return arr;
  }, [controllingSummaries, regionRankingSort]);

  // Region forecast totals map for region-based sorting
  const regionTotalsMap = useMemo(() => {
    const map: Record<string, number> = {};
    controllingSummaries.forEach(s => {
      map[s.dc.region] = (map[s.dc.region] || 0) + s.forecastQty;
    });
    return map;
  }, [controllingSummaries]);

  // Filtered and sorted list
  const filteredSummaries = useMemo(() => {
    const list = controllingSummaries.filter(item => {
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

      // Forecast Qty Filter
      if (forecastQtyFilter !== 'ALL') {
        if (forecastQtyFilter === 'TIER_HIGH' && item.forecastQty < 5000) return false;
        if (forecastQtyFilter === 'TIER_MED' && (item.forecastQty < 1000 || item.forecastQty >= 5000)) return false;
        if (forecastQtyFilter === 'TIER_LOW' && (item.forecastQty <= 0 || item.forecastQty >= 1000)) return false;
        if (forecastQtyFilter === 'TIER_ZERO' && item.forecastQty > 0) return false;
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

    // Apply sorting
    if (sortBy === 'REGION_FORECAST_DESC') {
      list.sort((a, b) => {
        const regDiff = (regionTotalsMap[b.dc.region] || 0) - (regionTotalsMap[a.dc.region] || 0);
        return regDiff !== 0 ? regDiff : b.forecastQty - a.forecastQty;
      });
    } else if (sortBy === 'REGION_FORECAST_ASC') {
      list.sort((a, b) => {
        const regDiff = (regionTotalsMap[a.dc.region] || 0) - (regionTotalsMap[b.dc.region] || 0);
        return regDiff !== 0 ? regDiff : a.forecastQty - b.forecastQty;
      });
    } else if (sortBy === 'FORECAST_DESC') {
      list.sort((a, b) => b.forecastQty - a.forecastQty);
    } else if (sortBy === 'FORECAST_ASC') {
      list.sort((a, b) => a.forecastQty - b.forecastQty);
    } else if (sortBy === 'PCT_ASC') {
      list.sort((a, b) => a.percentFulfilled - b.percentFulfilled);
    } else if (sortBy === 'PCT_DESC') {
      list.sort((a, b) => b.percentFulfilled - a.percentFulfilled);
    } else if (sortBy === 'REMAINING_DESC') {
      list.sort((a, b) => b.remainingQty - a.remainingQty);
    } else if (sortBy === 'DC_NAME') {
      list.sort((a, b) => a.dc.name.localeCompare(b.dc.name));
    } else if (sortBy === 'PROD_NAME') {
      list.sort((a, b) => a.productName.localeCompare(b.productName));
    }

    return list;
  }, [controllingSummaries, networkFilter, regionFilter, productFilter, statusFilter, forecastQtyFilter, searchTerm, sortBy, regionTotalsMap]);

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
    setForecastQtyFilter('ALL');
    setSearchTerm('');
    setSortBy('DEFAULT');
  };

  const isFilterActive =
    networkFilter !== 'ALL' ||
    regionFilter !== 'ALL' ||
    productFilter !== 'ALL' ||
    statusFilter !== 'ALL' ||
    forecastQtyFilter !== 'ALL' ||
    searchTerm.trim() !== '' ||
    sortBy !== 'DEFAULT';

  return (
    <div className="space-y-5 pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            Matriks Controlling Realisasi vs Forecast
          </h1>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
          {/* Pill Search Input */}
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

          {/* Filter Rentang Qty Forecast */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={forecastQtyFilter}
              onChange={e => setForecastQtyFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Qty Forecast</option>
              <option value="TIER_HIGH">Qty Besar (&ge; 5.000 ctn)</option>
              <option value="TIER_MED">Qty Sedang (1.000 - 4.999 ctn)</option>
              <option value="TIER_LOW">Qty Kecil (1 - 999 ctn)</option>
              <option value="TIER_ZERO">Belum Ada Target (0 ctn)</option>
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
              <option value="BELUM">Belum Ada Kirim (0%)</option>
              <option value="OVER">Melebihi Target (&gt;100%)</option>
            </select>
          </div>

          {/* Sort By Filter (Including Region Forecast & DC Forecast Qty) */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT">Urutan Default</option>
              <option value="REGION_FORECAST_DESC">🗺️ Qty Wilayah: Terbanyak &rarr; Terkecil</option>
              <option value="REGION_FORECAST_ASC">🗺️ Qty Wilayah: Terkecil &rarr; Terbanyak</option>
              <option value="FORECAST_DESC">🎯 Qty Target: Terbesar &rarr; Terkecil</option>
              <option value="FORECAST_ASC">🎯 Qty Target: Terkecil &rarr; Terbesar</option>
              <option value="PCT_ASC">⚡ Capaian Terendah (Prioritas)</option>
              <option value="PCT_DESC">🏆 Capaian Tertinggi</option>
              <option value="REMAINING_DESC">📦 Sisa Belum Kirim Terbanyak</option>
              <option value="DC_NAME">🏢 Nama DC (A-Z)</option>
              <option value="PROD_NAME">🌴 Nama Barang (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Indicator / Reset */}
        {isFilterActive && (
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

      {/* Interactive Regional Forecast Ranking Bar (Qty Terbanyak hingga Terkecil / Sebaliknya) */}
      <div className="clay-glass-card p-4 space-y-3 shadow-md border border-white/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/60 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                Peringkat Kuantiti Forecast per Wilayah
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Klik kartu wilayah untuk memfilter data langsung, atau ubah urutan kuantiti di bawah
              </p>
            </div>
          </div>

          {/* Toggle Wilayah Terbanyak vs Terkecil */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-bold text-slate-600">Urutkan:</span>
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 shadow-inner">
              <button
                onClick={() => {
                  setRegionRankingSort('DESC');
                  setSortBy('REGION_FORECAST_DESC');
                }}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  regionRankingSort === 'DESC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Urutkan dari wilayah kuantiti forecast terbanyak ke terkecil"
              >
                Terbanyak &rarr; Terkecil ↓
              </button>
              <button
                onClick={() => {
                  setRegionRankingSort('ASC');
                  setSortBy('REGION_FORECAST_ASC');
                }}
                className={`px-3 py-1 text-xs font-black rounded-lg transition-all cursor-pointer ${
                  regionRankingSort === 'ASC'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Urutkan dari wilayah kuantiti forecast terkecil ke terbanyak"
              >
                Terkecil &rarr; Terbanyak ↑
              </button>
            </div>
          </div>
        </div>

        {/* Region Cards Horizontal Rail */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          <button
            onClick={() => setRegionFilter('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
              regionFilter === 'ALL'
                ? 'bg-blue-700 text-white shadow-md'
                : 'clay-chip-white text-slate-700 hover:bg-blue-50 border border-white'
            }`}
          >
            Semua Wilayah ({formatNumber(regionalForecastRanking.reduce((sum, r) => sum + r.forecast, 0))} ctn)
          </button>
          {regionalForecastRanking.map((r, rankIdx) => {
            const isSelected = regionFilter === r.region;
            return (
              <button
                key={r.region}
                onClick={() => setRegionFilter(isSelected ? 'ALL' : r.region)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-700 text-white shadow-md'
                    : 'clay-chip-white text-slate-800 hover:bg-blue-50 border border-white'
                }`}
                title={`Filter hanya wilayah ${r.region} (Target: ${formatNumber(r.forecast)} ctn, Terkirim: ${formatNumber(r.sent)} ctn, Capaian: ${r.pct.toFixed(1)}%)`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                  isSelected ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  #{rankIdx + 1}
                </span>
                <span className="font-extrabold">{r.region}</span>
                <span className={`text-[11px] font-black px-2 py-0.5 rounded-lg ${
                  isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-800'
                }`}>
                  {formatNumber(r.forecast)} ctn
                </span>
                <span className={`text-[10px] font-extrabold ${
                  r.pct >= 100
                    ? isSelected ? 'text-emerald-200' : 'text-emerald-600'
                    : isSelected ? 'text-blue-200' : 'text-blue-600'
                }`}>
                  {r.pct.toFixed(0)}% {r.pct >= 100 && '✓'}
                </span>
              </button>
            );
          })}
        </div>
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
                    <p className="text-sm font-semibold text-slate-700">Tidak ada data yang cocok dengan kriteria filter.</p>
                    <p className="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian, jaringan, wilayah, atau status capaian.</p>
                    {isFilterActive && (
                      <button
                        onClick={handleResetFilters}
                        className="clay-btn-white text-xs px-3.5 py-1.5 mt-3 inline-flex items-center gap-1.5 text-blue-700 font-bold cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Semua Filter</span>
                      </button>
                    )}
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
