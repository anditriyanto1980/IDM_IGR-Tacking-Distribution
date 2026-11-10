import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Shipment } from '../types';
import { formatNumber, formatDate } from '../utils/formatters';
import { 
  Plus, 
  Search, 
  Truck, 
  Eye, 
  Edit3, 
  Trash2, 
  Warehouse as WarehouseIcon, 
  Building2, 
  Download,
  Check,
  Clock,
  Filter,
  RotateCcw,
  Calendar,
  MapPin,
  CheckCircle2
} from 'lucide-react';

interface ShipmentListViewProps {
  onOpenShipmentModal: (shipmentToEdit?: Shipment) => void;
  onOpenDetailModal: (shipment: Shipment) => void;
}

export const ShipmentListView: React.FC<ShipmentListViewProps> = ({
  onOpenShipmentModal,
  onOpenDetailModal
}) => {
  const { shipments, products, warehouses, dcs, deleteShipment, exportToCSV } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedNetwork, setSelectedNetwork] = useState('ALL');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Extract unique regions
  const regions = useMemo(() => {
    return Array.from(new Set(dcs.map(d => d.region))).sort();
  }, [dcs]);

  const isFilterActive = useMemo(() => {
    return Boolean(
      searchQuery.trim() ||
      selectedWarehouse !== 'ALL' ||
      selectedProduct !== 'ALL' ||
      selectedNetwork !== 'ALL' ||
      selectedRegion !== 'ALL' ||
      selectedStatus !== 'ALL' ||
      dateFrom ||
      dateTo
    );
  }, [searchQuery, selectedWarehouse, selectedProduct, selectedNetwork, selectedRegion, selectedStatus, dateFrom, dateTo]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedWarehouse('ALL');
    setSelectedProduct('ALL');
    setSelectedNetwork('ALL');
    setSelectedRegion('ALL');
    setSelectedStatus('ALL');
    setDateFrom('');
    setDateTo('');
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter(s => {
      const dc = dcs.find(d => d.id === s.targetDcId);

      if (selectedWarehouse !== 'ALL' && s.sourceWarehouseId !== selectedWarehouse) return false;
      if (selectedProduct !== 'ALL' && s.productId !== selectedProduct) return false;
      if (selectedNetwork !== 'ALL' && dc?.network !== selectedNetwork) return false;
      if (selectedRegion !== 'ALL' && dc?.region !== selectedRegion) return false;
      if (selectedStatus !== 'ALL' && s.status !== selectedStatus) return false;
      if (dateFrom && s.date < dateFrom) return false;
      if (dateTo && s.date > dateTo) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const prod = products.find(p => p.id === s.productId)?.name.toLowerCase() || '';
        const prodSku = products.find(p => p.id === s.productId)?.sku.toLowerCase() || '';
        const dcName = (dc?.name || '').toLowerCase();
        const dcCode = (dc?.code || '').toLowerCase();
        const dcCity = (dc?.city || '').toLowerCase();
        const driver = (s.driverName || '').toLowerCase();
        const nopol = (s.vehicleNumber || '').toLowerCase();
        const so = s.soNumber.toLowerCase();
        const notes = (s.notes || '').toLowerCase();

        const match =
          so.includes(query) ||
          prod.includes(query) ||
          prodSku.includes(query) ||
          dcName.includes(query) ||
          dcCode.includes(query) ||
          dcCity.includes(query) ||
          driver.includes(query) ||
          nopol.includes(query) ||
          notes.includes(query);

        if (!match) return false;
      }
      return true;
    });
  }, [shipments, products, dcs, selectedWarehouse, selectedProduct, selectedNetwork, selectedRegion, selectedStatus, dateFrom, dateTo, searchQuery]);

  const handleDelete = (id: string, soNumber: string) => {
    if (window.confirm(`Yakin ingin membatalkan & menghapus SO "${soNumber}"? Stok barang akan dikembalikan ke gudang asal.`)) {
      const res = deleteShipment(id);
      if (!res.success) {
        alert(res.message);
      }
    }
  };

  const handleExport = () => {
    const rows = filteredShipments.map((s, idx) => {
      const prod = products.find(p => p.id === s.productId);
      const wh = warehouses.find(w => w.id === s.sourceWarehouseId);
      const dc = dcs.find(d => d.id === s.targetDcId);
      return {
        No: idx + 1,
        No_SO: s.soNumber,
        Tanggal: s.date,
        SKU: prod?.sku,
        Nama_Barang: prod?.name,
        Qty: s.qty,
        Satuan: prod?.unit,
        Gudang_Asal: wh?.name,
        Tujuan_DC: dc?.name,
        Jaringan: dc?.network,
        Wilayah: dc?.region,
        Status: s.status,
        Driver: s.driverName || '-',
        No_Polisi: s.vehicleNumber || '-',
        Catatan: s.notes || '-'
      };
    });

    exportToCSV(`Daftar_Pengiriman_SO_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-5 pb-12 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-amber-300 tracking-tight drop-shadow-sm">
            Input & Riwayat Pengiriman (Sales Order)
          </h1>
          <p className="text-xs text-white font-medium mt-0.5 drop-shadow-xs">
            Daftar seluruh surat jalan pengiriman dari gudang ke DC Indomarco & Indogrosir
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            className="clay-btn-white px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={() => onOpenShipmentModal()}
            className="clay-btn-apply px-4 py-2 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>+ Input SO Baru</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar (Comprehensive Multi-Dimensional Filter) */}
      <div className="clay-glass-card p-4 sm:p-5 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pill Search */}
          <div className="relative clay-search-pill flex items-center px-3.5 py-1.5 sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari No SO, SKU, DC tujuan, kota, driver, nopol..."
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            />
          </div>

          {/* Network Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={selectedNetwork}
              onChange={e => setSelectedNetwork(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Jaringan DC</option>
              <option value="Indomarco">DC Indomarco</option>
              <option value="Indogrosir">DC Indogrosir</option>
            </select>
          </div>

          {/* Region Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={selectedRegion}
              onChange={e => setSelectedRegion(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Zona Wilayah</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Warehouse Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={selectedWarehouse}
              onChange={e => setSelectedWarehouse(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Gudang Asal</option>
              {warehouses.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Produk Kurma</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="clay-search-pill px-3 py-1.5">
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">Semua Status Pengiriman</option>
              <option value="Terkirim">Terkirim (Tiba di DC)</option>
              <option value="Dalam Perjalanan">Dalam Perjalanan (On Delivery)</option>
              <option value="Selesai">Selesai (Completed)</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="clay-search-pill px-2.5 py-1.5 flex items-center gap-1.5" title="Filter Tanggal Mulai">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="w-full text-[11px] font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
            <div className="clay-search-pill px-2.5 py-1.5 flex items-center gap-1.5" title="Filter Tanggal Akhir">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="w-full text-[11px] font-semibold text-slate-800 bg-transparent focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Filter Summary & Quick Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-white/60 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-600 font-semibold">
              Menampilkan <strong>{filteredShipments.length}</strong> dari <strong>{shipments.length}</strong> total Surat Jalan
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
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Shipment Table Sheet (White 3D Clay Sheet) */}
      <div className="clay-table-sheet overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3.5">No. SO / Surat Jalan</th>
                <th className="py-3.5 px-3.5">Tanggal</th>
                <th className="py-3.5 px-3.5">Nama Barang</th>
                <th className="py-3.5 px-3.5 text-right">Qty Kirim</th>
                <th className="py-3.5 px-3.5">Gudang Asal</th>
                <th className="py-3.5 px-3.5">Tujuan DC</th>
                <th className="py-3.5 px-3.5 text-center">Status</th>
                <th className="py-3.5 px-3.5">Armada / Driver</th>
                <th className="py-3.5 px-3.5 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500 font-medium">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    Belum ada pengiriman yang sesuai kriteria.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shipment => {
                  const prod = products.find(p => p.id === shipment.productId);
                  const wh = warehouses.find(w => w.id === shipment.sourceWarehouseId);
                  const dc = dcs.find(d => d.id === shipment.targetDcId);

                  return (
                    <tr key={shipment.id} className="hover:bg-blue-50/40 transition-colors">
                      {/* No SO */}
                      <td className="py-3 px-3.5 font-mono font-bold text-slate-900">
                        {shipment.soNumber}
                      </td>

                      {/* Tanggal */}
                      <td className="py-3 px-3.5 text-slate-600 font-medium whitespace-nowrap">
                        {formatDate(shipment.date)}
                      </td>

                      {/* Barang */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900">{prod?.name || '-'}</div>
                        <div className="text-[11px] text-slate-500 font-mono font-medium">{prod?.sku}</div>
                      </td>

                      {/* Qty */}
                      <td className="py-3 px-3.5 text-right font-black text-slate-900 text-sm">
                        {formatNumber(shipment.qty)}{' '}
                        <span className="font-normal text-xs text-slate-500">{prod?.unit || 'ctn'}</span>
                      </td>

                      {/* Gudang Asal */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <WarehouseIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>{wh?.name || '-'}</span>
                        </div>
                      </td>

                      {/* Tujuan DC */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{dc?.name || '-'}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {dc?.network} · {dc?.region}
                        </div>
                      </td>

                      {/* Status (with 3D Badge) */}
                      <td className="py-3 px-3.5 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          shipment.status === 'Terkirim'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {shipment.status === 'Terkirim' ? (
                            <Check className="w-3 h-3 stroke-[3] text-emerald-600" />
                          ) : (
                            <Clock className="w-3 h-3 text-amber-600" />
                          )}
                          {shipment.status}
                        </span>
                      </td>

                      {/* Armada / Driver */}
                      <td className="py-3 px-3.5 text-slate-600 font-medium">
                        <div>{shipment.driverName || '-'}</div>
                        {shipment.vehicleNumber && (
                          <div className="text-[11px] text-slate-400 font-mono">{shipment.vehicleNumber}</div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenDetailModal(shipment)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors cursor-pointer"
                            title="Lihat Surat Jalan"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenShipmentModal(shipment)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-full transition-colors cursor-pointer"
                            title="Edit Pengiriman"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(shipment.id, shipment.soNumber)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            title="Batalkan & Kembalikan Stok"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
