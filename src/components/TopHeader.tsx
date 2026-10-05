import React, { useState } from 'react';
import { Search, Bell, Mail, ChevronDown, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface TopHeaderProps {
  onSearchGlobal?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onSearchGlobal }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearchGlobal) onSearchGlobal(e.target.value);
  };

  return (
    <header className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 select-none">
      {/* Search Input Pill (Matching Reference) */}
      <div className="relative dash-search-pill flex items-center px-4 py-2.5 w-full sm:max-w-md">
        <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Cari Surat Jalan, DC Tujuan, Nama Barang..."
          className="w-full text-xs sm:text-sm font-medium text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400"
        />
      </div>

      {/* Right Controls: Notifications, Messages, User Profile */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
        {/* Bell Notification */}
        <button
          className="dash-circle-btn relative text-slate-600 hover:text-slate-900 cursor-pointer"
          title="Notifikasi Pengiriman"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2.5 right-2.5 ring-2 ring-white" />
        </button>

        {/* Message / Envelope */}
        <button
          className="dash-circle-btn text-slate-600 hover:text-slate-900 cursor-pointer"
          title="Pesan & Memo Distribusi"
        >
          <Mail className="w-4 h-4" />
        </button>

        {/* User Profile Pill */}
        <div className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full bg-white border border-slate-200 shadow-xs cursor-pointer hover:bg-slate-50 transition-colors">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white">
            AT
          </div>
          <div className="text-left hidden sm:block pr-1">
            <div className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1">
              <span>Admin Logistik</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
            <span className="text-[10px] text-slate-500 font-medium block">
              National Controller
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
