import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Product, 
  Warehouse, 
  DistributionCenter, 
  ForecastItem, 
  WarehouseStock, 
  Shipment, 
  StockMutation 
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

// Firestore collection names
export const COLLECTIONS = {
  PRODUCTS: 'products',
  WAREHOUSES: 'warehouses',
  DCS: 'dcs',
  FORECASTS: 'forecasts',
  STOCKS: 'stocks',
  SHIPMENTS: 'shipments',
  MUTATIONS: 'mutations',
};

// Seed initial data if Firestore collections are empty
export async function seedInitialFirestoreData(): Promise<boolean> {
  try {
    const productsSnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
    if (!productsSnap.empty) {
      return false; // Already seeded
    }

    console.log('Seeding initial data to Firebase Firestore...');
    const batch = writeBatch(db);

    // 1. Products
    INITIAL_PRODUCTS.forEach(p => {
      const ref = doc(db, COLLECTIONS.PRODUCTS, p.id);
      batch.set(ref, p);
    });

    // 2. Warehouses
    INITIAL_WAREHOUSES.forEach(w => {
      const ref = doc(db, COLLECTIONS.WAREHOUSES, w.id);
      batch.set(ref, w);
    });

    // 3. DCs
    INITIAL_DCS.forEach(d => {
      const ref = doc(db, COLLECTIONS.DCS, d.id);
      batch.set(ref, d);
    });

    // 4. Initial Forecasts
    const initialForecasts = generateInitialForecasts();
    initialForecasts.forEach(f => {
      const ref = doc(db, COLLECTIONS.FORECASTS, f.id);
      batch.set(ref, f);
    });

    // 5. Initial Stocks
    INITIAL_WAREHOUSE_STOCKS.forEach(s => {
      const stockId = `${s.warehouseId}_${s.productId}`;
      const ref = doc(db, COLLECTIONS.STOCKS, stockId);
      batch.set(ref, s);
    });

    // 6. Initial Shipments
    INITIAL_SHIPMENTS.forEach(s => {
      const ref = doc(db, COLLECTIONS.SHIPMENTS, s.id);
      batch.set(ref, s);
    });

    // 7. Initial Mutations
    INITIAL_MUTATIONS.forEach(m => {
      const ref = doc(db, COLLECTIONS.MUTATIONS, m.id);
      batch.set(ref, m);
    });

    await batch.commit();
    console.log('Firestore seeding completed successfully.');
    return true;
  } catch (error) {
    console.warn('Could not seed initial data to Firestore (might be offline):', error);
    return false;
  }
}

// Real-time synchronization helper
export function setupFirestoreListeners(callbacks: {
  onProducts: (products: Product[]) => void;
  onWarehouses: (warehouses: Warehouse[]) => void;
  onDcs: (dcs: DistributionCenter[]) => void;
  onForecasts: (forecasts: ForecastItem[]) => void;
  onStocks: (stocks: WarehouseStock[]) => void;
  onShipments: (shipments: Shipment[]) => void;
  onMutations: (mutations: StockMutation[]) => void;
}) {
  const unsubProducts = onSnapshot(collection(db, COLLECTIONS.PRODUCTS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Product));
      callbacks.onProducts(data);
    }
  }, err => console.warn('Products sync err:', err.message));

  const unsubWarehouses = onSnapshot(collection(db, COLLECTIONS.WAREHOUSES), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Warehouse));
      callbacks.onWarehouses(data);
    }
  }, err => console.warn('Warehouses sync err:', err.message));

  const unsubDcs = onSnapshot(collection(db, COLLECTIONS.DCS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as DistributionCenter));
      callbacks.onDcs(data);
    }
  }, err => console.warn('DCs sync err:', err.message));

  const unsubForecasts = onSnapshot(collection(db, COLLECTIONS.FORECASTS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as ForecastItem));
      callbacks.onForecasts(data);
    }
  }, err => console.warn('Forecasts sync err:', err.message));

  const unsubStocks = onSnapshot(collection(db, COLLECTIONS.STOCKS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => d.data() as WarehouseStock);
      callbacks.onStocks(data);
    }
  }, err => console.warn('Stocks sync err:', err.message));

  const unsubShipments = onSnapshot(collection(db, COLLECTIONS.SHIPMENTS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as Shipment));
      callbacks.onShipments(data);
    }
  }, err => console.warn('Shipments sync err:', err.message));

  const unsubMutations = onSnapshot(collection(db, COLLECTIONS.MUTATIONS), snap => {
    if (!snap.empty) {
      const data = snap.docs.map(d => ({ ...d.data(), id: d.id } as StockMutation));
      callbacks.onMutations(data);
    }
  }, err => console.warn('Mutations sync err:', err.message));

  return () => {
    unsubProducts();
    unsubWarehouses();
    unsubDcs();
    unsubForecasts();
    unsubStocks();
    unsubShipments();
    unsubMutations();
  };
}

