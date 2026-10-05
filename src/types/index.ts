export type DCNetwork = 'Indomarco' | 'Indogrosir';

export type StandardRegion = 
  | 'Jabodetabek'
  | 'Jawa Barat'
  | 'Jawa Tengah & DIY'
  | 'Jawa Timur'
  | 'Sumatera'
  | 'Bali & Nusa Tenggara'
  | 'Sulawesi'
  | 'Kalimantan'
  | 'Maluku & Papua';

export type Region = StandardRegion | (string & {});

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string; // e.g. "Karton (Ctn)" or "Pcs"
  packSize: string; // e.g. "48 x 200g"
  minStockAlert: number;
  description?: string;
}

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  location: string;
  isMain?: boolean;
}

export interface DistributionCenter {
  id: string;
  code: string;
  name: string;
  network: DCNetwork;
  region: Region;
  city: string;
  address?: string;
}

export interface ForecastItem {
  id: string;
  dcId: string;
  productId: string;
  forecastQty: number; // in Karton/Unit
  period: string; // e.g. "2026-Q2" or "Nasional 2026"
}

export interface Shipment {
  id: string;
  soNumber: string; // e.g. "SO/IDM/2026/04/001"
  date: string; // YYYY-MM-DD
  productId: string;
  qty: number;
  sourceWarehouseId: string;
  targetDcId: string;
  status: 'Terkirim' | 'Dalam Perjalanan' | 'Selesai';
  notes?: string;
  driverName?: string;
  vehicleNumber?: string;
  createdAt: string;
}

export interface WarehouseStock {
  warehouseId: string;
  productId: string;
  qty: number;
}

export interface StockMutation {
  id: string;
  timestamp: string;
  type: 'OUT_SHIPMENT' | 'IN_RECEIPT' | 'ADJUSTMENT' | 'VOID_SHIPMENT';
  warehouseId: string;
  productId: string;
  qtyChange: number; // positive or negative
  resultingQty: number;
  referenceNumber: string; // SO number or Receipt number
  notes: string;
}

export interface DCControllingSummary {
  dc: DistributionCenter;
  productId: string;
  productName: string;
  productSku: string;
  productUnit: string;
  forecastQty: number;
  sentQty: number;
  remainingQty: number;
  percentFulfilled: number;
  percentRemaining: number;
  status: 'BELUM_ADA' | 'PROGRES' | 'TERCAPAI' | 'OVER_FORECAST';
}
