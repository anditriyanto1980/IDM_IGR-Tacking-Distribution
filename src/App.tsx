/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ControllingMatrixView } from './components/ControllingMatrixView';
import { ShipmentListView } from './components/ShipmentListView';
import { WarehouseStockView } from './components/WarehouseStockView';
import { ProductMasterView } from './components/ProductMasterView';
import { ForecastManagerView } from './components/ForecastManagerView';
import { ShipmentModal } from './components/ShipmentModal';
import { StockInModal } from './components/StockInModal';
import { ShipmentDetailModal } from './components/ShipmentDetailModal';
import { Shipment } from './types';

function MainLayout() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Shipment modal state
  const [shipmentModalOpen, setShipmentModalOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [defaultDcId, setDefaultDcId] = useState<string | undefined>(undefined);
  const [defaultProductId, setDefaultProductId] = useState<string | undefined>(undefined);

  // Stock Inbound modal state
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [stockInWhId, setStockInWhId] = useState<string | undefined>(undefined);
  const [stockInProdId, setStockInProdId] = useState<string | undefined>(undefined);

  // Shipment detail modal state
  const [detailShipment, setDetailShipment] = useState<Shipment | null>(null);

  // Filter matrix product state
  const [matrixInitialProductId, setMatrixInitialProductId] = useState<string | undefined>(undefined);

  // Open Shipment modal for blank new SO
  const handleOpenNewShipment = () => {
    setEditingShipment(null);
    setDefaultDcId(undefined);
    setDefaultProductId(undefined);
    setShipmentModalOpen(true);
  };

  // Open Shipment modal prefilled for specific DC & Product
  const handleOpenShipmentForDC = (dcId: string, productId: string) => {
    setEditingShipment(null);
    setDefaultDcId(dcId);
    setDefaultProductId(productId);
    setShipmentModalOpen(true);
  };

  // Open Shipment modal for edit
  const handleOpenEditShipment = (shipment?: Shipment) => {
    if (shipment) {
      setEditingShipment(shipment);
      setDefaultDcId(undefined);
      setDefaultProductId(undefined);
    } else {
      setEditingShipment(null);
    }
    setShipmentModalOpen(true);
  };

  // Open Inbound Stock modal
  const handleOpenStockIn = (whId?: string, prodId?: string) => {
    setStockInWhId(whId);
    setStockInProdId(prodId);
    setStockInModalOpen(true);
  };

  // Switch to matrix filtered by product
  const handleFilterMatrixByProduct = (productId: string) => {
    setMatrixInitialProductId(productId);
  };

  return (
    <div className="min-h-screen clay-bg-canvas text-slate-900 flex flex-col font-sans antialiased selection:bg-blue-400 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenShipmentModal={handleOpenNewShipment}
        onOpenStockInModal={() => handleOpenStockIn()}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 pb-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            setActiveTab={setActiveTab}
            onOpenShipmentModal={handleOpenNewShipment}
            onOpenStockInModal={() => handleOpenStockIn()}
            onFilterMatrixByProduct={handleFilterMatrixByProduct}
          />
        )}

        {activeTab === 'matrix' && (
          <ControllingMatrixView
            onOpenShipmentForDC={handleOpenShipmentForDC}
            initialProductId={matrixInitialProductId}
          />
        )}

        {activeTab === 'shipments' && (
          <ShipmentListView
            onOpenShipmentModal={handleOpenEditShipment}
            onOpenDetailModal={setDetailShipment}
          />
        )}

        {activeTab === 'stock' && (
          <WarehouseStockView
            onOpenStockInModal={handleOpenStockIn}
          />
        )}

        {activeTab === 'products' && (
          <ProductMasterView />
        )}

        {activeTab === 'forecast' && (
          <ForecastManagerView />
        )}
      </main>

      {/* Global Footer */}
      <footer className="bg-blue-950/50 backdrop-blur-xs border-t border-white/10 py-4 text-center text-xs text-blue-200">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-semibold text-white">LogiTrack DC · 3D Claymorphic Logistics Platform</span>
          <span className="text-[11px] text-blue-300">
            Distribusi Nasional DC Indomarco & Indogrosir · Kurma Akram & DC
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ShipmentModal
        isOpen={shipmentModalOpen}
        onClose={() => setShipmentModalOpen(false)}
        editShipment={editingShipment}
        defaultDcId={defaultDcId}
        defaultProductId={defaultProductId}
      />

      <StockInModal
        isOpen={stockInModalOpen}
        onClose={() => setStockInModalOpen(false)}
        defaultWarehouseId={stockInWhId}
        defaultProductId={stockInProdId}
      />

      <ShipmentDetailModal
        shipment={detailShipment}
        onClose={() => setDetailShipment(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
