import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart3, 
  Table2, 
  Truck, 
  Warehouse as WarehouseIcon, 
  Package, 
  Target, 
  Building2,
  Plus, 
  ArrowDownRight, 
  RotateCcw
} from 'lucide-react';
import { ClayTruck } from './ClayIcons';

export type ActiveTab = 'dashboard' | 'matrix' | 'shipments' | 'stock' | 'products' | 'forecast' | 'dcs';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenShipmentModal: () => void;
  onOpenStockInModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenShipmentModal,
  onOpenStockInModal
}) => {
  const { shipments, resetToDefaultData, isFirebaseConnected } = useApp();

  const handleReset = () => {
    if (window.confirm('Reset semua data kembali ke default awal sistem?')) {
      resetToDefaultData();
    }
  };

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard Global', icon: BarChart3 },
    { id: 'matrix' as ActiveTab, label: 'Controlling DC', icon: Table2 },
    { id: 'shipments' as ActiveTab, label: 'Riwayat SO', icon: Truck, badge: shipments.length },
    { id: 'stock' as ActiveTab, label: 'Stok Gudang', icon: WarehouseIcon },
    { id: 'products' as ActiveTab, label: 'Master Barang', icon: Package },
    { id: 'dcs' as ActiveTab, label: 'Master DC & Wilayah', icon: Building2 },
    { id: 'forecast' as ActiveTab, label: 'Target Forecast', icon: Target },
  ];

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 pt-3 pb-2 select-none">
      <div className="max-w-7xl mx-auto clay-shell p-4 sm:p-5 text-slate-900">
        {/* Top bar: Brand + Pill Actions (matching the "Multiselect" & "Select all" header style) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand & Title */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-md border border-white p-1">
                <ClayTruck size={42} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    LogiTrack
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-blue-700 shadow-xs border border-white">
                    3D Clay
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs border border-white ${
                    isFirebaseConnected ? 'bg-white text-emerald-700' : 'bg-white text-amber-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {isFirebaseConnected ? 'Firebase Cloud' : 'Connecting Cloud'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold">
                  Distribusi DC Indomarco & Indogrosir Nasional
                </p>
              </div>
            </div>

            {/* Mobile Reset */}
            <button
              onClick={handleReset}
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-full bg-white shadow-xs"
              title="Reset data demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Action buttons (Tactile Clay Pills: Green, Blue, White) */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onOpenStockInModal}
              className="clay-btn-emerald px-4 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Penerimaan stok baru dari pabrik"
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>+ Stok Masuk</span>
            </button>

            <button
              onClick={onOpenShipmentModal}
              className="clay-btn-apply px-4 py-2 text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
              title="Input Sales Order pengiriman ke DC"
            >
              <Plus className="w-4 h-4" />
              <span>+ Input SO Baru</span>
            </button>

            <button
              onClick={handleReset}
              className="hidden sm:flex clay-btn-white p-2 text-slate-600 hover:text-slate-900 transition-all cursor-pointer"
              title="Reset data demo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Segmented Pill Tray for Navigation */}
        <div className="mt-4 clay-tray p-1.5 overflow-x-auto scrollbar-none">
          <nav className="flex space-x-1.5 min-w-max">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-4 py-2 text-xs transition-all flex items-center gap-2 cursor-pointer font-bold rounded-full ${
                    isActive
                      ? 'clay-btn-apply shadow-md'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/30 text-white' : 'bg-white/60 text-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
