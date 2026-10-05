import React from 'react';
import { useApp } from '../context/AppContext';
import { Shipment } from '../types';
import { formatNumber, formatDate } from '../utils/formatters';
import { X, Printer, Truck, Building2, Warehouse as WarehouseIcon, Calendar, Check } from 'lucide-react';

interface ShipmentDetailModalProps {
  shipment: Shipment | null;
  onClose: () => void;
}

export const ShipmentDetailModal: React.FC<ShipmentDetailModalProps> = ({ shipment, onClose }) => {
  const { products, warehouses, dcs } = useApp();

  if (!shipment) return null;

  const product = products.find(p => p.id === shipment.productId);
  const warehouse = warehouses.find(w => w.id === shipment.sourceWarehouseId);
  const dc = dcs.find(d => d.id === shipment.targetDcId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/80 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150 print:m-0 print:border-none print:shadow-none">
        {/* Top Handle Tab Indicator */}
        <div className="pt-3 pb-1 flex justify-center print:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 shadow-inner" />
        </div>

        {/* Modal Top Bar */}
        <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-bold shadow-md">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Detail Surat Jalan (SO)</h3>
              <p className="text-xs text-slate-500 font-medium">Dokumen resmi pengiriman barang logistik</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="clay-btn-white px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Delivery Order (Surat Jalan) Card */}
        <div className="p-7 space-y-5 bg-white text-slate-900">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-black text-blue-700">Surat Jalan / Delivery Order</span>
              <h1 className="text-2xl font-black text-slate-900 mt-0.5">{shipment.soNumber}</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Sistem Distribusi Logistik DC Nasional</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                {shipment.status}
              </div>
              <p className="text-xs text-slate-600 font-semibold mt-2 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(shipment.date)}
              </p>
            </div>
          </div>

          {/* Logistics Origin & Destination (Stylized Clay Chips) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="clay-chip-white p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                <WarehouseIcon className="w-3.5 h-3.5 text-blue-600" />
                Gudang Asal (Pengirim)
              </div>
              <p className="font-black text-slate-900 text-sm">{warehouse?.name || 'Gudang Pusat'}</p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">{warehouse?.location || '-'}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-mono font-bold">Kode: {warehouse?.code}</p>
            </div>

            <div className="clay-chip-white p-4 border border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                Tujuan Pengiriman (Penerima)
              </div>
              <p className="font-black text-slate-900 text-sm">{dc?.name || 'DC Tujuan'}</p>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Jaringan: {dc?.network} · Wilayah: {dc?.region}</p>
              <p className="text-[11px] text-slate-400 mt-1 font-semibold">Kota: {dc?.city}</p>
            </div>
          </div>

          {/* Item Table Sheet */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">No</th>
                  <th className="py-2.5 px-4">Kode SKU</th>
                  <th className="py-2.5 px-4">Nama Barang</th>
                  <th className="py-2.5 px-4">Kemasan</th>
                  <th className="py-2.5 px-4 text-right">Jumlah Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 font-mono text-slate-400 font-bold">1</td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">{product?.sku || '-'}</td>
                  <td className="py-3 px-4 font-black text-slate-900">{product?.name || 'Barang'}</td>
                  <td className="py-3 px-4 text-slate-600 font-medium">{product?.packSize || '-'}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900 text-sm">
                    {formatNumber(shipment.qty)} <span className="font-normal text-xs text-slate-500">{product?.unit || 'ctn'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Transport details */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-500 font-semibold">Driver / Ekspedisi:</span>
              <p className="font-bold text-slate-800">{shipment.driverName || 'Armada Logistik Internal'}</p>
              <span className="text-slate-500 font-semibold block mt-2">No. Polisi Kendaraan:</span>
              <p className="font-bold text-slate-800 font-mono">{shipment.vehicleNumber || '-'}</p>
            </div>
            <div>
              <span className="text-slate-500 font-semibold">Catatan / Referensi:</span>
              <p className="text-slate-700 mt-1 font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-200 min-h-[50px]">
                {shipment.notes || 'Tidak ada catatan tambahan.'}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p className="text-slate-500 font-medium mb-10">Petugas Gudang (Pengirim)</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1.5 mx-4">( .............................. )</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-10">Driver / Ekspedisi</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1.5 mx-4">{shipment.driverName ? `( ${shipment.driverName} )` : '( .............................. )'}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium mb-10">Penerima DC</p>
              <p className="font-bold text-slate-900 border-t border-slate-300 pt-1.5 mx-4">( .............................. )</p>
            </div>
          </div>
        </div>

        {/* Footer: Side-by-side Cancel and Print */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5 print:hidden">
          <button
            onClick={onClose}
            className="clay-btn-white px-5 py-2 text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={handlePrint}
            className="clay-btn-apply px-5 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Dokumen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
