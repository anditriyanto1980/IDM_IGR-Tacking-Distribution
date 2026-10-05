import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Warehouse, 
  DistributionCenter, 
  ForecastItem, 
  Shipment, 
  WarehouseStock, 
  StockMutation, 
  DCControllingSummary 
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
import { testConnection } from '../lib/firebase';
import {
  seedInitialFirestoreData,
  setupFirestoreListeners,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveWarehouseToFirestore,
  saveForecastToFirestore,
  batchSaveForecastsToFirestore,
  saveStockToFirestore,
  saveShipmentToFirestore,
  deleteShipmentFromFirestore,
  saveMutationToFirestore
} from '../services/firebaseService';

interface AppContextType {
  products: Product[];
  warehouses: Warehouse[];
  dcs: DistributionCenter[];
  forecasts: ForecastItem[];
  stocks: WarehouseStock[];
  shipments: Shipment[];
  mutations: StockMutation[];
  controllingSummaries: DCControllingSummary[];
  isFirebaseConnected: boolean;
  
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
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

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

  // Test Firebase connection & initialize real-time synchronization
  useEffect(() => {
    let unsubscribeAll: (() => void) | undefined;

    const initFirebase = async () => {
      const connected = await testConnection();
      setIsFirebaseConnected(connected);

      // Seed if empty
      await seedInitialFirestoreData();

      // Listen for real-time cloud updates
      unsubscribeAll = setupFirestoreListeners({
        onProducts: (cloudProducts) => setProducts(cloudProducts),
        onWarehouses: (cloudWarehouses) => setWarehouses(cloudWarehouses),
        onDcs: (cloudDcs) => setDcs(cloudDcs),
        onForecasts: (cloudForecasts) => setForecasts(cloudForecasts),
        onStocks: (cloudStocks) => setStocks(cloudStocks),
        onShipments: (cloudShipments) => setShipments(cloudShipments),
        onMutations: (cloudMutations) => setMutations(cloudMutations),
      });
    };

    initFirebase();

    return () => {
      if (unsubscribeAll) unsubscribeAll();
    };
  }, []);

  // Sync state to localStorage (as immediate offline cache)
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
    saveProductToFirestore(newProduct);

    // Initialize stock in all warehouses
    warehouses.forEach(wh => {
      const stockItem: WarehouseStock = {
        warehouseId: wh.id,
        productId: newProduct.id,
        qty: 1000
      };
      saveStockToFirestore(stockItem);
    });

    setStocks(prev => {
      const newEntries: WarehouseStock[] = warehouses.map(wh => ({
        warehouseId: wh.id,
        productId: newProduct.id,
        qty: 1000
      }));
      return [...prev, ...newEntries];
    });

    // Initialize forecast for all DCs with default 1000
    const newFcs: ForecastItem[] = dcs.map(dc => ({
      id: `fc-${dc.id}-${newProduct.id}`,
      dcId: dc.id,
      productId: newProduct.id,
      forecastQty: 1000,
      period: 'Q2-2026 Nasional'
    }));

    batchSaveForecastsToFirestore(newFcs);

