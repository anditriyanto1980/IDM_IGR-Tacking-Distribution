import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Warehouse, 
  DistributionCenter, 
  ForecastItem, 
  Shipment, 
  WarehouseStock, 
  StockMutation, 
  DCControllingSummary,
  DCNetwork,
  Region
} from '../types';
import { 
  INITIAL_PRODUCTS, 
  INITIAL_WAREHOUSES, 
  INITIAL_DCS, 
  generateInitialForecasts, 
  INITIAL_WAREHOUSE_STOCKS, 
  INITIAL_SHIPMENTS, 
  INITIAL_MUTATIONS 
} from '../data/initialData';

interface AppContextType {
  products: Product[];
  warehouses: Warehouse[];
  dcs: DistributionCenter[];
  forecasts: ForecastItem[];
  stocks: WarehouseStock[];
  shipments: Shipment[];
  mutations: StockMutation[];
  controllingSummaries: DCControllingSummary[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => { success: boolean; message?: string };

  // Warehouse actions
  addWarehouse: (warehouse: Omit<Warehouse, 'id'>) => Warehouse;
  updateWarehouse: (id: string, updates: Partial<Warehouse>) => void;

  // Forecast actions
  updateForecast: (dcId: string, productId: string, qty: number) => void;
  batchUpdateForecasts: (items: { dcId: string; productId: string; qty: number }[]) => void;

  // Stock actions
  getStock: (warehouseId: string, productId: string) => number;
  getTotalStock: (productId: string) => number;
  addStockIn: (warehouseId: string, productId: string, qty: number, refNumber: string, notes: string) => void;
  adjustStock: (warehouseId: string, productId: string, newQty: number, notes: string) => void;

  // Shipment actions
  addShipment: (shipment: Omit<Shipment, 'id' | 'createdAt'>) => { success: boolean; message?: string };
  updateShipment: (id: string, shipment: Partial<Shipment>) => { success: boolean; message?: string };
  deleteShipment: (id: string) => { success: boolean; message?: string };

  // Helper / Utility
  resetToDefaultData: () => void;
  exportToCSV: (filename: string, rows: Record<string, any>[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'logitrack_products_v1',
  WAREHOUSES: 'logitrack_warehouses_v1',
  DCS: 'logitrack_dcs_v1',
  FORECASTS: 'logitrack_forecasts_v1',
  STOCKS: 'logitrack_stocks_v1',
  SHIPMENTS: 'logitrack_shipments_v1',
  MUTATIONS: 'logitrack_mutations_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or initial
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [warehouses, setWarehouses] = useState<Warehouse[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.WAREHOUSES);
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSES;
    } catch {
      return INITIAL_WAREHOUSES;
    }
  });

