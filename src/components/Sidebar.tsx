import React from 'react';
import { 
  Home, 
  Table2, 
  Truck, 
  Warehouse, 
  Package, 
  Target, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { shipments, resetToDefaultData } = useApp();

  const handleReset = () => {
    if (window.confirm('Reset semua data kembali ke default awal sistem?')) {
      resetToDefaultData();
    }
  };

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'matrix', label: 'Controlling DC', icon: Table2 },
    { id: 'shipments', label: 'Riwayat SO', icon: Truck },
    { id: 'stock', label: 'Stok Gudang', icon: Warehouse },
    { id: 'products', label: 'Master Barang', icon: Package },
    { id: 'forecast', label: 'Target Forecast', icon: Target },
  ];

  return (
    <aside className="w-16 sm:w-20 dash-sidebar shrink-0 min-h-screen py-5 flex flex-col items-center justify-between select-none z-30">
      {/* Top Brand Logo */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => setActiveTab('dashboard')}
          className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          title="LogiTrack DC - Dashboard"
        >
          {/* Stylized J / Truck mark */}
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-black text-sm shadow-sm">
            L
          </div>
        </button>

        {/* Navigation Icon List */}
        <nav className="flex flex-col items-center gap-3">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
                  isActive
                    ? 'bg-[#e7fe3f] text-slate-900 shadow-md font-bold'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />

                {/* Tooltip on hover */}
                <div className="absolute left-16 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
                  {item.label}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Settings / Reset */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleReset}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white/70 hover:bg-white/15 hover:text-white transition-all cursor-pointer group relative"
          title="Reset Data Demo"
        >
          <RotateCcw className="w-4 h-4" />
          <div className="absolute left-16 bg-slate-900 text-white text-xs font-semibold px-2.5 py-1 rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
            Reset Data
          </div>
        </button>
      </div>
    </aside>
  );
};
