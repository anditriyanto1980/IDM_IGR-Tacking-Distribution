import React from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber, formatPercent, formatDate } from '../utils/formatters';
import { ActiveTab } from './Navbar';
import { 
  Plus, 
  SlidersHorizontal, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  Cpu, 
  MoreVertical, 
  Sparkles, 
  Truck, 
  Warehouse as WarehouseIcon, 
  Building2, 
  ArrowUpRight, 
  ChevronRight, 
  Clock, 
  Check, 
  Activity,
  Layers
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenShipmentModal: () => void;
  onOpenStockInModal: () => void;
  onFilterMatrixByProduct?: (productId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenShipmentModal,
  onOpenStockInModal,
  onFilterMatrixByProduct
}) => {
  const { products, warehouses, dcs, controllingSummaries, shipments, stocks, getTotalStock } = useApp();

  // Aggregate National Totals
  const totalForecast = controllingSummaries.reduce((sum, item) => sum + item.forecastQty, 0);
  const totalSent = controllingSummaries.reduce((sum, item) => sum + item.sentQty, 0);
  const totalRemaining = Math.max(0, totalForecast - totalSent);
  const nationalFulfilledPct = totalForecast > 0 ? (totalSent / totalForecast) * 100 : 0;
  const nationalRemainingPct = Math.max(0, 100 - nationalFulfilledPct);

  // Total Stock in All Warehouses
  const totalAvailableStock = stocks.reduce((sum, s) => sum + s.qty, 0);

  // Urgent DCs: DCs where fulfillment < 50%
  const dcProgressMap = dcs.map(dc => {
    const dcSummaries = controllingSummaries.filter(s => s.dc.id === dc.id);
    const dcFc = dcSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
    const dcSent = dcSummaries.reduce((sum, s) => sum + s.sentQty, 0);
    const pct = dcFc > 0 ? (dcSent / dcFc) * 100 : 0;
    return {
      dc,
      forecast: dcFc,
      sent: dcSent,
      remaining: Math.max(0, dcFc - dcSent),
      pct,
      status: pct >= 100 ? 'Stable' : pct >= 50 ? 'Watch' : 'Critical'
    };
  });

  const urgentDcsCount = dcProgressMap.filter(d => d.status === 'Critical').length;
  const watchDcsCount = dcProgressMap.filter(d => d.status === 'Watch').length;
  const stableDcsCount = dcProgressMap.filter(d => d.status === 'Stable').length;

  // Priority Queue rows (First 5 DCs prioritized by lowest completion)
  const priorityQueue = [...dcProgressMap]
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 5);

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Top Greeting Headline & Action Buttons (Matching Reference Header!) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Selamat Pagi, Tim Logistik
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Monitoring distribusi nasional DC Indomarco & Indogrosir serta ketersediaan stok pabrik
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenShipmentModal}
            className="px-5 py-2.5 rounded-full bg-[#1b3b82] hover:bg-[#152e68] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Buat SO Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className="dash-circle-btn text-slate-600 hover:text-slate-900 cursor-pointer"
            title="Filter & Matriks Lengkap"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Top KPI Metric Cards (Matching the 4 cards in Reference Image!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 (White with Mini Bar Chart Graphic): Total Kiriman Aktif */}
        <div className="dash-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {shipments.length}
                </div>
                <div className="text-xs font-bold text-blue-600 mt-1">
                  Surat Jalan Aktif
                </div>
              </div>

              {/* Pulse Icon Badge */}
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Activity className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Mini Bar Chart Graphic (Matching reference!) */}
          <div className="mt-5 pt-2 flex items-end gap-1.5 h-10">
            <div className="w-full bg-blue-100 rounded-xs h-3" />
            <div className="w-full bg-blue-200 rounded-xs h-5" />
            <div className="w-full bg-blue-300 rounded-xs h-4" />
            <div className="w-full bg-blue-400 rounded-xs h-7" />
            <div className="w-full bg-blue-500 rounded-xs h-6" />
            <div className="w-full bg-blue-600 rounded-xs h-9" />
            <div className="w-full bg-blue-700 rounded-xs h-10" />
            <div className="w-full bg-blue-900 rounded-xs h-8" />
          </div>
        </div>

        {/* Card 2 (White with Alert Badge): Urgent DC Suplai */}
        <div className="dash-card p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {String(urgentDcsCount).padStart(2, '0')}
                </div>
                <div className="text-xs font-bold text-slate-700 mt-1">
                  DC Butuh Suplai Prioritas
                </div>
              </div>

              {/* Red Alert Badge */}
              <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Trend Subtitle */}
          <div className="mt-5 pt-2 flex items-center gap-1.5 text-xs text-rose-600 font-bold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{urgentDcsCount} titik di bawah 50% target</span>
          </div>
        </div>

        {/* Card 3 (Bright Yellow Accent Card): Stok Gudang & Hari Pasokan */}
        <div className="dash-card-yellow p-5 flex flex-col justify-between text-slate-900">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                  {formatNumber(Math.round(totalAvailableStock / 1000))}k
                </div>
                <div className="text-xs font-bold text-slate-800 mt-1">
                  Stok Fisik Gudang (Ctn)
                </div>
              </div>

              {/* Box Icon Badge */}
              <div className="w-9 h-9 rounded-xl bg-yellow-400/40 border border-yellow-500/30 flex items-center justify-center text-slate-900">
                <FileText className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Progress Subtitle */}
          <div className="mt-5 pt-2 text-xs font-bold text-slate-800">
            {formatNumber(totalSent)} terkirim · {formatNumber(totalRemaining)} tersisa
          </div>
        </div>

        {/* Card 4 (Deep Royal Blue Card): Capaian Forecast Nasional */}
        <div className="dash-card-blue p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {nationalFulfilledPct.toFixed(0)}%
                </div>
                <div className="text-xs font-bold text-blue-100 mt-1">
                  Capaian Forecast Nasional
                </div>
              </div>

              {/* AI Network Badge */}
              <div className="w-9 h-9 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Subtitle */}
          <div className="mt-5 pt-2 text-xs font-semibold text-blue-100 flex items-center gap-1.5">
            <span>Target: {formatNumber(totalForecast)} Karton</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Section (Priority Queue & Right Side Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Priority Queue Table & AI Banner */}
        <div className="lg:col-span-8 space-y-4">
          <div className="dash-card p-5 sm:p-6 overflow-hidden">
            {/* Table Card Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Priority Distribution Queue
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Antrean DC dengan persentase pemenuhan terendah yang membutuhkan alokasi pengiriman
                </p>
              </div>

              <button
                onClick={() => setActiveTab('matrix')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                View All
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full text-left text-xs">
                <thead className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-5 sm:px-6">DC / TITIK TUJUAN</th>
                    <th className="py-2.5 px-4">WILAYAH</th>
                    <th className="py-2.5 px-4">JARINGAN</th>
                    <th className="py-2.5 px-4 text-right">REALISASI / TARGET</th>
                    <th className="py-2.5 px-4 text-center">STATUS</th>
                    <th className="py-2.5 px-4 text-center w-12">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityQueue.map((item, idx) => {
                    const isCritical = item.status === 'Critical';
                    const isWatch = item.status === 'Watch';
                    const isStable = item.status === 'Stable';

                    return (
                      <tr key={item.dc.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* DC Name & City with Avatar */}
                        <td className="py-3.5 px-5 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0">
                              {item.dc.network === 'Indomarco' ? 'IDM' : 'IGR'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                {item.dc.name}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium">
                                {item.dc.city}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Region */}
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {item.dc.region}
                        </td>

                        {/* Network */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            item.dc.network === 'Indomarco'
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {item.dc.network}
                          </span>
                        </td>

                        {/* Target & Realisasi */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-black text-slate-900">
                            {formatNumber(item.sent)} <span className="font-normal text-slate-500 text-[11px]">/ {formatNumber(item.forecast)}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatPercent(item.pct, 0)} terpenuhi
                          </span>
                        </td>

                        {/* Status Pill Badge (Matching reference!) */}
                        <td className="py-3.5 px-4 text-center">
                          {isCritical && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] status-pill-critical">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                              <span>Critical</span>
                            </span>
                          )}
                          {isWatch && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] status-pill-watch">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-600 shrink-0" />
                              <span>Watch</span>
                            </span>
                          )}
                          {isStable && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 text-[11px] status-pill-stable">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
                              <span>Stable</span>
                            </span>
                          )}
                        </td>

                        {/* Action dots button */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => onOpenShipmentModal()}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
                            title="Buat Surat Jalan untuk DC ini"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom AI Summary Pill Banner (Matching reference banner!) */}
          <div className="rounded-3xl bg-[#1e40af] text-white p-4 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-yellow-300 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-sm text-white">Ringkasan Distribusi & AI Insight</span>
                <p className="text-xs text-blue-100 font-medium">
                  {urgentDcsCount} titik DC membutuhkan pengiriman segera untuk mengejar target forecast pekan ini.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('matrix')}
              className="px-4 py-2 rounded-full bg-white hover:bg-slate-100 text-blue-900 text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Review Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (4 cols): Quick Actions & Patient Risk/Distribution Gauge */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Actions Card (Matching reference!) */}
          <div className="dash-card p-5">
            <h3 className="font-black text-slate-900 text-base mb-3">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <button
                onClick={onOpenShipmentModal}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 transition-all flex items-center justify-between cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-blue-700 transition-colors">
                      Input Pengiriman Baru (SO)
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Otomatis potong stok gudang
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={onOpenStockInModal}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <WarehouseIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-700 transition-colors">
                      Penerimaan Stok Pabrik
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Tambah ketersediaan stok
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                onClick={() => setActiveTab('forecast')}
                className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-all flex items-center justify-between cursor-pointer text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs group-hover:text-purple-700 transition-colors">
                      Atur Target Forecast DC
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Edit alokasi target nasional
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Distribution Donut / Semi-circle Gauge (Matching Reference!) */}
          <div className="dash-card p-5">
            <h3 className="font-black text-slate-900 text-base mb-1">
              DC Fulfillment Distribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Status pencapaian target seluruh 26 titik DC nasional
            </p>

            {/* Gauge Graphic */}
            <div className="relative flex items-center justify-center my-3">
              <svg className="w-48 h-32" viewBox="0 0 160 100">
                {/* Background arc */}
                <path
                  d="M 20 80 A 60 60 0 0 1 140 80"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Blue Segment: Stable (82%) */}
                <path
                  d="M 20 80 A 60 60 0 0 1 100 23"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Yellow Segment: Watch (13%) */}
                <path
                  d="M 105 24 A 60 60 0 0 1 130 50"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Red Segment: Critical (5%) */}
                <path
                  d="M 134 56 A 60 60 0 0 1 140 80"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center number */}
              <div className="absolute bottom-2 text-center">
                <div className="text-3xl font-black text-slate-900 leading-none">
                  {dcs.length}
                </div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Titik DC
                </span>
              </div>
            </div>

            {/* Legend Stats matching reference */}
            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100">
              <div>
                <span className="text-base font-black text-blue-600 block">
                  {((stableDcsCount / dcs.length) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Stable
                </span>
              </div>

              <div>
                <span className="text-base font-black text-yellow-500 block">
                  {((watchDcsCount / dcs.length) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Watch
                </span>
              </div>

              <div>
                <span className="text-base font-black text-slate-800 block">
                  {((urgentDcsCount / dcs.length) * 100).toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">
                  Critical
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
