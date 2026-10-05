import { Product, Warehouse, DistributionCenter, ForecastItem, Shipment, WarehouseStock, StockMutation } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'AKR-200G',
    name: 'Akram Khalas 200g',
    unit: 'Karton (Ctn)',
    packSize: '24 x 200g',
    minStockAlert: 2000,
    description: 'Kurma premium Akram varian Khalas kemasan pouch 200g.'
  },
  {
    id: 'prod-2',
    sku: 'DCK-250G',
    name: 'DC Khalas Rigid 250g',
    unit: 'Karton (Ctn)',
    packSize: '24 x 250g',
    minStockAlert: 1500,
    description: 'Kurma premium DC varian Khalas kemasan rigid box 250g.'
  },
  {
    id: 'prod-3',
    sku: 'ASP-PACK',
    name: 'Akram Share Pack',
    unit: 'Karton (Ctn)',
    packSize: '12 x 500g',
    minStockAlert: 1200,
    description: 'Paket berbagi kurma Akram kemasan family share pack.'
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: 'wh-1',
    code: 'WH-CKR-01',
    name: 'Gudang Pusat Cikarang (Plant Hub)',
    location: 'Kawasan Industri GIIC Cikarang, Bekasi',
    isMain: true
  },
  {
    id: 'wh-2',
    code: 'WH-SBY-02',
    name: 'Gudang Regional Surabaya (East Hub)',
    location: 'Kawasan Pergudangan Margomulyo, Surabaya',
    isMain: false
  },
  {
    id: 'wh-3',
    code: 'WH-MDN-03',
    name: 'Gudang Hub Medan (Sumatera Hub)',
    location: 'Kawasan Industri KIM 2 Mabar, Medan',
    isMain: false
  }
];

export const INITIAL_DCS: DistributionCenter[] = [
  // DC Indomarco
  { id: 'dc-idm-01', code: 'DC-IDM-JKT', name: 'DC Indomarco Ancol', network: 'Indomarco', region: 'Jabodetabek', city: 'Jakarta Utara' },
  { id: 'dc-idm-02', code: 'DC-IDM-TGR', name: 'DC Indomarco Tangerang 1', network: 'Indomarco', region: 'Jabodetabek', city: 'Tangerang' },
  { id: 'dc-idm-03', code: 'DC-IDM-BKS', name: 'DC Indomarco Bekasi', network: 'Indomarco', region: 'Jabodetabek', city: 'Bekasi' },
  { id: 'dc-idm-04', code: 'DC-IDM-PRG', name: 'DC Indomarco Parung', network: 'Indomarco', region: 'Jabodetabek', city: 'Bogor' },
  { id: 'dc-idm-05', code: 'DC-IDM-BDG', name: 'DC Indomarco Bandung', network: 'Indomarco', region: 'Jawa Barat', city: 'Bandung' },
  { id: 'dc-idm-06', code: 'DC-IDM-CRB', name: 'DC Indomarco Cirebon', network: 'Indomarco', region: 'Jawa Barat', city: 'Cirebon' },
  { id: 'dc-idm-07', code: 'DC-IDM-SMG', name: 'DC Indomarco Semarang', network: 'Indomarco', region: 'Jawa Tengah & DIY', city: 'Semarang' },
  { id: 'dc-idm-08', code: 'DC-IDM-YOG', name: 'DC Indomarco Yogyakarta', network: 'Indomarco', region: 'Jawa Tengah & DIY', city: 'Sleman / Yogyakarta' },
  { id: 'dc-idm-09', code: 'DC-IDM-SBY', name: 'DC Indomarco Surabaya', network: 'Indomarco', region: 'Jawa Timur', city: 'Surabaya / Rungkut' },
  { id: 'dc-idm-10', code: 'DC-IDM-MLG', name: 'DC Indomarco Malang', network: 'Indomarco', region: 'Jawa Timur', city: 'Malang' },
  { id: 'dc-idm-11', code: 'DC-IDM-MDN', name: 'DC Indomarco Medan', network: 'Indomarco', region: 'Sumatera', city: 'Medan' },
  { id: 'dc-idm-12', code: 'DC-IDM-PLM', name: 'DC Indomarco Palembang', network: 'Indomarco', region: 'Sumatera', city: 'Palembang' },
  { id: 'dc-idm-13', code: 'DC-IDM-DPS', name: 'DC Indomarco Bali (Gianyar)', network: 'Indomarco', region: 'Bali & Nusa Tenggara', city: 'Gianyar / Denpasar' },
  { id: 'dc-idm-14', code: 'DC-IDM-MKS', name: 'DC Indomarco Makassar', network: 'Indomarco', region: 'Sulawesi', city: 'Makassar' },
  { id: 'dc-idm-15', code: 'DC-IDM-BJM', name: 'DC Indomarco Banjarmasin', network: 'Indomarco', region: 'Kalimantan', city: 'Banjarmasin' },

  // DC Indogrosir
  { id: 'dc-igr-01', code: 'DC-IGR-CPN', name: 'DC Indogrosir Cipinang', network: 'Indogrosir', region: 'Jabodetabek', city: 'Jakarta Timur' },
  { id: 'dc-igr-02', code: 'DC-IGR-KMY', name: 'DC Indogrosir Kemayoran', network: 'Indogrosir', region: 'Jabodetabek', city: 'Jakarta Pusat' },
  { id: 'dc-igr-03', code: 'DC-IGR-TGR', name: 'DC Indogrosir Tangerang', network: 'Indogrosir', region: 'Jabodetabek', city: 'Tangerang' },
  { id: 'dc-igr-04', code: 'DC-IGR-BDG', name: 'DC Indogrosir Bandung', network: 'Indogrosir', region: 'Jawa Barat', city: 'Bandung' },
  { id: 'dc-igr-05', code: 'DC-IGR-SMG', name: 'DC Indogrosir Semarang', network: 'Indogrosir', region: 'Jawa Tengah & DIY', city: 'Semarang' },
  { id: 'dc-igr-06', code: 'DC-IGR-YOG', name: 'DC Indogrosir Yogyakarta', network: 'Indogrosir', region: 'Jawa Tengah & DIY', city: 'Yogyakarta' },
  { id: 'dc-igr-07', code: 'DC-IGR-SBY', name: 'DC Indogrosir Surabaya', network: 'Indogrosir', region: 'Jawa Timur', city: 'Surabaya' },
  { id: 'dc-igr-08', code: 'DC-IGR-MDN', name: 'DC Indogrosir Medan', network: 'Indogrosir', region: 'Sumatera', city: 'Medan' },
  { id: 'dc-igr-09', code: 'DC-IGR-PLM', name: 'DC Indogrosir Palembang', network: 'Indogrosir', region: 'Sumatera', city: 'Palembang' },
  { id: 'dc-igr-10', code: 'DC-IGR-MKS', name: 'DC Indogrosir Makassar', network: 'Indogrosir', region: 'Sulawesi', city: 'Makassar' },
  { id: 'dc-igr-11', code: 'DC-IGR-PTK', name: 'DC Indogrosir Pontianak', network: 'Indogrosir', region: 'Kalimantan', city: 'Pontianak' }
];