  const [dcs, setDcs] = useState<DistributionCenter[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DCS);
      return saved ? JSON.parse(saved) : INITIAL_DCS;
    } catch {
      return INITIAL_DCS;
    }
  });

  const [forecasts, setForecasts] = useState<ForecastItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORECASTS);
      return saved ? JSON.parse(saved) : generateInitialForecasts();
    } catch {
      return generateInitialForecasts();
    }
  });

  const [stocks, setStocks] = useState<WarehouseStock[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STOCKS);
      return saved ? JSON.parse(saved) : INITIAL_WAREHOUSE_STOCKS;
    } catch {
      return INITIAL_WAREHOUSE_STOCKS;
    }
  });

  const [shipments, setShipments] = useState<Shipment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);
      return saved ? JSON.parse(saved) : INITIAL_SHIPMENTS;
    } catch {
      return INITIAL_SHIPMENTS;
    }
  });

  const [mutations, setMutations] = useState<StockMutation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MUTATIONS);
      return saved ? JSON.parse(saved) : INITIAL_MUTATIONS;
    } catch {
      return INITIAL_MUTATIONS;
    }
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WAREHOUSES, JSON.stringify(warehouses));
  }, [warehouses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DCS, JSON.stringify(dcs));
  }, [dcs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORECASTS, JSON.stringify(forecasts));
  }, [forecasts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHIPMENTS, JSON.stringify(shipments));
  }, [shipments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MUTATIONS, JSON.stringify(mutations));
  }, [mutations]);

  // Stock helpers
  const getStock = (warehouseId: string, productId: string): number => {
    const entry = stocks.find(s => s.warehouseId === warehouseId && s.productId === productId);
    return entry ? entry.qty : 0;
  };

  const getTotalStock = (productId: string): number => {
    return stocks
      .filter(s => s.productId === productId)
      .reduce((sum, s) => sum + s.qty, 0);
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
      ...prodData,
      id: `prod-${Date.now()}`
    };

    setProducts(prev => [...prev, newProduct]);

    // Initialize stock of 0 in all warehouses
    setStocks(prev => {
      const newEntries: WarehouseStock[] = warehouses.map(wh => ({
        warehouseId: wh.id,
        productId: newProduct.id,
        qty: 1000 // give initial sample stock
      }));
      return [...prev, ...newEntries];
    });

    // Initialize forecast for all DCs with default 1000
    setForecasts(prev => {
      const newFc: ForecastItem[] = dcs.map(dc => ({
        id: `fc-${dc.id}-${newProduct.id}`,
        dcId: dc.id,
        productId: newProduct.id,
        forecastQty: 1000,
        period: 'Q2-2026 Nasional'
      }));
      return [...prev, ...newFc];
    });

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string): { success: boolean; message?: string } => {
    // Check if product has active shipments
    const hasShipment = shipments.some(s => s.productId === id);
    if (hasShipment) {
      return { 
        success: false, 
        message: 'Barang tidak dapat dihapus karena sudah ada riwayat Surat Jalan / Pengiriman.' 
      };
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    setStocks(prev => prev.filter(s => s.productId !== id));
    setForecasts(prev => prev.filter(f => f.productId !== id));
    return { success: true };
  };

  // Warehouse CRUD
  const addWarehouse = (whData: Omit<Warehouse, 'id'>): Warehouse => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`
    };
    setWarehouses(prev => [...prev, newWh]);

    // initialize 0 stocks for all products
    setStocks(prev => {
      const newEntries = products.map(p => ({
        warehouseId: newWh.id,
        productId: p.id,
        qty: 0
      }));
      return [...prev, ...newEntries];
    });

    return newWh;
  };

  const updateWarehouse = (id: string, updates: Partial<Warehouse>) => {
    setWarehouses(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // Forecast actions
  const updateForecast = (dcId: string, productId: string, qty: number) => {
    setForecasts(prev => {
      const index = prev.findIndex(f => f.dcId === dcId && f.productId === productId);
      const safeQty = Math.max(0, Number(qty) || 0);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], forecastQty: safeQty };
        return updated;
      } else {
        return [
          ...prev,
          {
            id: `fc-${dcId}-${productId}-${Date.now()}`,
            dcId,
            productId,
            forecastQty: safeQty,
            period: 'Q2-2026 Nasional'
          }
        ];
      }
    });
  };

  const batchUpdateForecasts = (items: { dcId: string; productId: string; qty: number }[]) => {
    setForecasts(prev => {
      const updated = [...prev];
      items.forEach(item => {
        const safeQty = Math.max(0, Number(item.qty) || 0);
        const idx = updated.findIndex(f => f.dcId === item.dcId && f.productId === item.productId);
        if (idx >= 0) {
          updated[idx] = { ...updated[idx], forecastQty: safeQty };
        } else {
          updated.push({
            id: `fc-${item.dcId}-${item.productId}-${Date.now()}`,
            dcId: item.dcId,
            productId: item.productId,
            forecastQty: safeQty,
            period: 'Q2-2026 Nasional'
          });
        }
      });
      return updated;
    });
  };

  // Inbound Stock
  const addStockIn = (
    warehouseId: string, 
    productId: string, 
    qty: number, 
    refNumber: string, 
    notes: string
  ) => {
    const safeQty = Math.max(1, Number(qty) || 0);
    let resulting = safeQty;

    setStocks(prev => {
      const index = prev.findIndex(s => s.warehouseId === warehouseId && s.productId === productId);
      if (index >= 0) {
        resulting = prev[index].qty + safeQty;
        const copy = [...prev];
        copy[index] = { ...copy[index], qty: resulting };
        return copy;
      } else {
        resulting = safeQty;
        return [...prev, { warehouseId, productId, qty: resulting }];
      }
    });

    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'IN_RECEIPT',
      warehouseId,
      productId,
      qtyChange: safeQty,
      resultingQty: resulting,
      referenceNumber: refNumber || `IN-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Penerimaan stok dari produksi/supplier'
    };

    setMutations(prev => [newMutation, ...prev]);
  };

  // Stock Adjustment
  const adjustStock = (warehouseId: string, productId: string, newQty: number, notes: string) => {
    const current = getStock(warehouseId, productId);
    const diff = newQty - current;
    if (diff === 0) return;

    setStocks(prev => {
      const index = prev.findIndex(s => s.warehouseId === warehouseId && s.productId === productId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = { ...copy[index], qty: Math.max(0, newQty) };
        return copy;
      } else {
        return [...prev, { warehouseId, productId, qty: Math.max(0, newQty) }];
      }
    });

    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'ADJUSTMENT',
      warehouseId,
      productId,
      qtyChange: diff,
      resultingQty: Math.max(0, newQty),
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Penyesuaian stok opname manual'
    };

    setMutations(prev => [newMutation, ...prev]);
  };

  // Shipment Actions: DEDUCTS stock from the chosen warehouse
  const addShipment = (shipmentData: Omit<Shipment, 'id' | 'createdAt'>): { success: boolean; message?: string } => {
    const { productId, qty, sourceWarehouseId, soNumber } = shipmentData;
    const currentStock = getStock(sourceWarehouseId, productId);

    if (currentStock < qty) {
      return {
        success: false,
        message: `Stok gudang tidak mencukupi! Stok saat ini: ${currentStock.toLocaleString('id-ID')}, Qty kirim yang diinput: ${qty.toLocaleString('id-ID')}. Silakan tambahkan stok penerimaan terlebih dahulu.`
      };
    }

    const newShipment: Shipment = {
      ...shipmentData,
      id: `sh-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Deduct warehouse stock
    const newStockQty = currentStock - qty;
    setStocks(prev => {
      const index = prev.findIndex(s => s.warehouseId === sourceWarehouseId && s.productId === productId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = { ...copy[index], qty: newStockQty };
        return copy;
      }
      return prev;
    });

    // Add mutation log
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const targetDcObj = dcs.find(d => d.id === shipmentData.targetDcId);

    const mutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'OUT_SHIPMENT',
      warehouseId: sourceWarehouseId,
      productId,
      qtyChange: -qty,
      resultingQty: newStockQty,
      referenceNumber: soNumber,
      notes: `Pengiriman ke ${targetDcObj ? targetDcObj.name : 'DC'} (${shipmentData.notes || 'SO Kirim'})`
    };

    setMutations(prev => [mutation, ...prev]);
    setShipments(prev => [newShipment, ...prev]);

    return { success: true };
  };

  // Update Shipment
  const updateShipment = (id: string, updatedFields: Partial<Shipment>): { success: boolean; message?: string } => {
    const existing = shipments.find(s => s.id === id);
    if (!existing) {
      return { success: false, message: 'Surat Jalan tidak ditemukan.' };
    }

    const newWarehouseId = updatedFields.sourceWarehouseId ?? existing.sourceWarehouseId;
    const newProductId = updatedFields.productId ?? existing.productId;
    const newQty = updatedFields.qty ?? existing.qty;

    // Reconcile stock
    // 1. Revert previous stock deduction
    const oldWarehouseStock = getStock(existing.sourceWarehouseId, existing.productId);
    const restoredStock = oldWarehouseStock + existing.qty;

    // Check if new warehouse has enough
    let availableTargetStock = (newWarehouseId === existing.sourceWarehouseId && newProductId === existing.productId)
      ? restoredStock
      : getStock(newWarehouseId, newProductId);

    if (availableTargetStock < newQty) {
      return {
        success: false,
        message: `Stok gudang tujuan tidak cukup untuk perubahan ini. Tersedia: ${availableTargetStock.toLocaleString('id-ID')}, Diperlukan: ${newQty.toLocaleString('id-ID')}`
      };
    }

    // Apply adjustments
    setStocks(prev => {
      let copy = [...prev];
      // 1. add back old qty
      const oldIdx = copy.findIndex(s => s.warehouseId === existing.sourceWarehouseId && s.productId === existing.productId);
      if (oldIdx >= 0) {
        copy[oldIdx] = { ...copy[oldIdx], qty: copy[oldIdx].qty + existing.qty };
      }

      // 2. deduct new qty
      const newIdx = copy.findIndex(s => s.warehouseId === newWarehouseId && s.productId === newProductId);
      if (newIdx >= 0) {
        copy[newIdx] = { ...copy[newIdx], qty: copy[newIdx].qty - newQty };
      }
      return copy;
    });

    setShipments(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));

    // Mutation log
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const mutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'ADJUSTMENT',
      warehouseId: newWarehouseId,
      productId: newProductId,
      qtyChange: existing.qty - newQty,
      resultingQty: availableTargetStock - newQty,
      referenceNumber: updatedFields.soNumber || existing.soNumber,
      notes: `Revisi Qty Pengiriman SO ${existing.soNumber} (${existing.qty} -> ${newQty})`
    };
    setMutations(prev => [mutation, ...prev]);

    return { success: true };
  };

  // Delete Shipment (restores warehouse stock)
  const deleteShipment = (id: string): { success: boolean; message?: string } => {
    const existing = shipments.find(s => s.id === id);
    if (!existing) return { success: false, message: 'Surat Jalan tidak ditemukan.' };

    // Restore stock to source warehouse
    setStocks(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(s => s.warehouseId === existing.sourceWarehouseId && s.productId === existing.productId);
      if (idx >= 0) {
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + existing.qty };
      }
      return copy;
    });

    // Add mutation
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const mutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'VOID_SHIPMENT',
      warehouseId: existing.sourceWarehouseId,
      productId: existing.productId,
      qtyChange: existing.qty,
      resultingQty: getStock(existing.sourceWarehouseId, existing.productId) + existing.qty,
      referenceNumber: existing.soNumber,
      notes: `Pembatalan SO ${existing.soNumber} (Stok dikembalikan ke gudang)`
    };

    setMutations(prev => [mutation, ...prev]);
    setShipments(prev => prev.filter(s => s.id !== id));
    return { success: true };
  };

  // Compute Full DC Controlling Matrix
  const controllingSummaries = useMemo<DCControllingSummary[]>(() => {
    const summaries: DCControllingSummary[] = [];

    dcs.forEach(dc => {
      products.forEach(prod => {
        // Find forecast for this DC & Product
        const fc = forecasts.find(f => f.dcId === dc.id && f.productId === prod.id);
        const forecastQty = fc ? fc.forecastQty : 0;

        // Sum sent qty for this DC & Product
        const sentQty = shipments
          .filter(s => s.targetDcId === dc.id && s.productId === prod.id)
          .reduce((sum, s) => sum + s.qty, 0);

        const remainingQty = Math.max(0, forecastQty - sentQty);
        const percentFulfilled = forecastQty > 0 ? (sentQty / forecastQty) * 100 : 0;
        const percentRemaining = Math.max(0, 100 - percentFulfilled);

        let status: 'BELUM_ADA' | 'PROGRES' | 'TERCAPAI' | 'OVER_FORECAST' = 'BELUM_ADA';
        if (sentQty === 0) {
          status = 'BELUM_ADA';
        } else if (sentQty > forecastQty) {
          status = 'OVER_FORECAST';
        } else if (sentQty === forecastQty || percentFulfilled >= 100) {
          status = 'TERCAPAI';
        } else {
          status = 'PROGRES';
        }

        summaries.push({
          dc,
          productId: prod.id,
          productName: prod.name,
          productSku: prod.sku,
          productUnit: prod.unit,
          forecastQty,
          sentQty,
          remainingQty,
          percentFulfilled,
          percentRemaining,
          status
        });
      });
    });

    return summaries;
  }, [dcs, products, forecasts, shipments]);

  const resetToDefaultData = () => {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.WAREHOUSES);
    localStorage.removeItem(STORAGE_KEYS.DCS);
    localStorage.removeItem(STORAGE_KEYS.FORECASTS);
    localStorage.removeItem(STORAGE_KEYS.STOCKS);
    localStorage.removeItem(STORAGE_KEYS.SHIPMENTS);
    localStorage.removeItem(STORAGE_KEYS.MUTATIONS);

    setProducts(INITIAL_PRODUCTS);
    setWarehouses(INITIAL_WAREHOUSES);
    setDcs(INITIAL_DCS);
    setForecasts(generateInitialForecasts());
    setStocks(INITIAL_WAREHOUSE_STOCKS);
    setShipments(INITIAL_SHIPMENTS);
    setMutations(INITIAL_MUTATIONS);
  };

  const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows || !rows.length) return;
    const separator = ';';
    const keys = Object.keys(rows[0]);
    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : String(row[k]);
              cell = cell.replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0 || cell.includes(';')) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        warehouses,
        dcs,
        forecasts,
        stocks,
        shipments,
        mutations,
        controllingSummaries,
        addProduct,
        updateProduct,
        deleteProduct,
        addWarehouse,
        updateWarehouse,
        updateForecast,
        batchUpdateForecasts,
        getStock,
        getTotalStock,
        addStockIn,
        adjustStock,
        addShipment,
        updateShipment,
        deleteShipment,
        resetToDefaultData,
        exportToCSV,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
