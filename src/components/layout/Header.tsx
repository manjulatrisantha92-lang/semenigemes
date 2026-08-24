import React, { useState } from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  Menu,
  Receipt,
  PlusCircle,
  Gem,
  UserCheck,
  Shield,
  Clock,
  Sparkles,
  Search,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    currentPage,
    setCurrentPage,
    settings,
    products,
    formatCurrency,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const pageTitles: Record<NavigationPage, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time sales, workshop pipeline & stock analytics' },
    invoice_pos: { title: 'Jewelry Invoice & POS', subtitle: 'Barcode scanning, discount calculation & instant A4 print' },
    invoices_history: { title: 'Invoice Registry & Reprint', subtitle: 'Historical sales records & WhatsApp sharing' },
    return_invoice: { title: 'Sales Return & Restocking', subtitle: 'Process returned jewelry and restore inventory' },
    certificates: { title: 'Jewelry & Gem Certificates', subtitle: 'NGJA certified gemological authenticity documents' },
    inventory: { title: 'Jewelry & Gemstone Inventory', subtitle: 'Gold weights, carats, stock alerts & Excel export' },
    barcode_generator: { title: 'Thermal Barcode & Label Generator', subtitle: 'Multi-column thermal roll printing with exact 4mm column spacing & bill item barcode generation' },
    workshops: { title: 'Workshop Guilds & Studios', subtitle: 'Artisan workshop directory & making charge ledgers' },
    workshop_employees: { title: 'Craftsmen & Wage Payments', subtitle: 'Artisan roster, daily rates & wage vouchers' },
    create_order: { title: 'Create Custom Jewelry Order', subtitle: 'Order design JPG upload, gold allocation & workshop dispatch' },
    pending_orders: { title: 'Pending & Active Workshop Orders', subtitle: 'Track custom jewelry orders currently in progress' },
    completed_orders: { title: 'Completed Workshop Orders', subtitle: 'Finished jewelry ready for delivery or stock addition' },
    cancelled_orders: { title: 'Cancelled Orders', subtitle: 'Order cancellation logs and gold recovery audit' },
    workshop_advances: { title: 'Workshop Advance Payments', subtitle: 'Advance payment vouchers & workshop settlements' },
    purchases: { title: 'Supplier Purchases (Stock In)', subtitle: 'Gem parcels and gold bullion procurement' },
    purchase_returns: { title: 'Purchase Returns', subtitle: 'Return defective stones/bullion to dealers' },
    supplier_payments: { title: 'Supplier Payments & Balances', subtitle: 'Disbursements, payment vouchers & supplier ledger' },
    expenses: { title: 'Operating Expenses & Overheads', subtitle: 'Showroom utilities, rent, workshop tools & cost tracking' },
    customers: { title: 'Customer Directory & CRM', subtitle: 'Client purchase history & WhatsApp communications' },
    promotions: { title: 'WhatsApp & Facebook Promotions', subtitle: 'Curated campaign discounts and social media promo links' },
    reports: { title: 'Business & Management Reports', subtitle: 'Printable A4 financial statements, sales & workshop audits' },
    users: { title: 'User Account Management', subtitle: 'Manage staff roles, access permissions & logins' },
    settings: { title: 'System Settings & JPG Templates', subtitle: 'Company details, letterhead JPG imports & print margins' },
    backup_restore: { title: 'Backup & Data Restore', subtitle: 'Download JSON database backup & restore system state' },
    mongodb_schema: { title: 'MongoDB Atlas & Vercel Architecture', subtitle: 'Production database schema & serverless integration' },
  };

  const currentInfo = pageTitles[currentPage] || { title: 'WCS Inventory', subtitle: 'Jewelry Management' };

  // Live search products
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode.includes(searchQuery) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-30 bg-[#0F1115] border-b border-[#2D3139] px-4 sm:px-6 py-3 text-[#E0E0E0] flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1A1D23] lg:hidden transition"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate font-serif">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-gray-500 hidden sm:block truncate">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Center: Global Search / Barcode Search */}
      <div className="relative hidden md:block w-72 lg:w-96">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Barcode, Code or Item..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#1A1D23] border border-[#2D3139] rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-[#2D3139]">
            <div className="px-3 py-1.5 bg-[#0F1115] text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider">
              Quick Item Results
            </div>
            {searchResults.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentPage('inventory_catalog');
                  setShowSearchResults(false);
                  setSearchQuery('');
                }}
                className="p-2.5 hover:bg-[#252932] cursor-pointer flex items-center gap-3 transition"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-9 h-9 rounded object-cover border border-[#D4AF37]/40"
                />
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-white truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-400 font-mono">
                    {item.itemCode} | {formatCurrency(item.sellingPrice)}
                  </p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] font-medium">
                  {item.stockQuantity} in stock
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Server Status, Quick Action Buttons & Switch User Dropdown */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Server Status indicator from Bento theme */}
        <div className="hidden xl:flex flex-col text-right pr-2 border-r border-[#2D3139]">
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Server Status</span>
          <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            MongoDB Connected
          </span>
        </div>

        {/* Quick New Invoice Button */}
        <button
          onClick={() => setCurrentPage('invoice_pos')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#D4AF37] text-[#0F1115] hover:bg-[#c4a030] text-xs font-bold rounded-lg shadow-lg shadow-[#D4AF3720] transition"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">+ New</span> POS
        </button>

        {currentUser?.role !== 'user' && (
          <button
            onClick={() => setCurrentPage('create_order')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1D23] hover:bg-[#252932] text-[#D4AF37] text-xs font-semibold rounded-lg border border-[#2D3139] transition"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Custom Order
          </button>
        )}

        {/* User Role & Quick Switcher */}
        <div className="relative flex items-center gap-2 pl-2 border-l border-[#2D3139]">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white truncate max-w-[130px]">
              {currentUser?.name}
            </p>
            <p className="text-[10px] text-[#D4AF37] font-semibold uppercase tracking-wider">
              {currentUser?.role} Role
            </p>
          </div>

          <select
            value={currentUser?.id || ''}
            onChange={(e) => {
              const selected = users.find((u) => u.id === e.target.value);
              if (selected) setCurrentUser(selected);
            }}
            className="bg-[#1A1D23] border border-[#2D3139] text-[#E0E0E0] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#D4AF37] cursor-pointer"
            title="Switch Active Staff User"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