// Helper to generate initial forecast for all initial DCs and 3 products
export const generateInitialForecasts = (): ForecastItem[] => {
  const forecasts: ForecastItem[] = [];
  const baseTargets: Record<string, Record<string, number>> = {
    // prod-1: Akram Khalas 200g, prod-2: DC Khalas Rigid 250g, prod-3: Akram Share Pack
    'dc-idm-01': { 'prod-1': 4500, 'prod-2': 3200, 'prod-3': 2800 },
    'dc-idm-02': { 'prod-1': 3800, 'prod-2': 2800, 'prod-3': 2200 },
    'dc-idm-03': { 'prod-1': 4000, 'prod-2': 3000, 'prod-3': 2500 },
    'dc-idm-04': { 'prod-1': 3200, 'prod-2': 2200, 'prod-3': 1800 },
    'dc-idm-05': { 'prod-1': 3500, 'prod-2': 2600, 'prod-3': 2100 },
    'dc-idm-06': { 'prod-1': 2200, 'prod-2': 1600, 'prod-3': 1300 },
    'dc-idm-07': { 'prod-1': 3000, 'prod-2': 2200, 'prod-3': 1800 },
    'dc-idm-08': { 'prod-1': 2400, 'prod-2': 1800, 'prod-3': 1400 },
    'dc-idm-09': { 'prod-1': 4200, 'prod-2': 3100, 'prod-3': 2600 },
    'dc-idm-10': { 'prod-1': 2200, 'prod-2': 1600, 'prod-3': 1300 },
    'dc-idm-11': { 'prod-1': 3400, 'prod-2': 2500, 'prod-3': 2000 },
    'dc-idm-12': { 'prod-1': 2600, 'prod-2': 1900, 'prod-3': 1500 },
    'dc-idm-13': { 'prod-1': 2000, 'prod-2': 1500, 'prod-3': 1200 },
    'dc-idm-14': { 'prod-1': 2800, 'prod-2': 2000, 'prod-3': 1600 },
    'dc-idm-15': { 'prod-1': 1800, 'prod-2': 1400, 'prod-3': 1100 },

    'dc-igr-01': { 'prod-1': 2500, 'prod-2': 2000, 'prod-3': 1800 },
    'dc-igr-02': { 'prod-1': 2200, 'prod-2': 1800, 'prod-3': 1500 },
    'dc-igr-03': { 'prod-1': 2000, 'prod-2': 1600, 'prod-3': 1400 },
    'dc-igr-04': { 'prod-1': 2100, 'prod-2': 1700, 'prod-3': 1500 },
    'dc-igr-05': { 'prod-1': 1800, 'prod-2': 1500, 'prod-3': 1300 },
    'dc-igr-06': { 'prod-1': 1600, 'prod-2': 1300, 'prod-3': 1100 },
    'dc-igr-07': { 'prod-1': 2400, 'prod-2': 1900, 'prod-3': 1700 },
    'dc-igr-08': { 'prod-1': 1900, 'prod-2': 1500, 'prod-3': 1300 },
    'dc-igr-09': { 'prod-1': 1500, 'prod-2': 1200, 'prod-3': 1000 },
    'dc-igr-10': { 'prod-1': 1600, 'prod-2': 1300, 'prod-3': 1100 },
    'dc-igr-11': { 'prod-1': 1300, 'prod-2': 1000, 'prod-3': 900 }
  };

  INITIAL_DCS.forEach(dc => {
    INITIAL_PRODUCTS.forEach(prod => {
      const target = baseTargets[dc.id]?.[prod.id] || 1500;
      forecasts.push({
        id: `fc-${dc.id}-${prod.id}`,
        dcId: dc.id,
        productId: prod.id,
        forecastQty: target,
        period: 'Q2-2026 Nasional'
      });
    });
  });

  return forecasts;
};

