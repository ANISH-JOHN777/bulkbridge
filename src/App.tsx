import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoBanner } from './components/common/DemoBanner';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoGuideModal } from './components/common/DemoGuideModal';

// Public Views
import { HomePage } from './components/public/HomePage';

// Retailer Views
import { RetailerOverview } from './components/retailer/RetailerOverview';
import { ProductCatalog } from './components/retailer/ProductCatalog';
import { CampaignDiscovery } from './components/retailer/CampaignDiscovery';
import { CampaignDetail } from './components/retailer/CampaignDetail';
import { MyOrders } from './components/retailer/MyOrders';
import { MyInvoices } from './components/retailer/MyInvoices';
import { MyPayments } from './components/retailer/MyPayments';
import { BusinessProfile } from './components/retailer/BusinessProfile';

// Supplier Views
import { SupplierOverview } from './components/supplier/SupplierOverview';
import { SupplierCatalog } from './components/supplier/SupplierCatalog';
import { SupplierCampaigns } from './components/supplier/SupplierCampaigns';
import { SupplierOrders } from './components/supplier/SupplierOrders';
import { SupplierReconciliation } from './components/supplier/SupplierReconciliation';

// Organizer Views
import { OrganizerOverview } from './components/organizer/OrganizerOverview';
import { OrganizerCampaigns } from './components/organizer/OrganizerCampaigns';
import { SupplierComparison } from './components/organizer/SupplierComparison';
import { OrganizerExceptions } from './components/organizer/OrganizerExceptions';

// Finance Views
import { FinanceOverview } from './components/finance/FinanceOverview';
import { ReconciliationView } from './components/finance/ReconciliationView';
import { InvoiceRegister } from './components/finance/InvoiceRegister';
import { PaymentRegister } from './components/finance/PaymentRegister';
import { RefundCreditNotes } from './components/finance/RefundCreditNotes';

// Warehouse Views
import { WarehouseOverview } from './components/warehouse/WarehouseOverview';
import { WarehouseShipments } from './components/warehouse/WarehouseShipments';
import { InventoryLedgerView } from './components/warehouse/InventoryLedgerView';
import { WarehouseReturns } from './components/warehouse/WarehouseReturns';

// Admin Views
import { AdminOverview } from './components/admin/AdminOverview';
import { UserOrgManagement } from './components/admin/UserOrgManagement';
import { VerificationQueue } from './components/admin/VerificationQueue';
import { AnalyticsView } from './components/admin/AnalyticsView';
import { AuditLogsView } from './components/admin/AuditLogsView';
import { SystemSettings } from './components/admin/SystemSettings';

const MainLayout: React.FC = () => {
  const { activeView } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isPublic = activeView.startsWith('public-');

  const renderActiveView = () => {
    switch (activeView) {
      // Public Pages
      case 'public-home':
      case 'public-how-it-works':
      case 'public-retailers':
      case 'public-suppliers':
      case 'public-pricing':
      case 'public-faq':
        return <HomePage />;

      // Retailer Workspace
      case 'retailer-overview':
        return <RetailerOverview />;
      case 'retailer-catalog':
        return <ProductCatalog />;
      case 'retailer-campaigns':
        return <CampaignDiscovery />;
      case 'campaign-detail':
        return <CampaignDetail />;
      case 'retailer-orders':
        return <MyOrders />;
      case 'retailer-invoices':
        return <MyInvoices />;
      case 'retailer-payments':
        return <MyPayments />;
      case 'retailer-profile':
        return <BusinessProfile />;

      // Supplier Workspace
      case 'supplier-overview':
        return <SupplierOverview />;
      case 'supplier-catalog':
        return <SupplierCatalog />;
      case 'supplier-campaigns':
        return <SupplierCampaigns />;
      case 'supplier-orders':
        return <SupplierOrders />;
      case 'supplier-reconciliation':
        return <SupplierReconciliation />;

      // Organizer Workspace
      case 'organizer-overview':
        return <OrganizerOverview />;
      case 'organizer-campaigns':
        return <OrganizerCampaigns />;
      case 'organizer-comparison':
        return <SupplierComparison />;
      case 'organizer-exceptions':
        return <OrganizerExceptions />;

      // Finance Workspace
      case 'finance-overview':
        return <FinanceOverview />;
      case 'finance-reconciliation':
        return <ReconciliationView />;
      case 'finance-invoices':
        return <InvoiceRegister />;
      case 'finance-payments':
        return <PaymentRegister />;
      case 'finance-refunds':
        return <RefundCreditNotes />;

      // Warehouse Workspace
      case 'warehouse-overview':
        return <WarehouseOverview />;
      case 'warehouse-shipments':
        return <WarehouseShipments />;
      case 'warehouse-inventory':
        return <InventoryLedgerView />;
      case 'warehouse-returns':
        return <WarehouseReturns />;

      // Admin & Governance Workspace
      case 'admin-overview':
        return <AdminOverview />;
      case 'admin-users':
        return <UserOrgManagement />;
      case 'admin-verification':
        return <VerificationQueue />;
      case 'admin-analytics':
        return <AnalyticsView />;
      case 'admin-audit':
        return <AuditLogsView />;
      case 'admin-settings':
        return <SystemSettings />;

      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <DemoBanner />
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} isSidebarOpen={sidebarOpen} />
      <ToastContainer />
      <DemoGuideModal />

      {isPublic ? (
        <main className="flex-1">{renderActiveView()}</main>
      ) : (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderActiveView()}
          </main>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