    setForecasts(prev => [...prev, ...newFcs]);

    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...updates };
        saveProductToFirestore(updated);
        return updated;
      }
      return p;
    }));
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

    deleteProductFromFirestore(id);
    return { success: true };
  };

  // Warehouse CRUD
  const addWarehouse = (whData: Omit<Warehouse, 'id'>): Warehouse => {
    const newWh: Warehouse = {
      ...whData,
      id: `wh-${Date.now()}`
    };
    setWarehouses(prev => [...prev, newWh]);
    saveWarehouseToFirestore(newWh);

    // initialize 0 stocks for all products
    products.forEach(p => {
      const sItem = { warehouseId: newWh.id, productId: p.id, qty: 0 };
      saveStockToFirestore(sItem);
    });

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
    setWarehouses(prev => prev.map(w => {
      if (w.id === id) {
        const updated = { ...w, ...updates };
        saveWarehouseToFirestore(updated);
        return updated;
      }
      return w;
    }));
  };

  // Forecast actions
  const updateForecast = (dcId: string, productId: string, qty: number) => {
    setForecasts(prev => {
      const index = prev.findIndex(f => f.dcId === dcId && f.productId === productId);
      const safeQty = Math.max(0, Number(qty) || 0);
      let updatedItem: ForecastItem;
      if (index >= 0) {
        const updated = [...prev];
        updatedItem = { ...updated[index], forecastQty: safeQty };
        updated[index] = updatedItem;
        saveForecastToFirestore(updatedItem);
        return updated;
      } else {
        updatedItem = {
          id: `fc-${dcId}-${productId}-${Date.now()}`,
          dcId,
          productId,
          forecastQty: safeQty,
          period: 'Q2-2026 Nasional'
        };
        saveForecastToFirestore(updatedItem);
        return [...prev, updatedItem];
      }
    });
  };

  const batchUpdateForecasts = (items: { dcId: string; productId: string; qty: number }[]) => {
    const itemsToSave: ForecastItem[] = [];
    setForecasts(prev => {
      const updated = [...prev];
      items.forEach(item => {
        const safeQty = Math.max(0, Number(item.qty) || 0);
        const idx = updated.findIndex(f => f.dcId === item.dcId && f.productId === item.productId);
        if (idx >= 0) {
          const u = { ...updated[idx], forecastQty: safeQty };
          updated[idx] = u;
          itemsToSave.push(u);
        } else {
          const n: ForecastItem = {
            id: `fc-${item.dcId}-${item.productId}-${Date.now()}`,
            dcId: item.dcId,
            productId: item.productId,
            forecastQty: safeQty,
            period: 'Q2-2026 Nasional'
          };
          updated.push(n);
          itemsToSave.push(n);
        }
      });
      return updated;
    });

    if (itemsToSave.length > 0) {
      batchSaveForecastsToFirestore(itemsToSave);
    }
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
        saveStockToFirestore(copy[index]);
        return copy;
      } else {
        resulting = safeQty;
        const newItem = { warehouseId, productId, qty: resulting };
        saveStockToFirestore(newItem);
        return [...prev, newItem];
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
    saveMutationToFirestore(newMutation);
  };

  // Stock Adjustment
  const adjustStock = (warehouseId: string, productId: string, newQty: number, notes: string) => {
    const current = getStock(warehouseId, productId);
    const targetQty = Math.max(0, Number(newQty) || 0);
    const diff = targetQty - current;

    setStocks(prev => {
      const index = prev.findIndex(s => s.warehouseId === warehouseId && s.productId === productId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = { ...copy[index], qty: targetQty };
        saveStockToFirestore(copy[index]);
        return copy;
      } else {
        const newItem = { warehouseId, productId, qty: targetQty };
        saveStockToFirestore(newItem);
        return [...prev, newItem];
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
      resultingQty: targetQty,
      referenceNumber: `ADJ-${Date.now().toString().slice(-6)}`,
      notes: notes || 'Penyesuaian stok fisik (Opname)'
    };

    setMutations(prev => [newMutation, ...prev]);
    saveMutationToFirestore(newMutation);
  };

  // Add Shipment (Sales Order)
  const addShipment = (
    data: Omit<Shipment, 'id' | 'createdAt'>
  ): { success: boolean; message?: string } => {
    const availableStock = getStock(data.sourceWarehouseId, data.productId);
    if (availableStock < data.qty) {
      const prodName = products.find(p => p.id === data.productId)?.name || 'Barang';
      const whName = warehouses.find(w => w.id === data.sourceWarehouseId)?.name || 'Gudang';
      return {
        success: false,
        message: `Stok ${prodName} di ${whName} tidak mencukupi! Tersedia: ${availableStock.toLocaleString('id-ID')}, Dibutuhkan: ${data.qty.toLocaleString('id-ID')}.`
      };
    }

    const newShipment: Shipment = {
      ...data,
      id: `so-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Deduct stock from source warehouse
    let newBalance = availableStock - data.qty;
    setStocks(prev => {
      const copy = [...prev];
      const idx = copy.findIndex(s => s.warehouseId === data.sourceWarehouseId && s.productId === data.productId);
      if (idx >= 0) {
        copy[idx] = { ...copy[idx], qty: newBalance };
        saveStockToFirestore(copy[idx]);
      }
      return copy;
    });

    // Record stock mutation
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const dcTarget = dcs.find(d => d.id === data.targetDcId);
    const newMutation: StockMutation = {
      id: `mut-${Date.now()}`,
      timestamp: timestampStr,
      type: 'OUT_SHIPMENT',
      warehouseId: data.sourceWarehouseId,
      productId: data.productId,
      qtyChange: -data.qty,
      resultingQty: newBalance,
      referenceNumber: data.soNumber,
      notes: `Pengiriman SO ke ${dcTarget?.name || 'DC'} (${data.status})`
    };

    setMutations(prev => [newMutation, ...prev]);
    setShipments(prev => [newShipment, ...prev]);

    saveShipmentToFirestore(newShipment);
    saveMutationToFirestore(newMutation);

    return { success: true };
  };

  // Update Shipment
  const updateShipment = (
    id: string,
    updates: Partial<Shipment>
  ): { success: boolean; message?: string } => {
    const existing = shipments.find(s => s.id === id);
    if (!existing) {
      return { success: false, message: 'Surat Jalan tidak ditemukan.' };
    }

    if (
      (updates.qty !== undefined && updates.qty !== existing.qty) ||
      (updates.sourceWarehouseId && updates.sourceWarehouseId !== existing.sourceWarehouseId) ||
      (updates.productId && updates.productId !== existing.productId)
    ) {
      const finalWh = updates.sourceWarehouseId || existing.sourceWarehouseId;
      const finalProd = updates.productId || existing.productId;
      const finalQty = updates.qty !== undefined ? updates.qty : existing.qty;

      const currentAvailable = getStock(finalWh, finalProd);
      const effectiveStock = (finalWh === existing.sourceWarehouseId && finalProd === existing.productId)
        ? currentAvailable + existing.qty
        : currentAvailable;

      if (effectiveStock < finalQty) {
        return {
          success: false,
          message: `Stok gudang tidak mencukupi untuk perubahan qty baru! Maksimal tersedia: ${effectiveStock.toLocaleString('id-ID')}`
        };
      }

      setStocks(prev => {
        const copy = [...prev];
        const oldIdx = copy.findIndex(s => s.warehouseId === existing.sourceWarehouseId && s.productId === existing.productId);
        if (oldIdx >= 0) {
          copy[oldIdx] = { ...copy[oldIdx], qty: copy[oldIdx].qty + existing.qty };
          saveStockToFirestore(copy[oldIdx]);
        }
        const newIdx = copy.findIndex(s => s.warehouseId === finalWh && s.productId === finalProd);
        if (newIdx >= 0) {
          copy[newIdx] = { ...copy[newIdx], qty: copy[newIdx].qty - finalQty };
          saveStockToFirestore(copy[newIdx]);
        }
        return copy;
      });
    }

    const updatedShipment = { ...existing, ...updates };
    setShipments(prev => prev.map(s => s.id === id ? updatedShipment : s));
    saveShipmentToFirestore(updatedShipment);

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
        saveStockToFirestore(copy[idx]);
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

    deleteShipmentFromFirestore(id);
    saveMutationToFirestore(mutation);

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

    // Re-seed cloud
    seedInitialFirestoreData();
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
        isFirebaseConnected,
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
