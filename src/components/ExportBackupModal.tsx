import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNumber } from '../utils/formatters';
import { 
  X, 
  Download, 
  FileSpreadsheet, 
  Truck, 
  Target, 
  Table2, 
  ShieldCheck, 
  Check, 
  Settings2,
  Calendar,
  Layers,
  Sparkles,
  ArrowDownToLine
} from 'lucide-react';
import { ClayTruck, ClayTarget } from './ClayIcons';

interface ExportBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportBackupModal: React.FC<ExportBackupModalProps> = ({
  isOpen,
  onClose
}) => {
  const { 
    shipments, 
    forecasts, 
    dcs, 
    products, 
    controllingSummaries,
    exportShipmentsData, 
    exportForecastData, 
    exportControllingMatrixData,
    exportAllBackupBundle 
  } = useApp();

  const [delimiter, setDelimiter] = useState<string>(';');
  const [shipmentNetwork, setShipmentNetwork] = useState<string>('ALL');
  const [forecastFormat, setForecastFormat] = useState<'detailed' | 'matrix'>('detailed');
  
  // Feedback states
  const [lastExported, setLastExported] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExportShipments = () => {
    exportShipmentsData({ delimiter, network: shipmentNetwork });
    triggerFeedback('Surat Jalan (SO)');
  };

  const handleExportForecast = () => {
    exportForecastData({ delimiter, format: forecastFormat });
    triggerFeedback('Target Forecast DC');
  };

  const handleExportControlling = () => {
    exportControllingMatrixData({ delimiter });
    triggerFeedback('Matriks Controlling');
  };

  const handleExportAll = () => {
    exportAllBackupBundle(delimiter);
    triggerFeedback('Semua File Backup Lengkap');
  };

  const triggerFeedback = (name: string) => {
    setLastExported(name);
    setTimeout(() => {
      setLastExported(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Handle Tab Indicator */}
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Modal Header */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-md">
              <FileSpreadsheet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Pusat Ekspor & Backup Data (CSV)
                </h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Offline Reporting
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Unduh data operasional logistik ke format CSV untuk analisis offline dan cadangan data (backup)
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

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Success Banner */}
          {lastExported && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>File <strong>{lastExported}</strong> berhasil diekspor dan diunduh ke komputer Anda.</span>
            </div>
          )}

          {/* Quick 1-Click Complete Backup Highlight */}
          <div className="clay-card p-4 sm:p-5 bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-700 text-white border-0 shadow-lg relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-200">
                  <ShieldCheck className="w-4 h-4 text-amber-300" />
                  <span>Cadangan Lengkap Sistem</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Unduh Paket Backup Lengkap (Semua Data)
                </h3>
                <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
                  Mengunduh seluruh file CSV: Riwayat Surat Jalan, Target Forecast Rinci, dan Matriks Controlling secara berurutan dalam satu kali klik.
                </p>
              </div>

              <button
                onClick={handleExportAll}
                className="px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
                <span>Download Semua Backup</span>
              </button>
            </div>
          </div>

          {/* CSV Separator Preference Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Settings2 className="w-4 h-4 text-slate-500" />
              <span>Format Pemisah Kolom (Delimiter):</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <label className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                delimiter === ';' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}>
                <input 
                  type="radio" 
                  name="delimiter" 
                  value=";" 
                  checked={delimiter === ';'} 
                  onChange={() => setDelimiter(';')} 
                  className="sr-only" 
                />
                Titik Koma (;) - Rekomendasi Excel ID
              </label>

              <label className={`px-3 py-1.5 rounded-xl cursor-pointer transition-all border ${
                delimiter === ',' 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}>
                <input 
                  type="radio" 
                  name="delimiter" 
                  value="," 
                  checked={delimiter === ','} 
                  onChange={() => setDelimiter(',')} 
                  className="sr-only" 
                />
                Koma (,) - Standar Google Sheets
              </label>
            </div>
          </div>

          {/* 3 Main Export Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Data Surat Jalan / Shipments */}
            <div className="clay-card p-5 flex flex-col justify-between border border-slate-100 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center p-1">
                      <Truck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Data Surat Jalan (SO)</h4>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {formatNumber(shipments.length)} Riwayat Pengiriman
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold">
                    Shipments
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Laporan seluruh surat jalan kirim dari gudang ke DC, nomor SO, tanggal, armada, driver, produk, dan kuantiti kirim.
                </p>

                {/* Filter Network */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Filter Jaringan:
                  </label>
                  <select
                    value={shipmentNetwork}
                    onChange={e => setShipmentNetwork(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="ALL">Semua Jaringan (IDM & IGR)</option>
                    <option value="Indomarco">Hanya Indomarco</option>
                    <option value="Indogrosir">Hanya Indogrosir</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={handleExportShipments}
                  className="w-full clay-btn-apply py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh CSV Surat Jalan</span>
                </button>
              </div>
            </div>

            {/* Card 2: Data Target Forecast DC */}
            <div className="clay-card p-5 flex flex-col justify-between border border-slate-100 hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center p-1">
                      <Target className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-sm">Data Target Forecast DC</h4>
                      <span className="text-[11px] text-slate-500 font-semibold">
                        {formatNumber(dcs.length)} Titik DC &bull; {formatNumber(forecasts.length)} Alokasi
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                    Forecast
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Data alokasi target awal kirim per DC dan produk, lengkap dengan kuantiti realisasi terkirim, kekurangan, dan persentase capaian.
                </p>

                {/* Format layout selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Format Data:
                  </label>
                  <select
                    value={forecastFormat}
                    onChange={e => setForecastFormat(e.target.value as 'detailed' | 'matrix')}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                  >
                    <option value="detailed">Format Rinci (Relasional per Baris Produk & Status)</option>
                    <option value="matrix">Format Matriks (Kolom per Produk per DC)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <button
                  onClick={handleExportForecast}
                  className="w-full clay-btn-apply py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh CSV Target Forecast</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Controlling Realisasi vs Target Matrix */}
          <div className="clay-card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center p-1 shrink-0">
                <Table2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-sm">
                  Matriks Controlling Realisasi vs Forecast
                </h4>
                <p className="text-xs text-slate-500">
                  Tabel komparatif evaluasi pencapaian pengiriman per DC ({controllingSummaries.length} baris matriks)
                </p>
              </div>
            </div>

            <button
              onClick={handleExportControlling}
              className="clay-btn-white px-5 py-2 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs shrink-0"
            >
              <Download className="w-4 h-4 text-purple-600" />
              <span>Unduh CSV Matriks Controlling</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            File kompatibel dengan Microsoft Excel, Google Sheets, LibreOffice Calc, dan Tableau/PowerBI.
          </span>
          <button
            onClick={onClose}
            className="clay-btn-white px-4 py-1.5 font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
