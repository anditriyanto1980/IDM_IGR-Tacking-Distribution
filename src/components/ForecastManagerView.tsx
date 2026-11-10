import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../utils/formatters';
import { ForecastInputModal } from './ForecastInputModal';
import { DCModal } from './DCModal';
import { 
  Target, 
  Search, 
  Check, 
  Plus, 
  Edit3, 
  Save, 
  Download, 
  Sliders, 
  HelpCircle, 
  CheckCircle2,
  Building2,
  X,
  RotateCcw,
  Filter,
  ArrowUpDown,
  Globe
} from 'lucide-react';

export const ForecastManagerView: React.FC = () => {
  const { dcs, products, forecasts, updateForecast, batchUpdateForecasts, exportToCSV } = useApp();

  const [networkFilter, setNetworkFilter] = useState<'ALL' | 'Indomarco' | 'Indogrosir'>('ALL');
  const [regionFilter, setRegionFilter] = useState<string>('ALL');
  const [allocationFilter, setAllocationFilter] = useState<'ALL' | 'HAS_TARGET' | 'NO_TARGET'>('ALL');
  const [productFilter, setProductFilter] = useState<string>('ALL');
  const [qtyRangeFilter, setQtyRangeFilter] = useState<'ALL' | 'TIER_HIGH' | 'TIER_MED' | 'TIER_LOW' | 'TIER_ZERO'>('ALL');
  const [sortBy, setSortBy] = useState<'NAME_ASC' | 'CODE_ASC' | 'REGION_TARGET_DESC' | 'REGION_TARGET_ASC' | 'TARGET_DESC' | 'TARGET_ASC'>('NAME_ASC');
  const [search, setSearch] = useState('');

  // Regional ranking sort order
  const [regionRankingOrder, setRegionRankingOrder] = useState<'DESC' | 'ASC'>('DESC');
  
  // Single DC Modal
  const [inputModalOpen, setInputModalOpen] = useState(false);
  const [selectedDcForModal, setSelectedDcForModal] = useState<string | undefined>(undefined);
  const [dcModalOpen, setDcModalOpen] = useState(false);

  // Bulk Edit Mode
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [bulkValues, setBulkValues] = useState<Record<string, number>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Regional Mass Forecast Modal
  const [regionalModalOpen, setRegionalModalOpen] = useState(false);
  const [massRegion, setMassRegion] = useState<string>('Jabodetabek');
  const [massQtys, setMassQtys] = useState<Record<string, number>>({});

  const regions = useMemo(() => Array.from(new Set(dcs.map(d => d.region))).sort(), [dcs]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      search.trim() ||
      networkFilter !== 'ALL' ||
      regionFilter !== 'ALL' ||
      allocationFilter !== 'ALL' ||
      productFilter !== 'ALL' ||
      qtyRangeFilter !== 'ALL' ||
      sortBy !== 'NAME_ASC'
    );
  }, [search, networkFilter, regionFilter, allocationFilter, productFilter, qtyRangeFilter, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    setNetworkFilter('ALL');
    setRegionFilter('ALL');
    setAllocationFilter('ALL');
    setProductFilter('ALL');
    setQtyRangeFilter('ALL');
    setSortBy('NAME_ASC');
  };

  const getForecastValue = (dcId: string, productId: string): number => {
    if (isBulkEditMode) {
      const key = `${dcId}_${productId}`;
      if (bulkValues[key] !== undefined) return bulkValues[key];
    }
    const item = forecasts.find(f => f.dcId === dcId && f.productId === productId);
    return item ? item.forecastQty : 0;
  };

  // Region forecast totals map for region-level ranking and sorting
  const regionTotalsMap = useMemo(() => {
    const map: Record<string, number> = {};
    dcs.forEach(dc => {
      let dcTotal = 0;
      products.forEach(p => {
        dcTotal += getForecastValue(dc.id, p.id);
      });
      map[dc.region] = (map[dc.region] || 0) + dcTotal;
    });
    return map;
  }, [dcs, products, forecasts, bulkValues, isBulkEditMode]);

  // Regional ranking list (Sorted by forecast qty)
  const regionalRankingList = useMemo(() => {
    const arr = regions.map(reg => ({
      region: reg,
      totalForecast: regionTotalsMap[reg] || 0,
      dcCount: dcs.filter(d => d.region === reg).length
    }));
    if (regionRankingOrder === 'DESC') {
      arr.sort((a, b) => b.totalForecast - a.totalForecast);
    } else {
      arr.sort((a, b) => a.totalForecast - b.totalForecast);
    }
    return arr;
  }, [regions, regionTotalsMap, dcs, regionRankingOrder]);

  const filteredDcs = useMemo(() => {
    return dcs
      .map(dc => {
        let dcTotal = 0;
        products.forEach(p => {
          dcTotal += getForecastValue(dc.id, p.id);
        });
        return { dc, dcTotal };
      })
      .filter(({ dc, dcTotal }) => {
        if (networkFilter !== 'ALL' && dc.network !== networkFilter) return false;
        if (regionFilter !== 'ALL' && dc.region !== regionFilter) return false;

        if (allocationFilter === 'HAS_TARGET' && dcTotal <= 0) return false;
        if (allocationFilter === 'NO_TARGET' && dcTotal > 0) return false;

        // Qty Range Filter
        if (qtyRangeFilter !== 'ALL') {
          if (qtyRangeFilter === 'TIER_HIGH' && dcTotal < 10000) return false;
          if (qtyRangeFilter === 'TIER_MED' && (dcTotal < 3000 || dcTotal >= 10000)) return false;
          if (qtyRangeFilter === 'TIER_LOW' && (dcTotal <= 0 || dcTotal >= 3000)) return false;
          if (qtyRangeFilter === 'TIER_ZERO' && dcTotal > 0) return false;
        }

        if (productFilter !== 'ALL') {
          const pVal = getForecastValue(dc.id, productFilter);
          if (pVal <= 0) return false;
        }

        if (search.trim()) {
          const q = search.toLowerCase();
          const match =
            dc.name.toLowerCase().includes(q) ||
            dc.code.toLowerCase().includes(q) ||
            dc.city.toLowerCase().includes(q) ||
            dc.region.toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'REGION_TARGET_DESC') {
          const regDiff = (regionTotalsMap[b.dc.region] || 0) - (regionTotalsMap[a.dc.region] || 0);
          return regDiff !== 0 ? regDiff : b.dcTotal - a.dcTotal;
        }
        if (sortBy === 'REGION_TARGET_ASC') {
          const regDiff = (regionTotalsMap[a.dc.region] || 0) - (regionTotalsMap[b.dc.region] || 0);
          return regDiff !== 0 ? regDiff : a.dcTotal - b.dcTotal;
        }
        if (sortBy === 'NAME_ASC') return a.dc.name.localeCompare(b.dc.name);
        if (sortBy === 'CODE_ASC') return a.dc.code.localeCompare(b.dc.code);
        if (sortBy === 'TARGET_DESC') return b.dcTotal - a.dcTotal;
        if (sortBy === 'TARGET_ASC') return a.dcTotal - b.dcTotal;
        return 0;
      })
      .map(item => item.dc);
  }, [dcs, products, forecasts, bulkValues, isBulkEditMode, networkFilter, regionFilter, allocationFilter, productFilter, qtyRangeFilter, sortBy, search, regionTotalsMap]);

  // Turn on bulk edit mode
  const handleToggleBulkEdit = () => {
    if (!isBulkEditMode) {
      // populate bulkValues from existing forecasts
      const initialMap: Record<string, number> = {};
      dcs.forEach(dc => {
        products.forEach(p => {
          const item = forecasts.find(f => f.dcId === dc.id && f.productId === p.id);
          initialMap[`${dc.id}_${p.id}`] = item ? item.forecastQty : 0;
        });
      });
      setBulkValues(initialMap);
      setIsBulkEditMode(true);
    } else {
      setIsBulkEditMode(false);
    }
  };

  // Handle cell edit in bulk mode
  const handleBulkCellChange = (dcId: string, productId: string, val: string) => {
    const num = val === '' ? 0 : Math.max(0, parseInt(val, 10));
    setBulkValues(prev => ({
      ...prev,
      [`${dcId}_${productId}`]: num
    }));
  };

  // Save all bulk changes
  const handleSaveBulk = () => {
    const itemsToUpdate: { dcId: string; productId: string; qty: number }[] = [];
    Object.entries(bulkValues).forEach(([key, qty]) => {
      const [dcId, productId] = key.split('_');
      if (dcId && productId) {
        itemsToUpdate.push({ dcId, productId, qty });
      }
    });

    batchUpdateForecasts(itemsToUpdate);
    setIsBulkEditMode(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Open single DC modal
  const handleOpenDcModal = (dcId?: string) => {
    setSelectedDcForModal(dcId);
    setInputModalOpen(true);
  };

  // Regional mass apply
  const handleOpenRegionalModal = () => {
    const initialMap: Record<string, number> = {};
    products.forEach(p => {
      initialMap[p.id] = 2500;
    });
    setMassQtys(initialMap);
    setRegionalModalOpen(true);
  };

  const handleApplyRegionalMass = (e: React.FormEvent) => {
    e.preventDefault();
    const targetDcs = dcs.filter(d => d.region === massRegion);
    const updates: { dcId: string; productId: string; qty: number }[] = [];

    targetDcs.forEach(dc => {
      products.forEach(p => {
        updates.push({
          dcId: dc.id,
          productId: p.id,
          qty: massQtys[p.id] || 0
        });
      });
    });

    batchUpdateForecasts(updates);
    setRegionalModalOpen(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Export Forecast to CSV
  const handleExportCSV = () => {
    const rows = dcs.map((dc, idx) => {
      const rowObj: Record<string, any> = {
        No: idx + 1,
        Jaringan: dc.network,
        Kode_DC: dc.code,
        Nama_DC: dc.name,
        Wilayah: dc.region,
        Kota: dc.city
      };
      let totalDc = 0;
      products.forEach(p => {
        const val = getForecastValue(dc.id, p.id);
        rowObj[p.name] = val;
        totalDc += val;
      });
      rowObj['Total_Forecast'] = totalDc;
      return rowObj;
    });

    exportToCSV(`Target_Forecast_DC_Nasional_${new Date().toISOString().split('T')[0]}`, rows);
  };

  // Grand total
  const totalForecastAll = forecasts.reduce((sum, f) => sum + f.forecastQty, 0);

  return (
    <div className="space-y-6 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
              Pengaturan Alokasi Target Forecast DC
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-white text-blue-700 text-xs font-bold border border-white shadow-xs">
              Nasional
            </span>
          </div>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
            Tentukan kuantiti target awal pengiriman per titik DC dan produk untuk mengontrol realisasi pengiriman
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {saveSuccess && (
            <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-emerald-200 shadow-xs animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Target Disimpan
            </span>
          )}

          <button
            onClick={handleExportCSV}
            className="clay-btn-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor CSV</span>
          </button>

          <button
            onClick={handleOpenRegionalModal}
            className="clay-btn-white px-3.5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>Set per Wilayah</span>
          </button>

          <button
            onClick={handleToggleBulkEdit}
            className={`px-3.5 py-2 text-xs font-bold rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
              isBulkEditMode
                ? 'bg-amber-500 text-white shadow-md'
                : 'clay-btn-white'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isBulkEditMode ? 'Keluar Mode Bulk' : 'Mode Edit Cepat'}</span>
          </button>

          <button
            onClick={() => setDcModalOpen(true)}
            className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Tambah titik DC dan wilayah baru ke sistem"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah DC & Wilayah</span>
          </button>

          <button
            onClick={() => handleOpenDcModal()}
            className="clay-btn-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm text-slate-800"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
            <span>Input Forecast per DC</span>
          </button>
        </div>
      </div>

      {/* Guide Card (Cara Input) - Frosted Glass Sheet */}
      <div className="clay-glass-card p-4 text-xs text-slate-800 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
          <HelpCircle className="w-4 h-4 text-blue-600" />
          <span>3 Cara Mudah Input & Mengubah Data Forecast Awal:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="clay-chip-white p-3 border border-white">
            <strong className="text-blue-700 block mb-1 font-bold">1. Tombol "+ Input Forecast per DC":</strong>
            Klik tombol biru di atas atau klik nama DC pada tabel untuk membuka formulir input lengkap per DC.
          </div>
          <div className="clay-chip-white p-3 border border-white">
            <strong className="text-blue-700 block mb-1 font-bold">2. Mode Edit Cepat (Bulk Edit):</strong>
            Klik tombol "Mode Edit Cepat" untuk mengetik langsung angka forecast di semua kolom tabel secara bersamaan.
          </div>
          <div className="clay-chip-white p-3 border border-white">
            <strong className="text-blue-700 block mb-1 font-bold">3. Set Massal per Wilayah:</strong>
            Gunakan tombol "Set per Wilayah" untuk langsung mengisi kuota forecast ke seluruh DC dalam 1 wilayah sekaligus.
          </div>
        </div>
      </div>

      {/* Active Bulk Edit Banner */}
      {isBulkEditMode && (
        <div className="sticky top-20 z-30 clay-chip-blue text-white px-5 py-3 shadow-lg flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-xs font-bold">
            <Edit3 className="w-4 h-4" />
            <span>Mode Edit Cepat Aktif: Anda dapat langsung mengubah angka pada tabel di bawah.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkEditMode(false)}
              className="px-3.5 py-1 text-xs font-bold text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSaveBulk}
              className="clay-btn-white px-4 py-1.5 text-xs font-bold text-blue-700 shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Simpan Semua Perubahan
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Search & Filters (Multi-Criteria Pill Grid) */}
      <div className="clay-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama DC, kode, kota, atau wilayah..."
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
              <option value="ALL">Semua Jaringan DC ({dcs.length})</option>
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
              <option value="ALL">Semua Wilayah ({regions.length} Zona)</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Allocation Status Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={allocationFilter}
              onChange={e => setAllocationFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status Alokasi Target</option>
              <option value="HAS_TARGET">Sudah Ada Target Alokasi (&gt; 0 Ctn)</option>
              <option value="NO_TARGET">Belum Dialokasikan (0 Ctn)</option>
            </select>
          </div>

          {/* Product Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={productFilter}
              onChange={e => setProductFilter(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Produk Kurma</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>Hanya DC dgn Target: {p.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Rentang Qty Target */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={qtyRangeFilter}
              onChange={e => setQtyRangeFilter(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Kuantiti Target</option>
              <option value="TIER_HIGH">🔥 Target Besar (&ge; 10.000 ctn)</option>
              <option value="TIER_MED">⚡ Target Sedang (3.000 - 9.999 ctn)</option>
              <option value="TIER_LOW">📦 Target Kecil (1 - 2.999 ctn)</option>
              <option value="TIER_ZERO">Belum Ada Target (0 ctn)</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="REGION_TARGET_DESC">🗺️ Wilayah: Target Terbanyak &rarr; Terkecil</option>
              <option value="REGION_TARGET_ASC">🗺️ Wilayah: Target Terkecil &rarr; Terbanyak</option>
              <option value="TARGET_DESC">🎯 Target DC Terbanyak</option>
              <option value="TARGET_ASC">🎯 Target DC Tersedikit</option>
              <option value="NAME_ASC">🏢 Nama DC (A - Z)</option>
              <option value="CODE_ASC">🔢 Kode DC</option>
            </select>
          </div>
        </div>

        {/* Interactive Regional Forecast Ranking Rail */}
        <div className="pt-2 border-t border-white/60 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>Peringkat Target Forecast per Wilayah:</span>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold text-slate-500">Urutkan:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  onClick={() => {
                    setRegionRankingOrder('DESC');
                    setSortBy('REGION_TARGET_DESC');
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    regionRankingOrder === 'DESC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan dari wilayah target terbanyak ke terkecil"
                >
                  Terbanyak &rarr; Terkecil ↓
                </button>
                <button
                  onClick={() => {
                    setRegionRankingOrder('ASC');
                    setSortBy('REGION_TARGET_ASC');
                  }}
                  className={`px-2.5 py-0.5 text-[11px] font-extrabold rounded-md transition-all cursor-pointer ${
                    regionRankingOrder === 'ASC'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Urutkan dari wilayah target terkecil ke terbanyak"
                >
                  Terkecil &rarr; Terbanyak ↑
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            <button
              onClick={() => setRegionFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                regionFilter === 'ALL'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'clay-chip-white text-slate-700 hover:bg-blue-50 border border-white'
              }`}
            >
              Semua Wilayah ({formatNumber(totalForecastAll)} ctn)
            </button>
            {regionalRankingList.map((r, rankIdx) => {
              const isSelected = regionFilter === r.region;
              return (
                <button
                  key={r.region}
                  onClick={() => setRegionFilter(isSelected ? 'ALL' : r.region)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'clay-chip-white text-slate-800 hover:bg-blue-50 border border-white'
                  }`}
                  title={`Filter hanya DC di wilayah ${r.region} (${formatNumber(r.totalForecast)} ctn)`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isSelected ? 'bg-white text-blue-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    #{rankIdx + 1}
                  </span>
                  <span>{r.region}</span>
                  <span className={`text-[11px] font-black px-1.5 py-0.2 rounded-md ${
                    isSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {formatNumber(r.totalForecast)} ctn
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-semibold">
              Menampilkan <strong>{filteredDcs.length}</strong> dari <strong>{dcs.length}</strong> DC
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-800 font-bold">
              Total Target Terfilter: {formatNumber(filteredDcs.reduce((grand, dc) => {
                return grand + products.reduce((pSum, p) => pSum + getForecastValue(dc.id, p.id), 0);
              }, 0))} ctn
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

      {/* Forecast Matrix Table (White Clay Sheet) */}
      <div className="clay-table-sheet overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3.5 text-center w-12">No</th>
                <th className="py-3.5 px-3.5">Jaringan & Titik DC</th>
                <th className="py-3.5 px-3.5">Wilayah & Kota</th>
                {products.map(p => (
                  <th key={p.id} className="py-3.5 px-3.5 text-right font-black text-slate-900">
                    <div>{p.name}</div>
                    <span className="text-[10px] text-slate-500 font-mono font-medium">
                      {p.sku} ({p.unit})
                    </span>
                  </th>
                ))}
                <th className="py-3.5 px-3.5 text-right font-black text-blue-900 bg-blue-50/50">
                  Total Target DC
                </th>
                <th className="py-3.5 px-3.5 text-center w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDcs.map((dc, idx) => {
                let totalDcForecast = 0;

                return (
                  <tr key={dc.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="py-3 px-3.5 text-center font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2.5 h-2.5 rounded-full ${dc.network === 'Indomarco' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                        <span className="font-bold text-slate-900">{dc.name}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono font-medium">
                        {dc.network} · {dc.code}
                      </span>
                    </td>

                    <td className="py-3 px-3.5">
                      <div className="font-bold text-slate-800">{dc.region}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{dc.city}</div>
                    </td>

                    {/* Product Forecast Columns */}
                    {products.map(p => {
                      const val = getForecastValue(dc.id, p.id);
                      totalDcForecast += val;

                      return (
                        <td key={p.id} className="py-3 px-3.5 text-right">
                          {isBulkEditMode ? (
                            <input
                              type="number"
                              min="0"
                              value={val}
                              onChange={e => handleBulkCellChange(dc.id, p.id, e.target.value)}
                              className="w-24 px-2 py-1 text-right text-xs border border-blue-300 rounded-full font-bold bg-white focus:outline-blue-600 shadow-inner"
                            />
                          ) : (
                            <button
                              onClick={() => handleOpenDcModal(dc.id)}
                              className="font-black text-slate-800 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded-full transition-colors text-right w-full cursor-pointer"
                              title="Klik untuk ubah target forecast DC ini"
                            >
                              {formatNumber(val)}
                            </button>
                          )}
                        </td>
                      );
                    })}

                    {/* Total DC */}
                    <td className="py-3 px-3.5 text-right font-black text-blue-900 bg-blue-50/50">
                      {formatNumber(totalDcForecast)} <span className="font-normal text-[10px] text-slate-500">ctn</span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => handleOpenDcModal(dc.id)}
                        className="clay-btn-white px-3 py-1 text-[11px] font-bold text-blue-700 hover:text-blue-900 cursor-pointer shadow-xs"
                        title="Edit Target DC"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Totals Row */}
            <tfoot className="bg-slate-100/80 font-black border-t-2 border-slate-200 text-slate-900">
              <tr>
                <td colSpan={3} className="py-3.5 px-3.5 uppercase tracking-wider text-xs">
                  Total Forecast Nasional ({filteredDcs.length} Titik DC)
                </td>
                {products.map(p => {
                  const colTotal = filteredDcs.reduce((sum, dc) => sum + getForecastValue(dc.id, p.id), 0);
                  return (
                    <td key={p.id} className="py-3.5 px-3.5 text-right font-black text-slate-900 text-sm">
                      {formatNumber(colTotal)}
                    </td>
                  );
                })}
                <td className="py-3.5 px-3.5 text-right font-black text-blue-800 text-sm bg-blue-100/60">
                  {formatNumber(
                    filteredDcs.reduce((grand, dc) => {
                      return grand + products.reduce((pSum, p) => pSum + getForecastValue(dc.id, p.id), 0);
                    }, 0)
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal Single DC Input */}
      <ForecastInputModal
        isOpen={inputModalOpen}
        onClose={() => setInputModalOpen(false)}
        defaultDcId={selectedDcForModal}
      />

      {/* Modal Mass Forecast per Wilayah (Styled with Top Drag Handle & Side-by-side Cancel/Apply Buttons) */}
      {regionalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
            {/* Top Handle Tab Indicator */}
            <div className="pt-3 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
            </div>

            <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Sliders className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Atur Target Serentak per Wilayah
                </h2>
              </div>
              <button
                onClick={() => setRegionalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyRegionalMass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Pilih Wilayah Target
                </label>
                <div className="clay-search-pill px-3.5 py-1.5">
                  <select
                    value={massRegion}
                    onChange={e => setMassRegion(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  >
                    {regions.map(r => {
                      const count = dcs.filter(d => d.region === r).length;
                      return (
                        <option key={r} value={r}>
                          {r} ({count} DC)
                        </option>
                      );
                    })}
                  </select>
                </div>
                <p className="text-[11px] text-slate-500 font-medium mt-1.5">
                  Kuantiti di bawah akan diterapkan ke seluruh DC di wilayah yang dipilih.
                </p>
              </div>

              <div className="space-y-2.5 pt-1">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Target Kuantiti (Karton / DC)
                </label>
                {products.map(p => (
                  <div key={p.id} className="clay-chip-white p-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.name}</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        required
                        value={massQtys[p.id] ?? 0}
                        onChange={e => {
                          const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10));
                          setMassQtys(prev => ({ ...prev, [p.id]: val }));
                        }}
                        className="w-24 px-3 py-1.5 text-right text-xs border border-slate-300 rounded-full font-black bg-slate-50 shadow-inner"
                      />
                      <span className="text-xs text-slate-600 font-bold">ctn</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Side-by-side Cancel and Apply Buttons */}
              <div className="pt-3 grid grid-cols-2 gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRegionalModalOpen(false)}
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

      {/* Modal Add DC */}
      <DCModal
        isOpen={dcModalOpen}
        onClose={() => setDcModalOpen(false)}
      />
    </div>
  );
};

