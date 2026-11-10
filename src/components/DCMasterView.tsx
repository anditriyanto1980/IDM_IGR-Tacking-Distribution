import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { DistributionCenter, DCNetwork } from '../types';
import { DCModal } from './DCModal';
import { formatNumber } from '../utils/formatters';
import { 
  Building2, 
  MapPin, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Truck, 
  Globe, 
  Target, 
  Download,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Filter,
  ArrowUpDown
} from 'lucide-react';

interface DCMasterViewProps {
  onOpenShipmentForDC?: (dcId: string) => void;
}

export const DCMasterView: React.FC<DCMasterViewProps> = ({ onOpenShipmentForDC }) => {
  const { dcs, controllingSummaries, deleteDC, exportToCSV } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDC, setEditingDC] = useState<DistributionCenter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [networkFilter, setNetworkFilter] = useState<'ALL' | DCNetwork>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<'ALL' | 'ACHIEVED' | 'PROGRESS' | 'CRITICAL' | 'ZERO'>('ALL');
  const [forecastQtyFilter, setForecastQtyFilter] = useState<'ALL' | 'TIER_HIGH' | 'TIER_MED' | 'TIER_LOW' | 'TIER_ZERO'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'CODE_ASC' | 'REGION_TARGET_DESC' | 'REGION_TARGET_ASC' | 'TARGET_DESC' | 'TARGET_ASC' | 'PCT_DESC' | 'PCT_ASC'>('NAME_ASC');

  // All distinct regions in the DC list
  const existingRegions = useMemo(() => {
    const list = Array.from(new Set(dcs.map(d => d.region))).filter(Boolean);
    return list.sort();
  }, [dcs]);

  // Regional target totals map
  const regionTotalsMap = useMemo(() => {
    const map: Record<string, number> = {};
    controllingSummaries.forEach(s => {
      map[s.dc.region] = (map[s.dc.region] || 0) + s.forecastQty;
    });
    return map;
  }, [controllingSummaries]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      searchTerm.trim() ||
      networkFilter !== 'ALL' ||
      regionFilter !== 'ALL' ||
      fulfillmentFilter !== 'ALL' ||
      forecastQtyFilter !== 'ALL' ||
      sortBy !== 'NAME_ASC'
    );
  }, [searchTerm, networkFilter, regionFilter, fulfillmentFilter, forecastQtyFilter, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setNetworkFilter('ALL');
    setRegionFilter('ALL');
    setFulfillmentFilter('ALL');
    setForecastQtyFilter('ALL');
    setSortBy('NAME_ASC');
  };

  // Filtered DC list with fulfillment statistics and sorting
  const filteredDCs = useMemo(() => {
    return dcs
      .map(dc => {
        const summaries = controllingSummaries.filter(s => s.dc.id === dc.id);
        const totalFc = summaries.reduce((acc, s) => acc + s.forecastQty, 0);
        const totalSent = summaries.reduce((acc, s) => acc + s.sentQty, 0);
        const pct = totalFc > 0 ? (totalSent / totalFc) * 100 : 0;
        return { dc, totalFc, totalSent, pct };
      })
      .filter(({ dc, totalFc, totalSent, pct }) => {
        if (networkFilter !== 'ALL' && dc.network !== networkFilter) return false;
        if (regionFilter !== 'ALL' && dc.region !== regionFilter) return false;

        if (fulfillmentFilter === 'ACHIEVED' && pct < 100) return false;
        if (fulfillmentFilter === 'PROGRESS' && (pct < 50 || pct >= 100)) return false;
        if (fulfillmentFilter === 'CRITICAL' && (pct >= 50 || totalSent === 0)) return false;
        if (fulfillmentFilter === 'ZERO' && totalSent > 0) return false;

        // Forecast Qty Filter
        if (forecastQtyFilter !== 'ALL') {
          if (forecastQtyFilter === 'TIER_HIGH' && totalFc < 5000) return false;
          if (forecastQtyFilter === 'TIER_MED' && (totalFc < 1000 || totalFc >= 5000)) return false;
          if (forecastQtyFilter === 'TIER_LOW' && (totalFc <= 0 || totalFc >= 1000)) return false;
          if (forecastQtyFilter === 'TIER_ZERO' && totalFc > 0) return false;
        }

        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const mName = dc.name.toLowerCase().includes(q);
          const mCode = dc.code.toLowerCase().includes(q);
          const mCity = dc.city.toLowerCase().includes(q);
          const mRegion = dc.region.toLowerCase().includes(q);
          if (!mName && !mCode && !mCity && !mRegion) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'REGION_TARGET_DESC') {
          const regDiff = (regionTotalsMap[b.dc.region] || 0) - (regionTotalsMap[a.dc.region] || 0);
          return regDiff !== 0 ? regDiff : b.totalFc - a.totalFc;
        }
        if (sortBy === 'REGION_TARGET_ASC') {
          const regDiff = (regionTotalsMap[a.dc.region] || 0) - (regionTotalsMap[b.dc.region] || 0);
          return regDiff !== 0 ? regDiff : a.totalFc - b.totalFc;
        }
        if (sortBy === 'TARGET_DESC') return b.totalFc - a.totalFc;
        if (sortBy === 'TARGET_ASC') return a.totalFc - b.totalFc;
        if (sortBy === 'NAME_ASC') return a.dc.name.localeCompare(b.dc.name);
        if (sortBy === 'CODE_ASC') return a.dc.code.localeCompare(b.dc.code);
        if (sortBy === 'PCT_DESC') return b.pct - a.pct;
        if (sortBy === 'PCT_ASC') return a.pct - b.pct;
        return 0;
      })
      .map(item => item.dc);
  }, [dcs, controllingSummaries, networkFilter, regionFilter, fulfillmentFilter, forecastQtyFilter, sortBy, searchTerm, regionTotalsMap]);

  // Statistics
  const totalIDM = useMemo(() => dcs.filter(d => d.network === 'Indomarco').length, [dcs]);
  const totalIGR = useMemo(() => dcs.filter(d => d.network === 'Indogrosir').length, [dcs]);

  const handleOpenAdd = () => {
    setEditingDC(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (dc: DistributionCenter) => {
    setEditingDC(dc);
    setModalOpen(true);
  };

  const handleDelete = (dc: DistributionCenter) => {
    if (window.confirm(`Yakin ingin menghapus ${dc.name} (${dc.code}) dari daftar DC?`)) {
      const res = deleteDC(dc.id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleExportCSV = () => {
    const rows = filteredDCs.map((d, idx) => {
      const summaries = controllingSummaries.filter(s => s.dc.id === d.id);
      const totalFc = summaries.reduce((acc, s) => acc + s.forecastQty, 0);
      const totalSent = summaries.reduce((acc, s) => acc + s.sentQty, 0);
      const pct = totalFc > 0 ? (totalSent / totalFc) * 100 : 0;

      return {
        No: idx + 1,
        Kode_DC: d.code,
        Nama_DC: d.name,
        Jaringan: d.network,
        Wilayah: d.region,
        Kota: d.city,
        Alamat: d.address || '-',
        Total_Target_Forecast: totalFc,
        Total_Barang_Terkirim: totalSent,
        Persentase_Tercapai: `${pct.toFixed(1)}%`
      };
    });

    exportToCSV(`Master_DC_Wilayah_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            Master Distribution Center & Wilayah
          </h1>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
            Daftar seluruh titik hub DC Indomarco & Indogrosir, zonasi wilayah distribusi, dan status capaian suplai
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="clay-btn-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Ekspor daftar DC ke format CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah DC & Wilayah Baru</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total DC */}
        <div className="clay-glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Titik DC</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {dcs.length} <span className="text-xs font-semibold text-slate-500">Titik</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium mt-1">
            Nasional Indomarco & Indogrosir
          </div>
        </div>

        {/* Indomarco */}
        <div className="clay-glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">DC Indomarco</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          </div>
          <div className="text-2xl font-black text-blue-900 mt-2">
            {totalIDM} <span className="text-xs font-semibold text-blue-600">DC</span>
          </div>
          <div className="text-[10px] text-blue-700 font-medium mt-1">
            Jaringan Minimarket Indomaret
          </div>
        </div>

        {/* Indogrosir */}
        <div className="clay-glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">DC Indogrosir</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2">
            {totalIGR} <span className="text-xs font-semibold text-amber-600">DC</span>
          </div>
          <div className="text-[10px] text-amber-700 font-medium mt-1">
            Grosir Kulakan & Toko Mandiri
          </div>
        </div>

        {/* Total Wilayah */}
        <div className="clay-glass-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Wilayah Terdaftar</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-950 mt-2">
            {existingRegions.length} <span className="text-xs font-semibold text-emerald-700">Zona</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-medium mt-1">
            Cakupan Sabang s/d Merauke
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="clay-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5 sm:col-span-2 lg:col-span-1">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari DC, kode, kota, wilayah..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Fulfillment Status Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={fulfillmentFilter}
              onChange={e => setFulfillmentFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status Capaian Suplai</option>
              <option value="ACHIEVED">Tercapai 100% (&ge;100%)</option>
              <option value="PROGRESS">Sedang Berjalan (50% - 99%)</option>
              <option value="CRITICAL">Kritis (&lt; 50%)</option>
              <option value="ZERO">Belum Ada Pengiriman (0%)</option>
            </select>
          </div>

          {/* Forecast Qty Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={forecastQtyFilter}
              onChange={e => setForecastQtyFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kuantiti Target</option>
              <option value="TIER_HIGH">🔥 Target Besar (&ge; 5.000 ctn)</option>
              <option value="TIER_MED">⚡ Target Sedang (1.000 - 4.999 ctn)</option>
              <option value="TIER_LOW">📦 Target Kecil (1 - 999 ctn)</option>
              <option value="TIER_ZERO">Belum Ada Target (0 ctn)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="clay-search-pill px-3 py-1.5 sm:col-span-2 lg:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="REGION_TARGET_DESC">🗺️ Wilayah: Target Terbanyak &rarr; Terkecil</option>
              <option value="REGION_TARGET_ASC">🗺️ Wilayah: Target Terkecil &rarr; Terbanyak</option>
              <option value="TARGET_DESC">🎯 Target DC Terbesar &rarr; Terkecil</option>
              <option value="TARGET_ASC">🎯 Target DC Terkecil &rarr; Terbesar</option>
              <option value="PCT_DESC">🏆 Capaian % Tertinggi</option>
              <option value="PCT_ASC">⚡ Capaian % Terendah (Prioritas)</option>
              <option value="NAME_ASC">🏢 Nama DC (A - Z)</option>
              <option value="CODE_ASC">🔢 Kode DC</option>
            </select>
          </div>
        </div>

        {/* Network and Region Selector Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
          {/* Network Segmented Filter */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-full shrink-0">
            <button
              onClick={() => setNetworkFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                networkFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jaringan ({dcs.length})
            </button>
            <button
              onClick={() => setNetworkFilter('Indomarco')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                networkFilter === 'Indomarco'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indomarco ({totalIDM})
            </button>
            <button
              onClick={() => setNetworkFilter('Indogrosir')}
              className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
                networkFilter === 'Indogrosir'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indogrosir ({totalIGR})
            </button>
          </div>

          {/* Region Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1 lg:justify-end">
            <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>Wilayah:</span>
            </span>
            <button
              onClick={() => setRegionFilter('ALL')}
              className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                regionFilter === 'ALL'
                  ? 'clay-btn-apply py-1 px-3 text-white'
                  : 'clay-chip-white text-slate-700 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            {existingRegions.map(reg => {
              const count = dcs.filter(d => d.region === reg).length;
              const isSelected = regionFilter === reg;
              return (
                <button
                  key={reg}
                  onClick={() => setRegionFilter(reg)}
                  className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'clay-btn-apply py-1 px-3 text-white'
                      : 'clay-chip-white text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {reg} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-semibold">
              Menampilkan <strong>{filteredDCs.length}</strong> dari <strong>{dcs.length}</strong> titik DC
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

      {/* DC List Cards Grid */}
      {filteredDCs.length === 0 ? (
        <div className="clay-glass-card p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-500 mx-auto flex items-center justify-center">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">Tidak ada Distribution Center yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Tidak ditemukan DC yang sesuai dengan kata kunci, jaringan, wilayah, atau status capaian suplai yang dipilih.
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDCs.map(dc => {
          const summaries = controllingSummaries.filter(s => s.dc.id === dc.id);
          const totalForecast = summaries.reduce((sum, s) => sum + s.forecastQty, 0);
          const totalSent = summaries.reduce((sum, s) => sum + s.sentQty, 0);
          const fulfillmentPct = totalForecast > 0 ? (totalSent / totalForecast) * 100 : 0;
          const isFulfilled = totalForecast > 0 && totalSent >= totalForecast;

          return (
            <div
              key={dc.id}
              className="clay-glass-card p-5 flex flex-col justify-between hover:shadow-xl transition-all"
            >
              <div>
                {/* Header: Network Badge & DC Code */}
                <div className="flex items-start justify-between border-b border-white/60 pb-3 gap-2">
                  <div>
                    <span
                      className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full tracking-wide uppercase ${
                        dc.network === 'Indomarco'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {dc.network}
                    </span>
                    <h3 className="text-sm font-black text-slate-900 mt-1.5 leading-snug">
                      {dc.name}
                    </h3>
                    <div className="font-mono text-xs font-bold text-slate-600 mt-0.5">
                      {dc.code}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(dc)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-white/80 transition-colors"
                      title="Edit DC & Wilayah"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dc)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white/80 transition-colors"
                      title="Hapus DC"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Location & Region Specs */}
                <div className="py-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500" />
                      <span>Wilayah:</span>
                    </span>
                    <span className="font-extrabold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                      {dc.region}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Kota / Lokasi:</span>
                    </span>
                    <span className="font-bold text-slate-800">{dc.city}</span>
                  </div>

                  {dc.address && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                      {dc.address}
                    </div>
                  )}
                </div>

                {/* Distribution Progress Box */}
                <div className="mt-1 p-3 bg-white/70 rounded-2xl border border-white/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Target className="w-3 h-3 text-slate-400" />
                      <span>Target Forecast:</span>
                    </span>
                    <span className="font-extrabold text-slate-900">
                      {formatNumber(totalForecast)} Ctn
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Truck className="w-3 h-3 text-slate-400" />
                      <span>Realisasi Kirim:</span>
                    </span>
                    <span className="font-extrabold text-blue-700">
                      {formatNumber(totalSent)} Ctn
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fulfillmentPct >= 100
                          ? 'bg-emerald-500'
                          : fulfillmentPct > 0
                          ? 'bg-blue-500'
                          : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(100, fulfillmentPct)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-slate-500">Capaian:</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full ${
                        isFulfilled
                          ? 'bg-emerald-100 text-emerald-800'
                          : fulfillmentPct > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {fulfillmentPct.toFixed(1)}% {isFulfilled && '✓'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-semibold">
                  {summaries.length} Produk Terhubung
                </span>

                {onOpenShipmentForDC && (
                  <button
                    onClick={() => onOpenShipmentForDC(dc.id)}
                    className="clay-btn-apply px-3 py-1.5 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Buat Surat Jalan pengiriman langsung ke DC ini"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Kirim SO</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Modal Add / Edit DC */}
      <DCModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editDC={editingDC}
      />
    </div>
  );
};
