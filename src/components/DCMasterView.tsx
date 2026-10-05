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
  AlertCircle
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

  // All distinct regions in the DC list
  const existingRegions = useMemo(() => {
    const list = Array.from(new Set(dcs.map(d => d.region))).filter(Boolean);
    return list.sort();
  }, [dcs]);

  // Filtered DC list
  const filteredDCs = useMemo(() => {
    return dcs.filter(dc => {
      if (networkFilter !== 'ALL' && dc.network !== networkFilter) return false;
      if (regionFilter !== 'ALL' && dc.region !== regionFilter) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const mName = dc.name.toLowerCase().includes(q);
        const mCode = dc.code.toLowerCase().includes(q);
        const mCity = dc.city.toLowerCase().includes(q);
        const mRegion = dc.region.toLowerCase().includes(q);
        if (!mName && !mCode && !mCity && !mRegion) return false;
      }

      return true;
    });
  }, [dcs, networkFilter, regionFilter, searchTerm]);

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
      <div className="clay-glass-card p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari berdasarkan nama DC, kode (misal: DC-IDM-001), kota, atau wilayah..."
              className="clay-search-pill w-full pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            <span>Zona Wilayah:</span>
          </span>
          <button
            onClick={() => setRegionFilter('ALL')}
            className={`px-3 py-1 text-[11px] font-bold rounded-full transition-all shrink-0 cursor-pointer ${
              regionFilter === 'ALL'
                ? 'clay-btn-apply py-1 px-3 text-white'
                : 'clay-chip-white text-slate-700 hover:text-slate-900'
            }`}
          >
            Semua Wilayah
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

      {/* DC List Cards Grid */}
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

      {filteredDCs.length === 0 && (
        <div className="clay-glass-card p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Tidak ada DC yang cocok dengan filter</h3>
          <p className="text-xs text-slate-500 mt-1">
            Coba ubah kata kunci pencarian, filter jaringan, atau filter wilayah.
          </p>
          <button
            onClick={handleOpenAdd}
            className="clay-btn-apply px-4 py-2 text-xs font-bold mt-4 inline-flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah DC Baru Sekarang</span>
          </button>
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
