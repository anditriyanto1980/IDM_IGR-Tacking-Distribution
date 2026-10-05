import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Shipment } from '../types';
import { formatNumber } from '../utils/formatters';
import { X, Truck, AlertTriangle, CheckCircle2, Warehouse as WarehouseIcon, Building2, Package } from 'lucide-react';

interface ShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editShipment?: Shipment | null;
  defaultDcId?: string;
  defaultProductId?: string;
}

export const ShipmentModal: React.FC<ShipmentModalProps> = ({
  isOpen,
  onClose,
  editShipment,
  defaultDcId,
  defaultProductId,
}) => {
  const { products, warehouses, dcs, forecasts, shipments, getStock, addShipment, updateShipment } = useApp();

  const [soNumber, setSoNumber] = useState('');
  const [date, setDate] = useState('');
  const [productId, setProductId] = useState('');
  const [sourceWarehouseId, setSourceWarehouseId] = useState('');
  const [targetDcId, setTargetDcId] = useState('');
  const [qty, setQty] = useState<number | ''>('');
  const [status, setStatus] = useState<'Terkirim' | 'Dalam Perjalanan'>('Terkirim');
  const [notes, setNotes] = useState('');
  const [driverName, setDriverName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-generate SO number helper
  const generateNewSoNumber = (network: string = 'IDM') => {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(100 + Math.random() * 900);
    return `SO/${network}/${yy}${mm}/${random}`;
  };

  useEffect(() => {
    if (!isOpen) return;

    if (editShipment) {
      setSoNumber(editShipment.soNumber);
      setDate(editShipment.date);
      setProductId(editShipment.productId);
      setSourceWarehouseId(editShipment.sourceWarehouseId);
      setTargetDcId(editShipment.targetDcId);
      setQty(editShipment.qty);
      setStatus(editShipment.status === 'Dalam Perjalanan' ? 'Dalam Perjalanan' : 'Terkirim');
      setNotes(editShipment.notes || '');
      setDriverName(editShipment.driverName || '');
      setVehicleNumber(editShipment.vehicleNumber || '');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      const chosenProd = defaultProductId || (products[0]?.id ?? '');
      setProductId(chosenProd);
      setSourceWarehouseId(warehouses[0]?.id ?? '');
      const chosenDc = defaultDcId || (dcs[0]?.id ?? '');
      setTargetDcId(chosenDc);
      setQty('');
      setStatus('Terkirim');
      setNotes('');
      setDriverName('');
      setVehicleNumber('');

      const targetDcObj = dcs.find(d => d.id === chosenDc);
      const prefix = targetDcObj?.network === 'Indogrosir' ? 'IGR' : 'IDM';
      setSoNumber(generateNewSoNumber(prefix));
    }
    setErrorMessage('');
  }, [isOpen, editShipment, defaultDcId, defaultProductId, products, warehouses, dcs]);

  // When target DC changes, optionally update SO prefix
  const handleDcChange = (newDcId: string) => {
    setTargetDcId(newDcId);
    if (!editShipment) {
      const dcObj = dcs.find(d => d.id === newDcId);
      const prefix = dcObj?.network === 'Indogrosir' ? 'IGR' : 'IDM';
      setSoNumber(generateNewSoNumber(prefix));
    }
  };

  if (!isOpen) return null;

  // Selected details
  const selectedProduct = products.find(p => p.id === productId);
  const selectedWarehouse = warehouses.find(w => w.id === sourceWarehouseId);
  const selectedDc = dcs.find(d => d.id === targetDcId);

  // Available stock in selected warehouse
  const rawStock = selectedWarehouse && selectedProduct ? getStock(selectedWarehouse.id, selectedProduct.id) : 0;
  // If editing, add back current shipment qty to see effective available stock
  const effectiveAvailableStock = editShipment && editShipment.sourceWarehouseId === sourceWarehouseId && editShipment.productId === productId
    ? rawStock + editShipment.qty
    : rawStock;

  // Forecast for this DC & Product
  const targetForecast = forecasts.find(f => f.dcId === targetDcId && f.productId === productId)?.forecastQty || 0;
  
  // Total previously sent to this DC for this product (excluding this shipment if editing)
  const currentSentToDc = shipments
    .filter(s => s.targetDcId === targetDcId && s.productId === productId && (!editShipment || s.id !== editShipment.id))
    .reduce((sum, s) => sum + s.qty, 0);

  const remainingForecastForDc = Math.max(0, targetForecast - currentSentToDc);
  const inputQtyNum = typeof qty === 'number' ? qty : 0;
  const isStockInsufficient = inputQtyNum > effectiveAvailableStock;
  const isExceedingForecast = inputQtyNum > remainingForecastForDc && remainingForecastForDc > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!soNumber.trim()) {
      setErrorMessage('Nomor Surat Jalan (SO) wajib diisi.');
      return;
    }
    if (!date) {
      setErrorMessage('Tanggal pengiriman wajib diisi.');
      return;
    }
    if (!productId) {
      setErrorMessage('Pilih barang yang dikirim.');
      return;
    }
    if (!sourceWarehouseId) {
      setErrorMessage('Pilih gudang asal barang.');
      return;
    }
    if (!targetDcId) {
      setErrorMessage('Pilih tujuan DC pengiriman.');
      return;
    }
    if (!qty || Number(qty) <= 0) {
      setErrorMessage('Jumlah quantity pengiriman harus lebih dari 0.');
      return;
    }

    if (isStockInsufficient) {
      setErrorMessage(`Stok tidak mencukupi! Stok gudang tersedia hanya ${formatNumber(effectiveAvailableStock)} ${selectedProduct?.unit || 'ctn'}.`);
      return;
    }

    if (editShipment) {
      const res = updateShipment(editShipment.id, {
        soNumber: soNumber.trim(),
        date,
        productId,
        qty: Number(qty),
        sourceWarehouseId,
        targetDcId,
        status,
        notes: notes.trim(),
        driverName: driverName.trim(),
        vehicleNumber: vehicleNumber.trim()
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal mengubah Surat Jalan.');
        return;
      }
    } else {
      const res = addShipment({
        soNumber: soNumber.trim(),
        date,
        productId,
        qty: Number(qty),
        sourceWarehouseId,
        targetDcId,
        status,
        notes: notes.trim(),
        driverName: driverName.trim(),
        vehicleNumber: vehicleNumber.trim()
      });
      if (!res.success) {
        setErrorMessage(res.message || 'Gagal menyimpan Surat Jalan.');
        return;
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-[28px] shadow-2xl border border-white/20 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-700 text-white flex items-center justify-center font-bold shadow-md border border-white/30">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editShipment ? 'Edit Pengiriman / Surat Jalan' : 'Input Pengiriman Baru (Sales Order)'}
              </h2>
              <p className="text-xs text-slate-500">
                Pengurangan stok gudang otomatis & update realisasi forecast DC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Row 1: No SO & Tanggal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Nomor Surat Jalan (SO) <span className="text-red-500">*</span>
                </label>
                {!editShipment && (
                  <button
                    type="button"
                    onClick={() => {
                      const prefix = selectedDc?.network === 'Indogrosir' ? 'IGR' : 'IDM';
                      setSoNumber(generateNewSoNumber(prefix));
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Generate No
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                value={soNumber}
                onChange={e => setSoNumber(e.target.value)}
                placeholder="Contoh: SO/IDM/2604/101"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-blue-600 focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Pengiriman <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-blue-600 focus:border-blue-600"
              />
            </div>
          </div>

          {/* Row 2: Barang & Qty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Barang <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-blue-600 focus:border-blue-600"
                >
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>
              {selectedProduct && (
                <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Package className="w-3 h-3 text-slate-400" />
                  <span>Kemasan: {selectedProduct.packSize} · Satuan: {selectedProduct.unit}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jumlah Kirim ({selectedProduct?.unit || 'Karton'}) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={qty}
                onChange={e => setQty(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10)))}
                placeholder="0"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-blue-600 font-semibold ${
                  isStockInsufficient
                    ? 'border-red-400 bg-red-50/50 text-red-900 focus:border-red-500'
                    : 'border-slate-300 text-slate-900 focus:border-blue-600'
                }`}
              />
              <div className="mt-1 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  Forecast DC ini: <strong className="text-slate-700">{formatNumber(targetForecast)}</strong>
                </span>
                <span className={remainingForecastForDc > 0 ? 'text-blue-700 font-medium' : 'text-slate-500'}>
                  Sisa Forecast: {formatNumber(remainingForecastForDc)}
                </span>
              </div>
            </div>
          </div>

          {/* Row 3: Gudang Asal & Tujuan DC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gudang Asal Pengiriman <span className="text-red-500">*</span>
              </label>
              <select
                value={sourceWarehouseId}
                onChange={e => setSourceWarehouseId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-blue-600 focus:border-blue-600"
              >
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>

              {/* Live stock indicator for source warehouse */}
              <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5">
                    <WarehouseIcon className="w-3.5 h-3.5 text-slate-500" />
                    Stok Tersedia di Gudang Ini:
                  </span>
                  <span className={`font-bold ${effectiveAvailableStock <= 500 ? 'text-amber-600' : 'text-slate-900'}`}>
                    {formatNumber(effectiveAvailableStock)} {selectedProduct?.unit || 'ctn'}
                  </span>
                </div>
                {isStockInsufficient && (
                  <p className="text-[11px] text-red-600 mt-1 font-medium">
                    ⚠️ Stok gudang kurang {formatNumber(inputQtyNum - effectiveAvailableStock)} {selectedProduct?.unit || 'ctn'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tujuan DC Kirim <span className="text-red-500">*</span>
              </label>
              <select
                value={targetDcId}
                onChange={e => handleDcChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-blue-600 focus:border-blue-600"
              >
                <optgroup label="DC Indomarco (Nasional)">
                  {dcs
                    .filter(d => d.network === 'Indomarco')
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.region} - {d.city})
                      </option>
                    ))}
                </optgroup>
                <optgroup label="DC Indogrosir (Nasional)">
                  {dcs
                    .filter(d => d.network === 'Indogrosir')
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.region} - {d.city})
                      </option>
                    ))}
                </optgroup>
              </select>

              {/* Target DC controlling context */}
              {selectedDc && (
                <div className="mt-2 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      Realisasi DC Ini:
                    </span>
                    <span className="font-semibold text-slate-800">
                      {formatNumber(currentSentToDc)} / {formatNumber(targetForecast)} ({targetForecast > 0 ? ((currentSentToDc / targetForecast) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                  {isExceedingForecast && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ℹ️ Kiriman ini akan melampaui forecast DC sebanyak +{formatNumber(inputQtyNum - remainingForecastForDc)} {selectedProduct?.unit || 'ctn'}.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Row 4: Status Pengiriman & Info Driver/Kendaraan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Pengiriman
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-blue-600 focus:border-blue-600"
              >
                <option value="Terkirim">Terkirim (Delivered / Selesai)</option>
                <option value="Dalam Perjalanan">Dalam Perjalanan (In Transit)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Driver / Ekspedisi (Opsional)
              </label>
              <input
                type="text"
                value={driverName}
                onChange={e => setDriverName(e.target.value)}
                placeholder="Contoh: Pak Joko / Siba Surya"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                No. Polisi / Truk (Opsional)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={e => setVehicleNumber(e.target.value)}
                placeholder="Contoh: B 9482 UDF"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-blue-600"
              />
            </div>
          </div>

          {/* Row 5: Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pengiriman / Keterangan PO (Opsional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Contoh: PO Reguler Indomarco No 8991 - Pengiriman Tahap 2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-blue-600"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {isStockInsufficient ? (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Stok gudang tidak mencukupi
              </span>
            ) : (
              <span className="text-slate-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Stok gudang siap dikurangi {formatNumber(inputQtyNum)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isStockInsufficient || !inputQtyNum}
              className="clay-btn-primary px-5 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <Truck className="w-4 h-4" />
              <span>{editShipment ? 'Simpan Perubahan' : 'Proses & Kurangi Stok'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
