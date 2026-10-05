import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { DistributionCenter, DCNetwork, StandardRegion } from '../types';
import { X, Building2, MapPin, Globe, Check, AlertCircle, Sparkles } from 'lucide-react';

interface DCModalProps {
  isOpen: boolean;
  onClose: () => void;
  editDC?: DistributionCenter | null;
  defaultNetwork?: DCNetwork;
  defaultRegion?: string;
}

const PREDEFINED_REGIONS: StandardRegion[] = [
  'Jabodetabek',
  'Jawa Barat',
  'Jawa Tengah & DIY',
  'Jawa Timur',
  'Sumatera',
  'Bali & Nusa Tenggara',
  'Sulawesi',
  'Kalimantan',
  'Maluku & Papua',
];

export const DCModal: React.FC<DCModalProps> = ({
  isOpen,
  onClose,
  editDC,
  defaultNetwork = 'Indomarco',
  defaultRegion = 'Jabodetabek'
}) => {
  const { dcs, products, addDC, updateDC } = useApp();

  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [network, setNetwork] = useState<DCNetwork>(defaultNetwork);
  const [selectedRegion, setSelectedRegion] = useState<string>(defaultRegion);
  const [customRegion, setCustomRegion] = useState('');
  const [isCustomRegion, setIsCustomRegion] = useState(false);
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [initialForecasts, setInitialForecasts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // Collect all unique existing regions in database
  const allExistingRegions = Array.from(
    new Set([...PREDEFINED_REGIONS, ...dcs.map(d => d.region)])
  ).filter(Boolean);

  useEffect(() => {
    if (editDC) {
      setCode(editDC.code);
      setName(editDC.name);
      setNetwork(editDC.network);
      setCity(editDC.city);
      setAddress(editDC.address || '');
      
      if (allExistingRegions.includes(editDC.region)) {
        setSelectedRegion(editDC.region);
        setIsCustomRegion(false);
        setCustomRegion('');
      } else {
        setSelectedRegion('CUSTOM');
        setIsCustomRegion(true);
        setCustomRegion(editDC.region);
      }
    } else {
      // Auto-suggest next code
      const prefix = network === 'Indomarco' ? 'DC-IDM-' : 'DC-IGR-';
      const num = dcs.filter(d => d.network === network).length + 1;
      setCode(`${prefix}${String(num).padStart(3, '0')}`);
      setName('');
      setNetwork(defaultNetwork);
      setSelectedRegion(defaultRegion);
      setIsCustomRegion(false);
      setCustomRegion('');
      setCity('');
      setAddress('');

      // Blank initial forecasts
      const initFc: Record<string, number> = {};
      products.forEach(p => {
        initFc[p.id] = 0;
      });
      setInitialForecasts(initFc);
    }
    setError(null);
  }, [editDC, isOpen, defaultNetwork, defaultRegion]);

  // When network changes in add mode, update suggested code prefix
  const handleNetworkChange = (net: DCNetwork) => {
    setNetwork(net);
    if (!editDC) {
      const prefix = net === 'Indomarco' ? 'DC-IDM-' : 'DC-IGR-';
      const num = dcs.filter(d => d.network === net).length + 1;
      setCode(`${prefix}${String(num).padStart(3, '0')}`);
    }
  };

  const handleRegionDropdownChange = (val: string) => {
    if (val === 'CUSTOM') {
      setIsCustomRegion(true);
      setSelectedRegion('CUSTOM');
    } else {
      setIsCustomRegion(false);
      setSelectedRegion(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const cleanCity = city.trim();
    const finalRegion = (isCustomRegion ? customRegion.trim() : selectedRegion.trim());

    if (!cleanCode) {
      setError('Kode DC tidak boleh kosong.');
      return;
    }
    if (!cleanName) {
      setError('Nama DC tidak boleh kosong.');
      return;
    }
    if (!finalRegion) {
      setError('Wilayah distribusi wajib dipilih atau diisi.');
      return;
    }
    if (!cleanCity) {
      setError('Kota / Lokasi DC wajib diisi.');
      return;
    }

    if (editDC) {
      const res = updateDC(editDC.id, {
        code: cleanCode,
        name: cleanName,
        network,
        region: finalRegion,
        city: cleanCity,
        address: address.trim()
      });
      if (!res.success) {
        setError(res.message || 'Gagal memperbarui DC.');
        return;
      }
    } else {
      const res = addDC({
        code: cleanCode,
        name: cleanName,
        network,
        region: finalRegion,
        city: cleanCity,
        address: address.trim()
      }, initialForecasts);

      if (!res.success) {
        setError(res.message || 'Gagal menambahkan DC.');
        return;
      }
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="clay-glass-card w-full max-w-xl max-h-[92vh] overflow-y-auto flex flex-col shadow-2xl border border-white/80"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/60 sticky top-0 bg-white/90 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {editDC ? 'Edit Data Distribution Center (DC)' : 'Tambah DC & Wilayah Baru'}
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                {editDC ? `Perbarui informasi ${editDC.name}` : 'Daftarkan titik DC baru beserta wilayah distribusinya ke sistem'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="clay-chip-red p-3 flex items-center gap-2 text-xs font-semibold text-rose-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Jaringan Network Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Jaringan Distribusi (Network) <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleNetworkChange('Indomarco')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  network === 'Indomarco'
                    ? 'bg-blue-500 text-white border-blue-400 shadow-md ring-2 ring-blue-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs">DC Indomarco</div>
                  <div className={`text-[11px] ${network === 'Indomarco' ? 'text-blue-100' : 'text-slate-500'}`}>
                    Indomarco Prismatama
                  </div>
                </div>
                {network === 'Indomarco' && <Check className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => handleNetworkChange('Indogrosir')}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  network === 'Indogrosir'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-md ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="font-extrabold text-xs">DC Indogrosir</div>
                  <div className={`text-[11px] ${network === 'Indogrosir' ? 'text-amber-100' : 'text-slate-500'}`}>
                    Indogrosir Wholesale
                  </div>
                </div>
                {network === 'Indogrosir' && <Check className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>

          {/* Kode DC & Nama DC */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kode DC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="misal: DC-IDM-BDG2"
                className="clay-search-pill w-full px-3 py-2 text-xs font-mono font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Format standar: DC-IDM-XXX atau DC-IGR-XXX</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nama Lengkap DC <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="misal: DC Indomarco Bandung 2"
                className="clay-search-pill w-full px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Wilayah (Region) Selection & Custom Region */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>Wilayah Distribusi (Region)</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[10px] text-blue-700 font-semibold bg-blue-100 px-2 py-0.5 rounded-full">
                {allExistingRegions.length} Wilayah Terdaftar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <select
                  value={isCustomRegion ? 'CUSTOM' : selectedRegion}
                  onChange={e => handleRegionDropdownChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold text-slate-800 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <optgroup label="Wilayah Standar & Terdaftar">
                    {allExistingRegions.map(reg => (
                      <option key={reg} value={reg}>
                        {reg}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Kustom / Wilayah Baru">
                    <option value="CUSTOM">+ Ketik Wilayah Baru Lainnya...</option>
                  </optgroup>
                </select>
              </div>

              {isCustomRegion && (
                <div>
                  <input
                    type="text"
                    value={customRegion}
                    onChange={e => setCustomRegion(e.target.value)}
                    placeholder="Ketik nama wilayah baru (misal: Banten)"
                    className="w-full px-3 py-2 text-xs font-bold text-blue-900 bg-white border-2 border-blue-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 animate-fadeIn"
                    autoFocus
                    required
                  />
                  <span className="text-[10px] text-blue-600 font-medium block mt-0.5">
                    Wilayah baru akan langsung masuk ke filter dan laporan sistem.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Kota & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500" />
                <span>Kota / Kabupaten</span> <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="misal: Bandung, Cimahi, Samarinda"
                className="clay-search-pill w-full px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Alamat / Keterangan Lokasi (Opsional)
              </label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="misal: Kawasan Industri Cimareme Blok A-4"
                className="clay-search-pill w-full px-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Initial Forecast Target Input (Only when creating new DC) */}
          {!editDC && products.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Target Alokasi Forecast Awal (Karton)</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">
                  Bisa diisi sekarang atau diatur nanti di Target Forecast
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                {products.map(prod => (
                  <div key={prod.id} className="flex items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-100">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-800 truncate" title={prod.name}>
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {prod.sku}
                      </div>
                    </div>
                    <div className="w-24 shrink-0">
                      <input
                        type="number"
                        min="0"
                        value={initialForecasts[prod.id] || ''}
                        onChange={e => {
                          const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                          setInitialForecasts(prev => ({ ...prev, [prod.id]: val }));
                        }}
                        placeholder="0 Ctn"
                        className="w-full text-right px-2 py-1 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/60">
            <button
              type="button"
              onClick={onClose}
              className="clay-btn-white px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="clay-btn-apply px-5 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editDC ? 'Simpan Perubahan DC' : 'Simpan & Daftarkan DC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