// Product cloud actions
export async function saveProductToFirestore(product: Product) {
  try {
    await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), product);
  } catch (e) {
    console.warn('saveProductToFirestore error:', e);
  }
}

export async function deleteProductFromFirestore(productId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, productId));
  } catch (e) {
    console.warn('deleteProductFromFirestore error:', e);
  }
}

// Warehouse cloud actions
export async function saveWarehouseToFirestore(wh: Warehouse) {
  try {
    await setDoc(doc(db, COLLECTIONS.WAREHOUSES, wh.id), wh);
  } catch (e) {
    console.warn('saveWarehouseToFirestore error:', e);
  }
}

// Distribution Center cloud actions
export async function saveDistributionCenterToFirestore(dc: DistributionCenter) {
  try {
    await setDoc(doc(db, COLLECTIONS.DCS, dc.id), dc);
  } catch (e) {
    console.warn('saveDistributionCenterToFirestore error:', e);
  }
}

export async function deleteDistributionCenterFromFirestore(dcId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.DCS, dcId));
  } catch (e) {
    console.warn('deleteDistributionCenterFromFirestore error:', e);
  }
}

// Forecast cloud actions
export async function saveForecastToFirestore(item: ForecastItem) {
  try {
    await setDoc(doc(db, COLLECTIONS.FORECASTS, item.id), item);
  } catch (e) {
    console.warn('saveForecastToFirestore error:', e);
  }
}

export async function batchSaveForecastsToFirestore(items: ForecastItem[]) {
  try {
    const batch = writeBatch(db);
    items.forEach(f => {
      batch.set(doc(db, COLLECTIONS.FORECASTS, f.id), f);
    });
    await batch.commit();
  } catch (e) {
    console.warn('batchSaveForecastsToFirestore error:', e);
  }
}

// Stock cloud actions
export async function saveStockToFirestore(stock: WarehouseStock) {
  try {
    const stockId = `${stock.warehouseId}_${stock.productId}`;
    await setDoc(doc(db, COLLECTIONS.STOCKS, stockId), stock);
  } catch (e) {
    console.warn('saveStockToFirestore error:', e);
  }
}

// Shipment cloud actions
export async function saveShipmentToFirestore(shipment: Shipment) {
  try {
    await setDoc(doc(db, COLLECTIONS.SHIPMENTS, shipment.id), shipment);
  } catch (e) {
    console.warn('saveShipmentToFirestore error:', e);
  }
}

export async function deleteShipmentFromFirestore(shipmentId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.SHIPMENTS, shipmentId));
  } catch (e) {
    console.warn('deleteShipmentFromFirestore error:', e);
  }
}

// Mutation cloud action
export async function saveMutationToFirestore(mutation: StockMutation) {
  try {
    await setDoc(doc(db, COLLECTIONS.MUTATIONS, mutation.id), mutation);
  } catch (e) {
    console.warn('saveMutationToFirestore error:', e);
  }
}
