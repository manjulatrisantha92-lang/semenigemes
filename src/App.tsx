import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { TopNavbar } from './components/layout/TopNavbar';
import { ToastContainer } from './components/common/ToastContainer';

// Print Modals
import { InvoicePrintModal } from './components/print/InvoicePrintModal';
import { CertificatePrintModal } from './components/print/CertificatePrintModal';
import { ReportPrintModal } from './components/print/ReportPrintModal';
import { BarcodeLabelsModal } from './components/print/BarcodeLabelsModal';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InvoicePOSPage } from './pages/InvoicePOSPage';
import { InvoicesHistoryPage } from './pages/InvoicesHistoryPage';
import { ReturnInvoicePage } from './pages/ReturnInvoicePage';
import { CertificatesPage } from './pages/CertificatesPage';
import { InventoryPage } from './pages/InventoryPage';
import { BarcodeGeneratorPage } from './pages/BarcodeGeneratorPage';
import { CreateOrderPage } from './pages/CreateOrderPage';
import { OrdersListPage } from './pages/OrdersListPage';
import { WorkshopsDirectoryPage } from './pages/WorkshopsDirectoryPage';
import { WorkshopEmployeesPage } from './pages/WorkshopEmployeesPage';
import { WorkshopAdvancesPage } from './pages/WorkshopAdvancesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SupplierPaymentsPage } from './pages/SupplierPaymentsPage';
import { PurchaseReturnsPage } from './pages/PurchaseReturnsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { CustomersPage } from './pages/CustomersPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { ReportsPage } from './pages/ReportsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { BackupRestorePage } from './pages/BackupRestorePage';
import { MongoDbSchemaPage } from './pages/MongoDbSchemaPage';

const MainLayout: React.FC = () => {
  const {
    currentUser,
    currentPage,
    setCurrentPage,
    activePrintInvoice,
    activePrintCertificate,
    activePrintReport,
    activePrintBarcodeProduct,
    setActivePrintInvoice,
    setActivePrintCertificate,
    setActivePrintReport,
    setActivePrintBarcodeProduct,
  } = useApp();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If not logged in, render the login page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0F1115] text-[#E0E0E0] flex flex-col justify-center">
        <LoginPage />
        <ToastContainer />
      </div>
    );
  }

  // Role Protection: 'user' role can only access POS, history, return, certificates, promotions, and customers
  const isRestrictedUser = currentUser.role === 'user';
  const allowedUserPages = [
    'invoice_pos',
    'invoices_history',
    'invoice_return',
    'certificates',
    'barcode_generator',
    'customers',
    'promotions',
  ];

  const currentSafePage =
    isRestrictedUser && !allowedUserPages.includes(currentPage)
      ? 'invoice_pos'
      : currentPage;

  const renderActivePage = () => {
    switch (currentSafePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'invoice_pos':
        return <InvoicePOSPage />;
      case 'invoices_history':
        return <InvoicesHistoryPage />;
      case 'invoice_return':
      case 'return_invoice':
        return <ReturnInvoicePage />;
      case 'certificates':
        return <CertificatesPage />;
      case 'inventory':
      case 'inventory_catalog':
        return <InventoryPage />;
      case 'barcode_generator':
        return <BarcodeGeneratorPage />;
      case 'create_order':
        return <CreateOrderPage />;
      case 'orders_pending':
      case 'pending_orders':
        return <OrdersListPage filterStatusGroup="pending" />;
      case 'orders_completed':
      case 'completed_orders':
        return <OrdersListPage filterStatusGroup="completed" />;
      case 'orders_cancelled':
      case 'cancelled_orders':
        return <OrdersListPage filterStatusGroup="cancelled" />;
      case 'workshops':
      case 'workshops_directory':
        return <WorkshopsDirectoryPage />;
      case 'workshop_employees':
        return <WorkshopEmployeesPage />;
      case 'workshop_advances':
        return <WorkshopAdvancesPage />;
      case 'purchases':
      case 'purchases_list':
        return <PurchasesPage />;
      case 'supplier_payments':
        return <SupplierPaymentsPage />;
      case 'purchase_returns':
        return <PurchaseReturnsPage />;
      case 'expenses':
        return <ExpensesPage />;
      case 'customers':
        return <CustomersPage />;
      case 'promotions':
        return <PromotionsPage />;
      case 'reports':
      case 'reports_analytics':
        return <ReportsPage />;
      case 'users':
      case 'user_management':
        return <UsersPage />;
      case 'settings':
        return <SettingsPage />;
      case 'backup_restore':
        return <BackupRestorePage />;
      case 'mongodb_schema':
        return <MongoDbSchemaPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1115] text-[#E0E0E0] font-sans antialiased">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Page Content */}
      <main className="flex-1 overflow-y-auto bg-[#0F1115] text-[#E0E0E0]">
        {renderActivePage()}
      </main>

      {/* Global Print Overlays */}
      {activePrintInvoice && (
        <InvoicePrintModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}

      {activePrintCertificate && (
        <CertificatePrintModal
          certificate={activePrintCertificate}
          onClose={() => setActivePrintCertificate(null)}
        />
      )}

      {activePrintReport && (
        <ReportPrintModal
          report={activePrintReport}
          onClose={() => setActivePrintReport(null)}
        />
      )}

      {activePrintBarcodeProduct && (
        <BarcodeLabelsModal
          product={activePrintBarcodeProduct}
          onClose={() => setActivePrintBarcodeProduct(null)}
        />
      )}

      <ToastContainer />
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
