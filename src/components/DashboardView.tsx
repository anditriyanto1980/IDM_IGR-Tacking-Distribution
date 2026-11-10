import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber, formatPercent, formatDate } from '../utils/formatters';
import { ActiveTab } from './Navbar';
import { 
  Plus, 
  TrendingUp, 
  AlertTriangle, 
  ArrowUpRight, 
  Building2, 
  CheckCircle2, 
  Layers, 
  ArrowDownRight,
  Warehouse as WarehouseIcon,
  ShieldCheck,
  Check,
  ChevronRight,
  Clock,
  Sparkles,
  MapPin,
  Truck,
  FileSpreadsheet,
  RotateCcw,
  Filter
} from 'lucide-react';
import { 
  ClayTruck, 
  ClayWarehouse, 
  ClayTarget, 
  ClayBox, 
  ClayKurmaPackage, 
  ClayStorefront 
} from './ClayIcons';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenShipmentModal: (defaultDcId?: string, defaultProductId?: string) => void;
  onOpenStockInModal: (warehouseId?: string, productId?: string) => void;
  onFilterMatrixByProduct?: (productId: string) => void;
  onOpenExportModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenShipmentModal,
  onOpenStockInModal,
  onFilterMatrixByProduct,
  onOpenExportModal
}) => {
  const { 
    products, 
    warehouses, 
    dcs, 
    forecasts, 
    stocks, 
    shipments, 
    controllingSummaries, 
    getTotalStock,
    isFirebaseConnected 
  } = useApp();

  // Interactive Dashboard Scope Filters
  const [scopeNetwork, setScopeNetwork] = useState<'ALL' | 'Indomarco' | 'Indogrosir'>('ALL');
  const [scopeRegion, setScopeRegion] = useState<string>('ALL');
  const [scopeProduct, setScopeProduct] = useState<string>('ALL');
  const [scopeForecastTier, setScopeForecastTier] = useState<'ALL' | 'TIER_HIGH' | 'TIER_MED' | 'TIER_LOW'>('ALL');
  const [regionalSort, setRegionalSort] = useState<'FORECAST_DESC' | 'FORECAST_ASC' | 'PCT_DESC' | 'PCT_ASC'>('FORECAST_DESC');

  const regions = useMemo(() => Array.from(new Set(dcs.map(d => d.region))).sort(), [dcs]);

  const isScopeActive = useMemo(() => {
    return scopeNetwork !== 'ALL' || scopeRegion !== 'ALL' || scopeProduct !== 'ALL' || scopeForecastTier !== 'ALL';
  }, [scopeNetwork, scopeRegion, scopeProduct, scopeForecastTier]);

  const handleResetScope = () => {
    setScopeNetwork('ALL');
    setScopeRegion('ALL');
    setScopeProduct('ALL');
    setScopeForecastTier('ALL');
  };

  // Filtered controlling summaries according to scope
  const activeSummaries = useMemo(() => {
    return controllingSummaries.filter(s => {
      if (scopeNetwork !== 'ALL' && s.dc.network !== scopeNetwork) return false;
      if (scopeRegion !== 'ALL' && s.dc.region !== scopeRegion) return false;
      if (scopeProduct !== 'ALL' && s.productId !== scopeProduct) return false;
      if (scopeForecastTier !== 'ALL') {
        if (scopeForecastTier === 'TIER_HIGH' && s.forecastQty < 5000) return false;
        if (scopeForecastTier === 'TIER_MED' && (s.forecastQty < 1000 || s.forecastQty >= 5000)) return false;
        if (scopeForecastTier === 'TIER_LOW' && s.forecastQty >= 1000) return false;
      }
      return true;
    });
  }, [controllingSummaries, scopeNetwork, scopeRegion, scopeProduct, scopeForecastTier]);

  // 1. High-Level Aggregates (Scope-aware)
  const totalForecast = useMemo(() => {
    return activeSummaries.reduce((sum, item) => sum + item.forecastQty, 0);
  }, [activeSummaries]);

  const totalSent = useMemo(() => {
    return activeSummaries.reduce((sum, item) => sum + item.sentQty, 0);
  }, [activeSummaries]);

  const totalRemaining = Math.max(0, totalForecast - totalSent);
  const nationalFulfilledPct = totalForecast > 0 ? (totalSent / totalForecast) * 100 : 0;
  const nationalRemainingPct = Math.max(0, 100 - nationalFulfilledPct);

  // Total Stock in All Warehouses (for selected product or all)
  const totalAvailableStock = useMemo(() => {
    if (scopeProduct !== 'ALL') {
      return stocks.filter(s => s.productId === scopeProduct).reduce((sum, s) => sum + s.qty, 0);
    }
    return stocks.reduce((sum, s) => sum + s.qty, 0);
  }, [stocks, scopeProduct]);

  // Overall stock readiness ratio
  const stockCoverageRatio = totalRemaining > 0 ? (totalAvailableStock / totalRemaining) * 100 : 100;
  const isStockSufficient = totalAvailableStock >= totalRemaining;

  // 2. Network Aggregates (Indomarco vs Indogrosir)
  const networkMetrics = useMemo(() => {
    const idmSummaries = activeSummaries.filter(s => s.dc.network === 'Indomarco');
    const igrSummaries = activeSummaries.filter(s => s.dc.network === 'Indogrosir');

    const idmFc = idmSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
    const idmSent = idmSummaries.reduce((sum, s) => sum + s.sentQty, 0);
    const idmRem = Math.max(0, idmFc - idmSent);
    const idmPct = idmFc > 0 ? (idmSent / idmFc) * 100 : 0;

    const igrFc = igrSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
    const igrSent = igrSummaries.reduce((sum, s) => sum + s.sentQty, 0);
    const igrRem = Math.max(0, igrFc - igrSent);
    const igrPct = igrFc > 0 ? (igrSent / igrFc) * 100 : 0;

    const activeDcs = dcs.filter(d => scopeRegion === 'ALL' || d.region === scopeRegion);
    const idmDcs = activeDcs.filter(d => d.network === 'Indomarco').length;
    const igrDcs = activeDcs.filter(d => d.network === 'Indogrosir').length;

    return {
      idm: { fc: idmFc, sent: idmSent, rem: idmRem, pct: idmPct, dcsCount: idmDcs },
      igr: { fc: igrFc, sent: igrSent, rem: igrRem, pct: igrPct, dcsCount: igrDcs },
    };
  }, [activeSummaries, dcs, scopeRegion]);

  // 3. Product-by-Product Detailed Metrics
  const productMetrics = useMemo(() => {
    const prodsToDisplay = scopeProduct !== 'ALL'
      ? products.filter(p => p.id === scopeProduct)
      : products;

    return prodsToDisplay.map(prod => {
      // Summaries for this product within scope
      const pSummaries = activeSummaries.filter(s => s.productId === prod.id);

      // IDM breakdown
      const idmItems = pSummaries.filter(s => s.dc.network === 'Indomarco');
      const idmFc = idmItems.reduce((sum, s) => sum + s.forecastQty, 0);
      const idmSent = idmItems.reduce((sum, s) => sum + s.sentQty, 0);
      const idmRem = Math.max(0, idmFc - idmSent);
      const idmPct = idmFc > 0 ? (idmSent / idmFc) * 100 : 0;

      // IGR breakdown
      const igrItems = pSummaries.filter(s => s.dc.network === 'Indogrosir');
      const igrFc = igrItems.reduce((sum, s) => sum + s.forecastQty, 0);
      const igrSent = igrItems.reduce((sum, s) => sum + s.sentQty, 0);
      const igrRem = Math.max(0, igrFc - igrSent);
      const igrPct = igrFc > 0 ? (igrSent / igrFc) * 100 : 0;

      // Product totals
      const totalProdFc = idmFc + igrFc;
      const totalProdSent = idmSent + igrSent;
      const totalProdRem = Math.max(0, totalProdFc - totalProdSent);
      const totalProdPct = totalProdFc > 0 ? (totalProdSent / totalProdFc) * 100 : 0;

      // Physical warehouse stock
      const physicalStock = getTotalStock(prod.id);
      const stockDeficit = Math.max(0, totalProdRem - physicalStock);

      return {
        product: prod,
        idm: { fc: idmFc, sent: idmSent, rem: idmRem, pct: idmPct },
        igr: { fc: igrFc, sent: igrSent, rem: igrRem, pct: igrPct },
        total: { fc: totalProdFc, sent: totalProdSent, rem: totalProdRem, pct: totalProdPct },
        physicalStock,
        stockDeficit,
        isStockSafe: physicalStock >= totalProdRem,
      };
    });
  }, [products, activeSummaries, scopeProduct, getTotalStock]);

  // 4. Regional Distribution Completion Rate (Scope-aware)
  const regionalMetrics = useMemo(() => {
    const regionMap: Record<string, { forecast: number; sent: number; count: number }> = {};
    activeSummaries.forEach(s => {
      const reg = s.dc.region;
      if (!regionMap[reg]) {
        regionMap[reg] = { forecast: 0, sent: 0, count: 0 };
      }
      regionMap[reg].forecast += s.forecastQty;
      regionMap[reg].sent += s.sentQty;
      regionMap[reg].count += 1;
    });

    const list = Object.entries(regionMap).map(([region, data]) => ({
      region,
      forecast: data.forecast,
      sent: data.sent,
      remaining: Math.max(0, data.forecast - data.sent),
      pct: data.forecast > 0 ? (data.sent / data.forecast) * 100 : 0
    }));

    if (regionalSort === 'FORECAST_DESC') {
      list.sort((a, b) => b.forecast - a.forecast);
    } else if (regionalSort === 'FORECAST_ASC') {
      list.sort((a, b) => a.forecast - b.forecast);
    } else if (regionalSort === 'PCT_DESC') {
      list.sort((a, b) => b.pct - a.pct);
    } else if (regionalSort === 'PCT_ASC') {
      list.sort((a, b) => a.pct - b.pct);
    }

    return list;
  }, [activeSummaries, regionalSort]);

  // 5. Urgent DC Supply Queue (Lowest fulfillment completion within scope)
  const priorityDcs = useMemo(() => {
    const filteredDcs = dcs.filter(d => {
      if (scopeNetwork !== 'ALL' && d.network !== scopeNetwork) return false;
      if (scopeRegion !== 'ALL' && d.region !== scopeRegion) return false;
      return true;
    });

    const list = filteredDcs.map(dc => {
      const dcSummaries = activeSummaries.filter(s => s.dc.id === dc.id);
      const dcFc = dcSummaries.reduce((sum, s) => sum + s.forecastQty, 0);
      const dcSent = dcSummaries.reduce((sum, s) => sum + s.sentQty, 0);
      const pct = dcFc > 0 ? (dcSent / dcFc) * 100 : 0;
      return {
        dc,
        forecast: dcFc,
        sent: dcSent,
        remaining: Math.max(0, dcFc - dcSent),
        pct,
        status: pct >= 100 ? 'Tercapai' : pct >= 50 ? 'Sedang Berjalan' : 'Kritis (<50%)'
      };
    });

    return list.sort((a, b) => a.pct - b.pct).slice(0, 5);
  }, [dcs, activeSummaries, scopeNetwork, scopeRegion]);

  // 6. Recent Shipments (Latest 5 SOs)
  const recentShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [shipments]);

  return (
    <div className="space-y-6 pb-12 text-slate-900 select-none">
      {/* Top Header / Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight drop-shadow-sm">
              Dashboard Controlling Distribusi
            </h1>
            <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-white text-blue-800 shadow-xs border border-white">
              Nasional Q2-2026
            </span>
          </div>
          <p className="text-xs sm:text-sm text-white font-medium mt-1 drop-shadow-xs">
            Monitoring komparasi target forecast DC Indomarco & Indogrosir, realisasi pengiriman, dan ketersediaan stok pabrik
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="clay-btn-white px-4 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer font-bold text-slate-800"
              title="Pusat Ekspor CSV & Cadangan Backup Data"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Ekspor / Backup CSV</span>
            </button>
          )}

          <button
            onClick={() => onOpenStockInModal()}
            className="clay-btn-emerald px-4 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>+ Penerimaan Stok</span>
          </button>

          <button
            onClick={() => onOpenShipmentModal()}
            className="clay-btn-apply px-5 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Buat SO Baru</span>
          </button>
        </div>
      </div>

      {/* Interactive Scope Filter Bar */}
      <div className="clay-glass-card p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md border border-white/60">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-slate-800 bg-white/80 px-3 py-1.5 rounded-xl border border-white shadow-xs">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Filter Lingkup Analisis:</span>
          </div>

          {/* Jaringan DC */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setScopeNetwork('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                scopeNetwork === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jaringan
            </button>
            <button
              onClick={() => setScopeNetwork('Indomarco')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                scopeNetwork === 'Indomarco'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indomarco
            </button>
            <button
              onClick={() => setScopeNetwork('Indogrosir')}
              className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                scopeNetwork === 'Indogrosir'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Indogrosir
            </button>
          </div>

          {/* Wilayah / Zona */}
          <select
            value={scopeRegion}
            onChange={(e) => setScopeRegion(e.target.value)}
            className="clay-search-pill text-xs font-bold text-slate-800 py-1.5 px-3 bg-white/90 border border-slate-200 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">🌐 Semua Zona Wilayah</option>
            {regions.map(reg => (
              <option key={reg} value={reg}>📍 {reg}</option>
            ))}
          </select>

          {/* Produk Kurma */}
          <select
            value={scopeProduct}
            onChange={(e) => setScopeProduct(e.target.value)}
            className="clay-search-pill text-xs font-bold text-slate-800 py-1.5 px-3 bg-white/90 border border-slate-200 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px] truncate"
          >
            <option value="ALL">📦 Semua Varian Kurma</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>🌴 {p.name}</option>
            ))}
          </select>

          {/* Filter Rentang Qty Target */}
          <select
            value={scopeForecastTier}
            onChange={(e) => setScopeForecastTier(e.target.value as any)}
            className="clay-search-pill text-xs font-bold text-slate-800 py-1.5 px-3 bg-white/90 border border-slate-200 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">🎯 Semua Qty Target</option>
            <option value="TIER_HIGH">🔥 Qty Besar (&ge; 5.000 ctn)</option>
            <option value="TIER_MED">⚡ Qty Sedang (1.000 - 4.999 ctn)</option>
            <option value="TIER_LOW">📦 Qty Kecil (&lt; 1.000 ctn)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {isScopeActive && (
            <button
              onClick={handleResetScope}
              className="clay-btn-white text-xs px-3 py-1.5 flex items-center gap-1.5 text-rose-600 font-bold hover:bg-rose-50 border border-rose-200 shadow-xs cursor-pointer rounded-xl transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
          <span className="text-[11px] font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200">
            {activeSummaries.length} Kombinasi Data DC
          </span>
        </div>
      </div>

      {/* 4 Main KPI Tactile Cards (Top Executive Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Forecast Nasional */}
        <div className="clay-card p-5 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Total Forecast Nasional
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-1">
                  {formatNumber(totalForecast)}
                </div>
                <span className="text-xs font-semibold text-slate-600">Karton (Semua Barang)</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1 shadow-xs">
                <ClayTarget size={38} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>IDM: <strong>{formatNumber(networkMetrics.idm.fc)}</strong></span>
            <span className="text-slate-300">|</span>
            <span>IGR: <strong>{formatNumber(networkMetrics.igr.fc)}</strong></span>
          </div>
        </div>

        {/* Card 2: Total Realisasi Sudah Terkirim */}
        <div className="clay-card p-5 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                  Total Sudah Terkirim
                </span>
                <div className="text-3xl sm:text-4xl font-black text-blue-700 tracking-tight mt-1">
                  {formatNumber(totalSent)}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {formatPercent(nationalFulfilledPct, 1)} Capaian
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center p-1 shadow-xs">
                <ClayTruck size={40} />
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 pt-2">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, nationalFulfilledPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-1.5">
              <span>{shipments.length} Surat Jalan Selesai</span>
              <span>Target: {formatNumber(totalForecast)}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Sisa Belum Terkirim (Outstanding) */}
        <div className="clay-card p-5 flex flex-col justify-between hover:shadow-lg transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">
                  Sisa Belum Terkirim
                </span>
                <div className="text-3xl sm:text-4xl font-black text-amber-600 tracking-tight mt-1">
                  {formatNumber(totalRemaining)}
                </div>
                <span className="text-xs font-semibold text-amber-800">
                  {formatPercent(nationalRemainingPct, 1)} dari target nasional
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center p-1 shadow-xs">
                <ClayBox size={38} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600 flex items-center justify-between">
            <span>Sisa IDM: <strong>{formatNumber(networkMetrics.idm.rem)}</strong></span>
            <span className="text-slate-300">|</span>
            <span>Sisa IGR: <strong>{formatNumber(networkMetrics.igr.rem)}</strong></span>
          </div>
        </div>

        {/* Card 4: Total Stok Fisik Gudang Tersedia */}
        <div className="dash-card-yellow p-5 flex flex-col justify-between text-slate-900 hover:shadow-lg transition-all">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider block">
                  Stok Fisik Gudang
                </span>
                <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight mt-1">
                  {formatNumber(totalAvailableStock)}
                </div>
                <span className="text-xs font-bold text-slate-800">
                  Karton di {warehouses.length} Gudang Pabrik
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white flex items-center justify-center p-1 shadow-xs">
                <ClayWarehouse size={38} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-yellow-500/30 text-xs font-black flex items-center justify-between">
            <span className="flex items-center gap-1 text-slate-900">
              {isStockSufficient ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-800" />
                  <span>Stok Aman ({stockCoverageRatio.toFixed(0)}% sisa)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-700" />
                  <span>Stok Defisit (Kurang {formatNumber(totalRemaining - totalAvailableStock)})</span>
                </>
              )}
            </span>
            <button
              onClick={() => setActiveTab('stock')}
              className="text-[11px] text-blue-900 hover:underline font-extrabold cursor-pointer"
            >
              Lihat Gudang &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Network Comparison Overview (Indomarco vs Indogrosir) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Indomarco Network Box */}
        <div className="clay-card p-5 border-l-6 border-l-blue-600">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center border border-blue-200">
                IDM
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Jaringan DC Indomarco</h3>
                <span className="text-[11px] text-slate-500 font-semibold">{networkMetrics.idm.dcsCount} Titik Distribusi Nasional</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-blue-700">{formatPercent(networkMetrics.idm.pct, 1)}</span>
              <span className="text-[11px] text-slate-500 block font-semibold">Tercapai</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="clay-chip-white p-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecast</span>
              <span className="font-black text-slate-900 text-sm sm:text-base">{formatNumber(networkMetrics.idm.fc)}</span>
            </div>
            <div className="clay-chip-white p-2.5 bg-blue-50/50">
              <span className="text-[10px] uppercase font-bold text-blue-600 block">Terkirim</span>
              <span className="font-black text-blue-700 text-sm sm:text-base">{formatNumber(networkMetrics.idm.sent)}</span>
            </div>
            <div className="clay-chip-white p-2.5">
              <span className="text-[10px] uppercase font-bold text-amber-600 block">Sisa Belum</span>
              <span className="font-black text-amber-700 text-sm sm:text-base">{formatNumber(networkMetrics.idm.rem)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${Math.min(100, networkMetrics.idm.pct)}%` }} />
            </div>
          </div>
        </div>

        {/* Indogrosir Network Box */}
        <div className="clay-card p-5 border-l-6 border-l-amber-500">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center border border-amber-200">
                IGR
              </div>
              <div>
                <h3 className="font-black text-slate-900 text-base">Jaringan DC Indogrosir</h3>
                <span className="text-[11px] text-slate-500 font-semibold">{networkMetrics.igr.dcsCount} Titik Distribusi Nasional</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-amber-600">{formatPercent(networkMetrics.igr.pct, 1)}</span>
              <span className="text-[11px] text-slate-500 block font-semibold">Tercapai</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div className="clay-chip-white p-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Forecast</span>
              <span className="font-black text-slate-900 text-sm sm:text-base">{formatNumber(networkMetrics.igr.fc)}</span>
            </div>
            <div className="clay-chip-white p-2.5 bg-amber-50/50">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Terkirim</span>
              <span className="font-black text-amber-700 text-sm sm:text-base">{formatNumber(networkMetrics.igr.sent)}</span>
            </div>
            <div className="clay-chip-white p-2.5">
              <span className="text-[10px] uppercase font-bold text-rose-600 block">Sisa Belum</span>
              <span className="font-black text-rose-700 text-sm sm:text-base">{formatNumber(networkMetrics.igr.rem)}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${Math.min(100, networkMetrics.igr.pct)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* CORE REQUEST: Rincian Forecast & Kiriman IDM & IGR per Masing-Masing Produk */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-amber-300 tracking-tight flex items-center gap-2 drop-shadow-sm">
              <span>Rincian Target Forecast & Realisasi per Produk</span>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-white text-blue-800 shadow-xs">
                IDM vs IGR
              </span>
            </h2>
            <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
              Tabel komparasi kuantiti target, barang sudah terkirim, dan persentase capaian per masing-masing SKU produk kurma
            </p>
          </div>

          <button
            onClick={() => setActiveTab('matrix')}
            className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 self-start sm:self-auto cursor-pointer drop-shadow-xs transition-colors"
          >
            <span>Buka Matriks Detail DC &rarr;</span>
          </button>
        </div>

        {/* Product Breakdown Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {productMetrics.map((pm, idx) => {
            const p = pm.product;
            return (
              <div key={p.id} className="clay-card p-5 flex flex-col justify-between border-t-4 border-t-blue-600">
                <div>
                  {/* Product Header */}
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center p-1 shrink-0">
                        <ClayKurmaPackage size={38} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {p.sku}
                        </span>
                        <h3 className="font-black text-slate-900 text-sm mt-1 leading-snug">{p.name}</h3>
                        <span className="text-[11px] text-slate-500 font-medium">Kemasan: {p.packSize}</span>
                      </div>
                    </div>
                  </div>

                  {/* IDM & IGR Breakdown Box */}
                  <div className="mt-4 space-y-3">
                    {/* Row 1: Indomarco (IDM) */}
                    <div className="clay-chip-white p-3 border-l-4 border-l-blue-600">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          DC Indomarco (IDM)
                        </span>
                        <span className="font-black text-blue-700 text-xs">
                          {formatPercent(pm.idm.pct, 1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 text-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Forecast</span>
                          <strong className="font-black">{formatNumber(pm.idm.fc)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 block font-semibold">Terkirim</span>
                          <strong className="font-black text-emerald-700">{formatNumber(pm.idm.sent)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-600 block font-semibold">Sisa Kirim</span>
                          <strong className="font-black text-amber-700">{formatNumber(pm.idm.rem)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Indogrosir (IGR) */}
                    <div className="clay-chip-white p-3 border-l-4 border-l-amber-500">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-amber-950 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          DC Indogrosir (IGR)
                        </span>
                        <span className="font-black text-amber-700 text-xs">
                          {formatPercent(pm.igr.pct, 1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px] mt-1.5 pt-1.5 border-t border-slate-100 text-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Forecast</span>
                          <strong className="font-black">{formatNumber(pm.igr.fc)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 block font-semibold">Terkirim</span>
                          <strong className="font-black text-emerald-700">{formatNumber(pm.igr.sent)}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-600 block font-semibold">Sisa Kirim</span>
                          <strong className="font-black text-amber-700">{formatNumber(pm.igr.rem)}</strong>
                        </div>
                      </div>
                    </div>

                    {/* Total Product Summary Banner */}
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/70 border border-blue-100">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-black text-slate-800">Total Pengiriman Produk:</span>
                        <span className="font-black text-slate-900 text-sm">
                          {formatNumber(pm.total.sent)} <span className="text-xs font-normal text-slate-500">/ {formatNumber(pm.total.fc)}</span>
                        </span>
                      </div>
                      {/* Overall Progress Bar */}
                      <div className="w-full bg-white rounded-full h-2 mt-2 overflow-hidden shadow-xs border border-blue-100">
                        <div 
                          className="bg-blue-600 h-full rounded-full transition-all" 
                          style={{ width: `${Math.min(100, pm.total.pct)}%` }} 
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-1.5">
                        <span className="text-blue-700 font-extrabold">{formatPercent(pm.total.pct, 1)} Total Terkirim</span>
                        <span className="text-amber-800">Sisa: {formatNumber(pm.total.rem)} ctn</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Stock in Warehouse + Action Button */}
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block font-medium">Stok Fisik Tersedia:</span>
                    <strong className={`font-black ${pm.isStockSafe ? 'text-slate-900' : 'text-rose-600'}`}>
                      {formatNumber(pm.physicalStock)} ctn
                    </strong>
                  </div>

                  <button
                    onClick={() => onOpenShipmentModal(undefined, p.id)}
                    className="clay-btn-apply px-3.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer"
                    title={`Kirim ${p.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Kirim SO</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2-Column Section: Urgent DC Supply Queue & General Information Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Priority Supply Queue (DCs with lowest realization) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="clay-table-sheet p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-slate-900 text-base">
                  Antrean DC Prioritas Suplai (Realisasi Terendah)
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Titik DC Indomarco & Indogrosir yang membutuhkan alokasi pengiriman segera
                </p>
              </div>

              <button
                onClick={() => setActiveTab('matrix')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Lihat Semua ({dcs.length}) &rarr;
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    <th className="py-2.5 px-3">DC / Wilayah</th>
                    <th className="py-2.5 px-2 text-center">Jaringan</th>
                    <th className="py-2.5 px-2 text-right">Terkirim / Target</th>
                    <th className="py-2.5 px-2 text-center">Capaian</th>
                    <th className="py-2.5 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {priorityDcs.map(item => (
                    <tr key={item.dc.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">
                          {item.dc.name}
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {item.dc.region} · {item.dc.city}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.dc.network === 'Indomarco'
                            ? 'bg-blue-50 text-blue-700 border border-blue-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {item.dc.network}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-right">
                        <div className="font-black text-slate-900">
                          {formatNumber(item.sent)} <span className="font-normal text-slate-400 text-[11px]">/ {formatNumber(item.forecast)}</span>
                        </div>
                        <span className="text-[10px] text-amber-700 font-semibold">
                          Sisa: {formatNumber(item.remaining)}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                          item.pct < 50
                            ? 'status-pill-critical'
                            : item.pct < 100
                            ? 'status-pill-watch'
                            : 'status-pill-stable'
                        }`}>
                          {formatPercent(item.pct, 0)}
                        </span>
                      </td>

                      <td className="py-3 px-2 text-center">
                        <button
                          onClick={() => onOpenShipmentModal(item.dc.id)}
                          className="clay-btn-apply px-2.5 py-1 text-[11px] font-bold shadow-xs cursor-pointer"
                          title="Input SO ke DC ini"
                        >
                          + Kirim
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Regional Summary Grid with Qty Wilayah Sorting */}
          <div className="clay-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  Capaian Realisasi per Wilayah Distribusi
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {regionalSort === 'FORECAST_DESC'
                    ? 'Diurutkan dari kuantiti forecast terbanyak ke terkecil'
                    : regionalSort === 'FORECAST_ASC'
                    ? 'Diurutkan dari kuantiti forecast terkecil ke terbanyak'
                    : 'Diurutkan berdasarkan persentase capaian'} (Klik wilayah untuk filter dashboard)
                </p>
              </div>

              {/* Sorting Switcher */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
                <button
                  onClick={() => setRegionalSort('FORECAST_DESC')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    regionalSort === 'FORECAST_DESC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan wilayah dari target kuantiti forecast terbanyak ke terkecil"
                >
                  Qty Terbanyak ↓
                </button>
                <button
                  onClick={() => setRegionalSort('FORECAST_ASC')}
                  className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    regionalSort === 'FORECAST_ASC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan wilayah dari target kuantiti forecast terkecil ke terbanyak"
                >
                  Qty Terkecil ↑
                </button>
                <button
                  onClick={() => setRegionalSort(regionalSort === 'PCT_DESC' ? 'PCT_ASC' : 'PCT_DESC')}
                  className={`px-2 py-1 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    regionalSort === 'PCT_DESC' || regionalSort === 'PCT_ASC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan persentase realisasi kiriman"
                >
                  % {regionalSort === 'PCT_ASC' ? 'Terendah ↑' : 'Tertinggi ↓'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {regionalMetrics.map(r => {
                const isSelected = scopeRegion === r.region;
                return (
                  <button
                    key={r.region}
                    onClick={() => setScopeRegion(isSelected ? 'ALL' : r.region)}
                    className={`p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-700 text-white shadow-md'
                        : 'clay-chip-white hover:bg-blue-50 text-slate-800 border border-slate-100'
                    }`}
                    title={`Klik untuk filter lingkup dashboard ke wilayah ${r.region}`}
                  >
                    <span className={`text-[11px] font-bold block truncate ${
                      isSelected ? 'text-white' : 'text-slate-700'
                    }`}>
                      {r.region}
                    </span>
                    <div className={`text-base font-black mt-0.5 ${
                      isSelected ? 'text-blue-100' : 'text-blue-700'
                    }`}>
                      {formatPercent(r.pct, 0)}
                    </div>
                    <span className={`text-[10px] font-semibold block ${
                      isSelected ? 'text-blue-200' : 'text-slate-500'
                    }`}>
                      {formatNumber(r.sent)} / {formatNumber(r.forecast)} ctn
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): General Important Info & Recent Activity */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stock Health Check vs Outstanding Forecast */}
          <div className="clay-card p-5">
            <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="font-black text-slate-900 text-sm">
                Analisis Kesiapan Stok Pabrik
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 mb-3">
              Perbandingan total stok fisik tersedia di semua gudang dengan sisa target forecast yang belum terkirim:
            </p>

            <div className="space-y-2.5">
              {productMetrics.map(pm => (
                <div key={pm.product.id} className="clay-chip-white p-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{pm.product.name}</span>
                    <span className="text-[10px] text-slate-500">Sisa kirim butuh: {formatNumber(pm.total.rem)} ctn</span>
                  </div>
                  <div className="text-right">
                    <span className={`font-black block ${pm.isStockSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {formatNumber(pm.physicalStock)} ctn
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      pm.isStockSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {pm.isStockSafe ? 'Mencukupi' : `Defisit -${formatNumber(pm.stockDeficit)}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Shipments Activity */}
          <div className="clay-card p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h3 className="font-black text-slate-900 text-sm">
                  Pengiriman Terkini (Surat Jalan)
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('shipments')}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
              >
                Riwayat Lengkap &rarr;
              </button>
            </div>

            <div className="space-y-2.5">
              {recentShipments.map(s => {
                const prod = products.find(p => p.id === s.productId);
                const dc = dcs.find(d => d.id === s.targetDcId);
                const wh = warehouses.find(w => w.id === s.sourceWarehouseId);

                return (
                  <div key={s.id} className="clay-chip-white p-2.5 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-800 text-[11px]">{s.soNumber}</span>
                        <span className="text-[10px] text-slate-400">{s.date}</span>
                      </div>
                      <span className="font-bold text-slate-900 text-xs block mt-0.5">
                        {prod?.name} &rarr; {dc?.name}
                      </span>
                      <span className="text-[10px] text-slate-500">Dari {wh?.name}</span>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 text-sm block">
                        {formatNumber(s.qty)} {prod?.unit || 'ctn'}
                      </span>
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        s.status === 'Terkirim'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-sky-50 text-sky-700'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