// Initial warehouse stocks (Generous stocks for realistic ongoing operations)
export const INITIAL_WAREHOUSE_STOCKS: WarehouseStock[] = [
  // Cikarang (Main Hub)
  { warehouseId: 'wh-1', productId: 'prod-1', qty: 28500 },
  { warehouseId: 'wh-1', productId: 'prod-2', qty: 22400 },
  { warehouseId: 'wh-1', productId: 'prod-3', qty: 18600 },
  // Surabaya (East Hub)
  { warehouseId: 'wh-2', productId: 'prod-1', qty: 14200 },
  { warehouseId: 'wh-2', productId: 'prod-2', qty: 11000 },
  { warehouseId: 'wh-2', productId: 'prod-3', qty: 9400 },
  // Medan (Sumatera Hub)
  { warehouseId: 'wh-3', productId: 'prod-1', qty: 8500 },
  { warehouseId: 'wh-3', productId: 'prod-2', qty: 6800 },
  { warehouseId: 'wh-3', productId: 'prod-3', qty: 5200 }
];

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'sh-001',
    soNumber: 'SO/IDM/2604/001',
    date: '2026-10-01',
    productId: 'prod-1',
    qty: 2500,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-idm-01', // DC Indomarco Ancol
    status: 'Terkirim',
    notes: 'Pengiriman Batch 1 - CDD Box 1',
    driverName: 'Pak Joko Santoso',
    vehicleNumber: 'B 9482 UDF',
    createdAt: '2026-10-01T08:30:00Z'
  },
  {
    id: 'sh-002',
    soNumber: 'SO/IDM/2604/002',
    date: '2026-10-01',
    productId: 'prod-2',
    qty: 1800,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-idm-01', // DC Indomarco Ancol
    status: 'Terkirim',
    notes: 'Pengiriman Batch 1 kurma rigid',
    driverName: 'Pak Joko Santoso',
    vehicleNumber: 'B 9482 UDF',
    createdAt: '2026-10-01T08:45:00Z'
  },
  {
    id: 'sh-003',
    soNumber: 'SO/IDM/2604/003',
    date: '2026-10-02',
    productId: 'prod-1',
    qty: 2000,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-idm-02', // DC Indomarco Tangerang 1
    status: 'Terkirim',
    notes: 'Pengiriman reguler Tangerang',
    driverName: 'Pak Rudi Hartono',
    vehicleNumber: 'B 9123 PQR',
    createdAt: '2026-10-02T09:15:00Z'
  },
  {
    id: 'sh-004',
    soNumber: 'SO/IDM/2604/004',
    date: '2026-10-02',
    productId: 'prod-3',
    qty: 1200,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-idm-02',
    status: 'Terkirim',
    notes: 'Share pack supply',
    driverName: 'Pak Rudi Hartono',
    vehicleNumber: 'B 9123 PQR',
    createdAt: '2026-10-02T09:30:00Z'
  },
  {
    id: 'sh-005',
    soNumber: 'SO/IGR/2604/005',
    date: '2026-10-03',
    productId: 'prod-1',
    qty: 1800,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-igr-01', // DC Indogrosir Cipinang
    status: 'Terkirim',
    notes: 'PO Indogrosir Cipinang No 8812',
    driverName: 'Pak Hendra Pratama',
    vehicleNumber: 'B 9651 TYA',
    createdAt: '2026-10-03T10:00:00Z'
  },
  {
    id: 'sh-006',
    soNumber: 'SO/IDM/2604/006',
    date: '2026-10-03',
    productId: 'prod-1',
    qty: 2800,
    sourceWarehouseId: 'wh-2',
    targetDcId: 'dc-idm-09', // DC Indomarco Surabaya
    status: 'Terkirim',
    notes: 'Suplai area Jawa Timur Tahap 1',
    driverName: 'Pak Bambang',
    vehicleNumber: 'L 8721 AB',
    createdAt: '2026-10-03T11:20:00Z'
  },
  {
    id: 'sh-007',
    soNumber: 'SO/IDM/2604/007',
    date: '2026-10-03',
    productId: 'prod-2',
    qty: 2000,
    sourceWarehouseId: 'wh-2',
    targetDcId: 'dc-idm-09',
    status: 'Terkirim',
    notes: 'DC Khalas Rigid ke DC Surabaya',
    driverName: 'Pak Bambang',
    vehicleNumber: 'L 8721 AB',
    createdAt: '2026-10-03T11:40:00Z'
  },
  {
    id: 'sh-008',
    soNumber: 'SO/IDM/2604/008',
    date: '2026-10-04',
    productId: 'prod-1',
    qty: 2000,
    sourceWarehouseId: 'wh-3',
    targetDcId: 'dc-idm-11', // DC Indomarco Medan
    status: 'Terkirim',
    notes: 'Alokasi Medan dari Gudang Hub Medan',
    driverName: 'Pak Syahrul',
    vehicleNumber: 'BK 9012 XY',
    createdAt: '2026-10-04T08:10:00Z'
  },
  {
    id: 'sh-009',
    soNumber: 'SO/IGR/2604/009',
    date: '2026-10-04',
    productId: 'prod-2',
    qty: 1200,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-igr-02', // DC Indogrosir Kemayoran
    status: 'Dalam Perjalanan',
    notes: 'Dalam perjalanan via Tol Cikampek - Tanjung Priok',
    driverName: 'Pak Agus Salim',
    vehicleNumber: 'B 9234 KL',
    createdAt: '2026-10-04T13:00:00Z'
  },
  {
    id: 'sh-010',
    soNumber: 'SO/IDM/2604/010',
    date: '2026-10-04',
    productId: 'prod-1',
    qty: 1500,
    sourceWarehouseId: 'wh-1',
    targetDcId: 'dc-idm-05', // DC Indomarco Bandung
    status: 'Dalam Perjalanan',
    notes: 'Pengiriman via Tol Cipularang',
    driverName: 'Pak Asep Sunandar',
    vehicleNumber: 'D 8839 FF',
    createdAt: '2026-10-04T14:30:00Z'
  }
];

