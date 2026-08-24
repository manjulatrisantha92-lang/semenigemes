import React, { useState, useRef, useEffect } from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import { CategoryManagementModal } from '../categories/CategoryManagementModal';
import { ChangePasswordModal } from '../auth/ChangePasswordModal';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  RotateCcw,
  Award,
  Gem,
  Barcode,
  Tags,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  Hammer,
  Users2,
  Coins,
  ShoppingCart,
  Undo2,
  Contact,
  Megaphone,
  BarChart3,
  UserCog,
  Settings,
  Database,
  Code2,
  LogOut,
  ChevronDown,
  KeyRound,
  Shield,
  Menu,
  X,
  Search,
  Sparkles,
  Zap,
  DollarSign,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const TopNavbar: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    currentPage,
    setCurrentPage,
    logout,
    settings,
    orders,
    products,
    categories,
    formatCurrency,
    isFullscreen,
    toggleFullscreen,
  } = useApp();

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Keyboard shortcut listener for F11
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleFullscreen]);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userRole = currentUser?.role || 'user';
  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Sent to Workshop' || o.status === 'In Progress'
  ).length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  const navigateTo = (page: NavigationPage) => {
    setCurrentPage(page);
    setOpenDropdown(null);
    setShowUserMenu(false);
    setMobileMenuOpen(false);
  };

  // Filtered search results
  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.barcode.includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <>
      <header
        ref={navRef}
        className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#1E2738] text-[#E0E0E0] select-none shadow-lg"
      >
        {/* TOP ROW: Brand, Navigation Menus, Quick Actions, User Profile */}
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Left: Brand / Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-2.5 text-left group focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-[1px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
                  <div className="w-full h-full bg-[#0B0F17] rounded-[11px] flex items-center justify-center">
                    <Gem className="w-5 h-5 text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm sm:text-base tracking-wider text-white uppercase font-serif">
                      {settings.companyName || 'WCS GEMS & JEWELRY'}
                    </span>
                    <span className="text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      POS v4.2
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate max-w-[220px] hidden sm:block">
                    {settings.tagline || 'Fine Ceylon Gems & Workshop ERP'}
                  </p>
                </div>
              </button>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 justify-center max-w-4xl">
              {/* Dashboard Button */}
              <button
                onClick={() => navigateTo('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                  currentPage === 'dashboard'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              {/* POS & Sales Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'sales' ? null : 'sales')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    ['invoice_pos', 'invoices_history', 'return_invoice', 'certificates'].includes(
                      currentPage
                    )
                      ? 'bg-[#182338] text-amber-400 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                  }`}
                >
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Sales & POS</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === 'sales' ? 'rotate-180 text-amber-400' : 'text-gray-400'
                    }`}
                  />
                </button>

                {openDropdown === 'sales' && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => navigateTo('invoice_pos')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'invoice_pos'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Receipt className="w-4 h-4 text-amber-400" />
                      <div className="text-left">
                        <div className="font-bold">New Invoice (POS)</div>
                        <div className="text-[10px] text-gray-400">Barcode scan & A4 receipt</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('invoices_history')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'invoices_history'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <FileText className="w-4 h-4 text-sky-400" />
                      <div className="text-left">
                        <div className="font-bold">Invoice History & Reprint</div>
                        <div className="text-[10px] text-gray-400">Sales records & reprints</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('return_invoice')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'return_invoice'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4 text-rose-400" />
                      <div className="text-left">
                        <div className="font-bold">Sales Returns</div>
                        <div className="text-[10px] text-gray-400">Restock returned items</div>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateTo('certificates')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'certificates'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Award className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <div className="font-bold">Gem & Jewelry Certificates</div>
                        <div className="text-[10px] text-gray-400">NGJA authenticity cards</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Stock & Inventory Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'stock' ? null : 'stock')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    ['inventory', 'barcode_generator'].includes(currentPage)
                      ? 'bg-[#182338] text-amber-400 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                  }`}
                >
                  <Gem className="w-4 h-4 text-cyan-400" />
                  <span>Jewelry & Stock</span>
                  {lowStockCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === 'stock' ? 'rotate-180 text-amber-400' : 'text-gray-400'
                    }`}
                  />
                </button>

                {openDropdown === 'stock' && (
                  <div className="absolute left-0 mt-2 w-72 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => navigateTo('inventory')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'inventory'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Gem className="w-4 h-4 text-cyan-400" />
                        <div className="text-left">
                          <div className="font-bold">Stock Inventory</div>
                          <div className="text-[10px] text-gray-400">Jewelry items & carats</div>
                        </div>
                      </div>
                      {lowStockCount > 0 && (
                        <span className="bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                          {lowStockCount} Low
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => navigateTo('barcode_generator')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'barcode_generator'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Barcode className="w-4 h-4 text-emerald-400" />
                      <div className="text-left">
                        <div className="font-bold">Barcode & Tag Generator</div>
                        <div className="text-[10px] text-gray-400">Multi-size thermal roll printing</div>
                      </div>
                    </button>

                    {/* Manage Categories Button */}
                    <div className="pt-1 mt-1 border-t border-[#1C2538]">
                      <button
                        onClick={() => {
                          setOpenDropdown(null);
                          setShowCategoryModal(true);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition"
                      >
                        <div className="flex items-center gap-2.5">
                          <Tags className="w-4 h-4 text-amber-400" />
                          <div className="text-left">
                            <div className="font-bold">Manage Categories</div>
                            <div className="text-[10px] text-gray-400">
                              {categories.length} dynamic categories
                            </div>
                          </div>
                        </div>
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded">
                          + Add/Edit
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Workshop Guild Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'workshop' ? null : 'workshop')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    [
                      'create_order',
                      'pending_orders',
                      'completed_orders',
                      'cancelled_orders',
                      'workshops',
                      'workshop_employees',
                      'workshop_advances',
                    ].includes(currentPage)
                      ? 'bg-[#182338] text-amber-400 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                  }`}
                >
                  <Hammer className="w-4 h-4 text-orange-400" />
                  <span>Workshop Guild</span>
                  {pendingOrdersCount > 0 && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {pendingOrdersCount}
                    </span>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === 'workshop' ? 'rotate-180 text-amber-400' : 'text-gray-400'
                    }`}
                  />
                </button>

                {openDropdown === 'workshop' && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => navigateTo('create_order')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'create_order'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Create Custom Order</span>
                    </button>

                    <button
                      onClick={() => navigateTo('pending_orders')}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'pending_orders'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="font-bold">Pending Orders</span>
                      </div>
                      {pendingOrdersCount > 0 && (
                        <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {pendingOrdersCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => navigateTo('completed_orders')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'completed_orders'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Completed Orders</span>
                    </button>

                    <button
                      onClick={() => navigateTo('cancelled_orders')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'cancelled_orders'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span className="font-bold">Cancelled Orders</span>
                    </button>

                    <div className="border-t border-[#1E2738] my-1" />

                    <button
                      onClick={() => navigateTo('workshops')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'workshops'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Hammer className="w-4 h-4 text-orange-400" />
                      <span className="font-bold">Workshops Directory</span>
                    </button>

                    <button
                      onClick={() => navigateTo('workshop_employees')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'workshop_employees'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Users2 className="w-4 h-4 text-indigo-400" />
                      <span className="font-bold">Craftsmen & Wages</span>
                    </button>

                    <button
                      onClick={() => navigateTo('workshop_advances')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'workshop_advances'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Workshop Advances</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Purchasing & CRM Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'crm' ? null : 'crm')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    ['purchases', 'supplier_payments', 'purchase_returns', 'expenses', 'customers', 'promotions'].includes(currentPage)
                      ? 'bg-[#182338] text-amber-400 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 text-emerald-400" />
                  <span>Purchases & Finance</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === 'crm' ? 'rotate-180 text-amber-400' : 'text-gray-400'
                    }`}
                  />
                </button>

                {openDropdown === 'crm' && (
                  <div className="absolute left-0 mt-2 w-64 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => navigateTo('purchases')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'purchases'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Purchase Orders (Stock In)</span>
                    </button>

                    <button
                      onClick={() => navigateTo('supplier_payments')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'supplier_payments'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Supplier Payments & Balances</span>
                    </button>

                    <button
                      onClick={() => navigateTo('purchase_returns')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'purchase_returns'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Undo2 className="w-4 h-4 text-rose-400" />
                      <span className="font-bold">Purchase Returns</span>
                    </button>

                    <button
                      onClick={() => navigateTo('expenses')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'expenses'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <DollarSign className="w-4 h-4 text-red-400" />
                      <span className="font-bold">Operating Expenses</span>
                    </button>

                    <div className="border-t border-[#1E2738] my-1" />

                    <button
                      onClick={() => navigateTo('customers')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'customers'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Contact className="w-4 h-4 text-sky-400" />
                      <span className="font-bold">Customer Directory</span>
                    </button>

                    <button
                      onClick={() => navigateTo('promotions')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'promotions'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Megaphone className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">WhatsApp Promotions</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reports & Settings Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenDropdown(openDropdown === 'admin' ? null : 'admin')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${
                    ['reports', 'users', 'settings', 'backup_restore', 'mongodb_schema'].includes(
                      currentPage
                    )
                      ? 'bg-[#182338] text-amber-400 border border-amber-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-[#151D2C]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Management</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      openDropdown === 'admin' ? 'rotate-180 text-amber-400' : 'text-gray-400'
                    }`}
                  />
                </button>

                {openDropdown === 'admin' && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => navigateTo('reports')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'reports'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-4 h-4 text-purple-400" />
                      <span className="font-bold">A4 Business Reports</span>
                    </button>

                    <button
                      onClick={() => navigateTo('users')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'users'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <UserCog className="w-4 h-4 text-sky-400" />
                      <span className="font-bold">Staff & Passwords</span>
                    </button>

                    <button
                      onClick={() => navigateTo('settings')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'settings'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Settings className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Settings & Letterhead JPG</span>
                    </button>

                    <button
                      onClick={() => navigateTo('backup_restore')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'backup_restore'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Database className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Backup & Restore</span>
                    </button>

                    <button
                      onClick={() => navigateTo('mongodb_schema')}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                        currentPage === 'mongodb_schema'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-gray-200 hover:bg-[#1A2336] hover:text-white'
                      }`}
                    >
                      <Code2 className="w-4 h-4 text-gray-400" />
                      <span className="font-bold">MongoDB Architecture</span>
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* Right: Quick Action Buttons, Search, & User Profile */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Quick POS Action Button */}
              <button
                onClick={() => navigateTo('invoice_pos')}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md shadow-amber-500/20 transition transform active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>POS Invoice</span>
              </button>

              {/* Quick Category Manager Button */}
              <button
                onClick={() => setShowCategoryModal(true)}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#141A26] hover:bg-[#1B2333] border border-[#26334A] text-amber-300 rounded-xl text-xs font-semibold transition"
                title="Manage Product Categories"
              >
                <Tags className="w-3.5 h-3.5 text-amber-400" />
                <span>Categories</span>
              </button>

              {/* Search Toggle */}
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2 text-gray-400 hover:text-white bg-[#141A26] hover:bg-[#1B2333] border border-[#26334A] rounded-xl transition"
                title="Quick Stock Search"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Fullscreen Mode Toggle Button */}
              <button
                type="button"
                id="btn-toggle-fullscreen"
                onClick={toggleFullscreen}
                className={`p-2 rounded-xl border transition flex items-center justify-center ${
                  isFullscreen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 ring-1 ring-amber-500/30'
                    : 'text-gray-400 hover:text-white bg-[#141A26] hover:bg-[#1B2333] border-[#26334A]'
                }`}
                title={isFullscreen ? 'Exit Fullscreen (F11)' : 'Toggle Fullscreen Mode (F11)'}
                aria-label="Toggle Fullscreen Mode"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>

              {/* User Profile / Password Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#141A26] hover:bg-[#1B2333] border border-[#26334A] rounded-xl transition text-left"
                >
                  <img
                    src={
                      currentUser?.avatarUrl ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser?.name || 'User'}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-amber-500/40"
                  />
                  <div className="hidden xl:block text-left">
                    <div className="text-xs font-bold text-white truncate max-w-[110px]">
                      {currentUser?.name?.split(' ')[0] || 'User'}
                    </div>
                    <div className="text-[10px] text-amber-400 uppercase font-mono tracking-wider">
                      {currentUser?.role || 'Staff'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Header */}
                    <div className="p-3 bg-[#161D2B] rounded-xl border border-[#222E42] mb-2">
                      <div className="text-xs font-bold text-white truncate">
                        {currentUser?.name}
                      </div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        {currentUser?.email || currentUser?.username}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                          Role: {currentUser?.role}
                        </span>
                        <span className="text-[10px] text-gray-400">Active</span>
                      </div>
                    </div>

                    {/* Change Password Option */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowChangePasswordModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 transition mb-1"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Change My Password</span>
                    </button>

                    {/* Toggle Fullscreen Option */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        toggleFullscreen();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-[#1A2336] hover:text-white transition"
                    >
                      <div className="flex items-center gap-2.5">
                        {isFullscreen ? (
                          <Minimize2 className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-indigo-400" />
                        )}
                        <span>{isFullscreen ? 'Exit Fullscreen' : 'Toggle Fullscreen'}</span>
                      </div>
                      <span className="text-[10px] font-mono text-gray-400 bg-[#141A26] px-1.5 py-0.5 rounded border border-[#232F45]">
                        F11
                      </span>
                    </button>

                    {/* Manage Categories Option */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowCategoryModal(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-[#1A2336] hover:text-white transition"
                    >
                      <Tags className="w-4 h-4 text-cyan-400" />
                      <span>Manage Categories</span>
                    </button>

                    {/* Settings Option */}
                    <button
                      onClick={() => navigateTo('settings')}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-[#1A2336] hover:text-white transition"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>System Settings</span>
                    </button>

                    {/* Staff Accounts */}
                    {(userRole === 'admin' || userRole === 'owner') && (
                      <button
                        onClick={() => navigateTo('users')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-200 hover:bg-[#1A2336] hover:text-white transition"
                      >
                        <UserCog className="w-4 h-4 text-sky-400" />
                        <span>Staff User Accounts</span>
                      </button>
                    )}

                    <div className="border-t border-[#1E2738] my-1.5" />

                    {/* Logout Option */}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-400" />
                      <span>Log Out Securely</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-white bg-[#141A26] rounded-xl lg:hidden transition"
                title="Toggle Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A0D14] border-t border-[#1E2738] px-4 py-4 max-h-[85vh] overflow-y-auto space-y-3 animate-in fade-in duration-150">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => navigateTo('invoice_pos')}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>POS</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowCategoryModal(true);
                }}
                className="flex items-center justify-center gap-1.5 p-2.5 bg-[#141A26] border border-amber-500/30 text-amber-300 font-bold text-xs rounded-xl"
              >
                <Tags className="w-4 h-4 text-amber-400" />
                <span>Tags</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  toggleFullscreen();
                }}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl border font-bold text-xs transition ${
                  isFullscreen
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-[#141A26] text-gray-200 border-[#26334A]'
                }`}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-indigo-400" />
                )}
                <span>{isFullscreen ? 'Exit' : 'Full'}</span>
              </button>
            </div>

            <div className="space-y-1 pt-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 px-2 py-1">
                Main Menus
              </div>

              <button
                onClick={() => navigateTo('dashboard')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => navigateTo('invoice_pos')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'invoice_pos' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <Receipt className="w-4 h-4 text-amber-400" />
                <span>Sales POS Invoice</span>
              </button>

              <button
                onClick={() => navigateTo('invoices_history')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'invoices_history' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <FileText className="w-4 h-4 text-sky-400" />
                <span>Invoice Registry</span>
              </button>

              <button
                onClick={() => navigateTo('inventory')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'inventory' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <Gem className="w-4 h-4 text-cyan-400" />
                <span>Stock Inventory</span>
              </button>

              <button
                onClick={() => navigateTo('barcode_generator')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'barcode_generator' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <Barcode className="w-4 h-4 text-emerald-400" />
                <span>Thermal Barcode Generator</span>
              </button>

              <button
                onClick={() => navigateTo('pending_orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'pending_orders' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Workshop Orders</span>
              </button>

              <button
                onClick={() => navigateTo('users')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'users' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <UserCog className="w-4 h-4 text-sky-400" />
                <span>User Staff & Passwords</span>
              </button>

              <button
                onClick={() => navigateTo('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  currentPage === 'settings' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-gray-200'
                }`}
              >
                <Settings className="w-4 h-4 text-amber-400" />
                <span>Settings & JPG Letterhead</span>
              </button>
            </div>

            <div className="pt-2 border-t border-[#1E2738] flex gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowChangePasswordModal(true);
                }}
                className="w-1/2 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Password</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-1/2 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Global Stock Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex justify-center items-start pt-20 p-4">
          <div className="bg-[#0F1420] border border-[#232F45] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[#232F45] flex items-center gap-3">
              <Search className="w-5 h-5 text-amber-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search jewelry by Name, Code, Barcode, or Category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-white placeholder-gray-500 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-gray-400 hover:text-white bg-[#1A2336] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-96 overflow-y-auto divide-y divide-[#1A2336]">
              {searchResults.length > 0 ? (
                searchResults.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setShowSearchModal(false);
                      navigateTo('inventory');
                    }}
                    className="p-2.5 flex items-center justify-between hover:bg-[#1A2336] rounded-xl cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          Code: {p.itemCode} | Barcode: {p.barcode} | {p.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-amber-400">
                        {formatCurrency(p.sellingPrice)}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Stock: {p.stockQuantity} {p.unit}
                      </div>
                    </div>
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="py-8 text-center text-xs text-gray-400">
                  No matching jewelry items or gemstones found.
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-gray-500">
                  Type an item name, code (e.g. RING-01), or barcode to search instantly.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal onClose={() => setShowCategoryModal(false)} />
      )}

      {/* User Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal onClose={() => setShowChangePasswordModal(false)} />
      )}
    </>
  );
};
