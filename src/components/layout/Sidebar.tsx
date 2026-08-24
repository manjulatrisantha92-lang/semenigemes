import React from 'react';
import { useApp, NavigationPage } from '../../context/AppContext';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  RotateCcw,
  Award,
  Gem,
  Hammer,
  Users2,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
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
  ChevronRight,
  Shield,
  Sparkles,
  Barcode,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  roles: ('admin' | 'owner' | 'user')[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const {
    currentUser,
    currentPage,
    setCurrentPage,
    logout,
    orders,
    products,
    settings,
  } = useApp();

  const userRole = currentUser?.role || 'user';

  // Badges
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pending' || o.status === 'Sent to Workshop' || o.status === 'In Progress').length;
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  const sections: NavSection[] = [
    {
      title: 'Main',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Sales & Invoicing',
      items: [
        {
          id: 'invoice_pos',
          label: 'New Invoice (POS)',
          icon: <Receipt className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
        {
          id: 'invoices_history',
          label: 'Invoice History & Reprint',
          icon: <FileText className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
        {
          id: 'return_invoice',
          label: 'Return Invoice',
          icon: <RotateCcw className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
        {
          id: 'certificates',
          label: 'Jewelry & Gem Certificates',
          icon: <Award className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Jewelry & Gem Inventory',
      items: [
        {
          id: 'inventory',
          label: 'Stock Inventory',
          icon: <Gem className="w-4 h-4" />,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          roles: ['admin', 'owner'],
        },
        {
          id: 'barcode_generator',
          label: 'Barcode & Label Generator',
          icon: <Barcode className="w-4 h-4 text-emerald-400" />,
          roles: ['admin', 'owner', 'user'],
        },
      ],
    },
    {
      title: 'Workshop & Custom Orders',
      items: [
        {
          id: 'create_order',
          label: 'Create Custom Order',
          icon: <PlusCircle className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'pending_orders',
          label: 'Pending & Active Orders',
          icon: <Clock className="w-4 h-4" />,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
          roles: ['admin', 'owner'],
        },
        {
          id: 'completed_orders',
          label: 'Completed Orders',
          icon: <CheckCircle className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'cancelled_orders',
          label: 'Cancelled Orders',
          icon: <XCircle className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'workshops',
          label: 'Workshops Directory',
          icon: <Hammer className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'workshop_employees',
          label: 'Artisans & Wage Payments',
          icon: <Users2 className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'workshop_advances',
          label: 'Workshop Advances',
          icon: <Coins className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Purchasing & Stock In',
      items: [
        {
          id: 'purchases',
          label: 'Purchase Orders',
          icon: <ShoppingCart className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'purchase_returns',
          label: 'Purchase Returns',
          icon: <Undo2 className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Customers & Marketing',
      items: [
        {
          id: 'customers',
          label: 'Customer Directory',
          icon: <Contact className="w-4 h-4" />,
          roles: ['admin', 'owner', 'user'],
        },
        {
          id: 'promotions',
          label: 'WhatsApp & FB Promotions',
          icon: <Megaphone className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Financials & Reports',
      items: [
        {
          id: 'reports',
          label: 'A4 Business Reports',
          icon: <BarChart3 className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          id: 'users',
          label: 'User Management',
          icon: <UserCog className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'settings',
          label: 'Settings & JPG Templates',
          icon: <Settings className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'backup_restore',
          label: 'Backup & Restore',
          icon: <Database className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
        {
          id: 'mongodb_schema',
          label: 'MongoDB Atlas Architecture',
          icon: <Code2 className="w-4 h-4" />,
          roles: ['admin', 'owner'],
        },
      ],
    },
  ];

  const handleNavClick = (page: NavigationPage) => {
    setCurrentPage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#0F1115] text-[#E0E0E0] border-r border-[#2D3139] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-[#2D3139] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center font-bold text-[#0F1115] shadow-md shadow-[#D4AF3720]">
              W
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">
                WCS <span className="text-[#D4AF37]">Jewels</span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium -mt-0.5">Gem & Workshop POS</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="px-4 py-3 bg-[#14171C] border-b border-[#2D3139] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-[#D4AF37]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1A1D23] border border-[#2D3139] text-[#D4AF37] flex items-center justify-center font-bold text-xs">
                {currentUser?.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <Shield className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span className="capitalize text-[#D4AF37] font-semibold">{userRole}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
          {sections.map((section, sIdx) => {
            // Filter items by role
            const visibleItems = section.items.filter((item) => item.roles.includes(userRole));
            if (visibleItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-1">
                <p className="px-3 text-[10px] font-bold tracking-wider text-gray-500 uppercase">
                  {section.title}
                </p>
                <div className="space-y-0.5 pt-0.5">
                  {visibleItems.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-lg transition group ${
                          isActive
                            ? 'bg-[#1A1D23] text-white border border-[#2D3139] shadow-sm'
                            : 'text-gray-400 hover:text-white hover:bg-[#1A1D23]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`${
                              isActive ? 'text-[#D4AF37]' : 'text-gray-400 group-hover:text-[#D4AF37]'
                            }`}
                          >
                            {item.icon}
                          </span>
                          <span className="truncate">{item.label}</span>
                        </div>

                        {item.badge !== undefined && (
                          <span
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                              isActive
                                ? 'bg-[#D4AF37] text-[#0F1115]'
                                : 'bg-[#D4AF37]/20 text-[#D4AF37]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#2D3139] text-[10px] text-gray-500 flex items-center justify-between bg-[#14171C]">
          <span>{settings.currencyCode} (Sri Lanka)</span>
          <span className="font-mono text-gray-400">v1.0.0</span>
        </div>
      </aside>
    </>
  );
};