export const INITIAL_MUTATIONS: StockMutation[] = [
  {
    id: 'mut-01',
    timestamp: '2026-10-01 08:30',
    type: 'OUT_SHIPMENT',
    warehouseId: 'wh-1',
    productId: 'prod-1',
    qtyChange: -2500,
    resultingQty: 28500,
    referenceNumber: 'SO/IDM/2604/001',
    notes: 'Pengiriman ke DC Indomarco Ancol'
  },
  {
    id: 'mut-02',
    timestamp: '2026-10-01 08:45',
    type: 'OUT_SHIPMENT',
    warehouseId: 'wh-1',
    productId: 'prod-2',
    qtyChange: -1800,
    resultingQty: 22400,
    referenceNumber: 'SO/IDM/2604/002',
    notes: 'Pengiriman ke DC Indomarco Ancol'
  },
  {
    id: 'mut-03',
    timestamp: '2026-10-02 09:15',
    type: 'OUT_SHIPMENT',
    warehouseId: 'wh-1',
    productId: 'prod-1',
    qtyChange: -2000,
    resultingQty: 26500,
    referenceNumber: 'SO/IDM/2604/003',
    notes: 'Pengiriman ke DC Indomarco Tangerang 1'
  },
  {
    id: 'mut-04',
    timestamp: '2026-10-02 09:30',
    type: 'OUT_SHIPMENT',
    warehouseId: 'wh-1',
    productId: 'prod-3',
    qtyChange: -1200,
    resultingQty: 18600,
    referenceNumber: 'SO/IDM/2604/004',
    notes: 'Pengiriman ke DC Indomarco Tangerang 1'
  },
  {
    id: 'mut-05',
    timestamp: '2026-10-03 10:00',
    type: 'OUT_SHIPMENT',
    warehouseId: 'wh-1',
    productId: 'prod-1',
    qtyChange: -1800,
    resultingQty: 24700,
    referenceNumber: 'SO/IGR/2604/005',
    notes: 'Pengiriman ke DC Indogrosir Cipinang'
  }
];
