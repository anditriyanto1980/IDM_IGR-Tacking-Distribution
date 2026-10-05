import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Warehouse } from '../types';
import { X, Warehouse as WarehouseIcon, MapPin, Building2, Check, AlertCircle, Sparkles } from 'lucide-react';

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  editWarehouse?: Warehouse | null;
}

export const WarehouseModal: React.FC<WarehouseModalProps> = ({
  isOpen,
  onClose,
  editWarehouse
}) => {
  const { warehouses, addWarehouse, updateWarehouse } = useApp();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editWarehouse) {
      setName(editWarehouse.name);
      setCode(editWarehouse.code);
      setLocation(editWarehouse.location);
      setIsMain(Boolean(editWarehouse.isMain));
    } else {
      // Auto-suggest warehouse code based on existing count
      const nextNum = warehouses.length + 1;
      const suggestedCode = `WH-0${nextNum}`;
      setName('');
      setCode(suggestedCode);
      setLocation('');
      setIsMain(warehouses.length === 0);
    }
    setError('');
  }, [isOpen, editWarehouse, warehouses.length]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();
    const cleanLocation = location.trim();

    if (!cleanName) {
      setError('Nama gudang wajib diisi');
      return;
    }
    if (!cleanCode) {
      setError('Kode gudang wajib diisi');
      return;
    }
    if (!cleanLocation) {
      setError('Lokasi / Alamat gudang wajib diisi');
      return;
    }

    // Check code uniqueness
    const duplicate = warehouses.find(
      w => w.code.toUpperCase() === cleanCode && w.id !== editWarehouse?.id
    );
    if (duplicate) {
      setError(`Kode gudang "${cleanCode}" sudah digunakan oleh ${duplicate.name}`);
      return;
    }

    if (editWarehouse) {
      updateWarehouse(editWarehouse.id, {
        name: cleanName,
        code: cleanCode,
        location: cleanLocation,
        isMain
      });
    } else {
      addWarehouse({
        name: cleanName,
        code: cleanCode,
        location: cleanLocation,
        isMain
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Handle Tab Indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <WarehouseIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {editWarehouse ? 'Edit Data Gudang' : 'Tambah Gudang Baru'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {editWarehouse ? 'Perbarui informasi titik gudang logistik' : 'Daftarkan titik simpan & pabrik asal baru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Nama Gudang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nama Gudang / Fasilitas <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="cth: Gudang Utama Cikarang atau DC Penyangga Sidoarjo"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Kode Gudang */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Kode Gudang (Singkatan / ID) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="cth: WH-CKR-01"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white uppercase"
              required
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Digunakan sebagai kode referensi pada Surat Jalan dan mutasi stok.
            </p>
          </div>

          {/* Lokasi / Alamat */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Lokasi & Alamat Gudang <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="cth: Kawasan Industri GIIC Cikarang Blok AB-12, Bekasi"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Pabrik / Gudang Utama Checkbox */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
            <input
              type="checkbox"
              id="isMainCheckbox"
              checked={isMain}
              onChange={e => setIsMain(e.target.checked)}
              className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="isMainCheckbox" className="cursor-pointer">
              <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <span>Tandai sebagai Gudang / Pabrik Utama</span>
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              </span>
              <p className="text-[11px] text-blue-700 font-medium mt-0.5 leading-relaxed">
                Gudang utama akan menjadi pilihan *default* saat pembuatan Surat Jalan dan pencatatan penerimaan pasokan barang.
              </p>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-white px-4 py-2 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-apply px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{editWarehouse ? 'Simpan Perubahan' : 'Tambah Gudang'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
