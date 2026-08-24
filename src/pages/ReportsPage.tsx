import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  Building2,
  ShoppingCart,
  Receipt,
  RotateCcw,
  Layers,
  UserCheck,
  Wallet,
  TrendingDown,
  AlertTriangle,
  Calendar,
  Hammer,
  Users2,
  Coins,
  Award,
  Sparkles,
} from 'lucide-react';

import { SupplierAccountReport } from '../components/reports/SupplierAccountReport';
import { PurchasesReturnsReport } from '../components/reports/PurchasesReturnsReport';
import { SalesReport } from '../components/reports/SalesReport';
import { SalesReturnsReport } from '../components/reports/SalesReturnsReport';
import { InventoryValuationReport } from '../components/reports/InventoryValuationReport';
import { UserSalesReport } from '../components/reports/UserSalesReport';
import { CashBalanceReport } from '../components/reports/CashBalanceReport';
import { ExpensesReport } from '../components/reports/ExpensesReport';
import { LowStockReport } from '../components/reports/LowStockReport';

// New Workshop Reports
import { WorkshopOrdersReport } from '../components/reports/WorkshopOrdersReport';
import { WorkshopSalaryReport } from '../components/reports/WorkshopSalaryReport';
import { WorkshopSalaryAdvanceReport } from '../components/reports/WorkshopSalaryAdvanceReport';
import { EmployeeCompletedOrdersReport } from '../components/reports/EmployeeCompletedOrdersReport';

export type ReportCategory =
  | 'workshop_orders'
  | 'workshop_salary'
  | 'workshop_advances'
  | 'workshop_completed_by_employee'
  | 'supplier_account'
  | 'purchases_returns'
  | 'sales'
  | 'sales_returns'
  | 'inventory_valuation'
  | 'user_sales'
  | 'cash_balance'
  | 'expenses'
  | 'low_stock';

export type ReportGroup = 'ALL' | 'WORKSHOP' | 'SALES_FINANCIAL' | 'INVENTORY_PURCHASE';

export const ReportsPage: React.FC = () => {
  const { invoices, products, purchases, expenses, orders } = useApp();

  const [activeReport, setActiveReport] = useState<ReportCategory>('workshop_orders');
  const [activeGroup, setActiveGroup] = useState<ReportGroup>('WORKSHOP');

  // Default to the current month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const todayStr = now.toISOString().split('T')[0];

  const [dateFrom, setDateFrom] = useState<string>(firstDayOfMonth);
  const [dateTo, setDateTo] = useState<string>(todayStr);

  const setPresetRange = (preset: 'today' | '7days' | '30days' | 'this_month' | 'all') => {
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setDateFrom(todayFormatted);
      setDateTo(todayFormatted);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      setDateFrom(d.toISOString().split('T')[0]);
      setDateTo(todayFormatted);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      setDateFrom(d.toISOString().split('T')[0]);
      setDateTo(todayFormatted);
    } else if (preset === 'this_month') {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateFrom(startOfMonth.toISOString().split('T')[0]);
      setDateTo(todayFormatted);
    } else if (preset === 'all') {
      setDateFrom('2020-01-01');
      setDateTo(todayFormatted);
    }
  };

  const allReportTabs: {
    id: ReportCategory;
    group: 'WORKSHOP' | 'SALES_FINANCIAL' | 'INVENTORY_PURCHASE';
    label: string;
    badge?: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    // Workshop Reports Suite
    {
      id: 'workshop_orders',
      group: 'WORKSHOP',
      label: 'Workshop Orders (All/Done/Pending/Cancel)',
      badge: 'Workshop Suite',
      icon: Hammer,
      description: 'Complete orders, in-progress, pending queue & cancelled jobs with gold & labor audit',
    },
    {
      id: 'workshop_salary',
      group: 'WORKSHOP',
      label: 'Workshop Employees Salary',
      badge: 'Artisan Payroll',
      icon: Users2,
      description: 'Craftsmen salary ledger, daily rates, piece work, wages earned vs paid & disbursements',
    },
    {
      id: 'workshop_advances',
      group: 'WORKSHOP',
      label: 'Salary & Job Advances',
      badge: 'Advances',
      icon: Coins,
      description: 'Worker salary advances, custom order casting advances, gold bullion deposits & settlements',
    },
    {
      id: 'workshop_completed_by_employee',
      group: 'WORKSHOP',
      label: 'Employees by Completed Work Orders',
      badge: 'Performance',
      icon: Award,
      description: 'Craftsmen leaderboard, gold weight handled, finished jewelry items & making charges earned',
    },

    // Commercial & Financial Suite
    {
      id: 'supplier_account',
      group: 'INVENTORY_PURCHASE',
      label: 'Supplier Account',
      icon: Building2,
      description: 'Supplier ledgers, purchases, settled disbursements & balances due',
    },
    {
      id: 'purchases_returns',
      group: 'INVENTORY_PURCHASE',
      label: 'Purchase / Return Purchase',
      icon: ShoppingCart,
      description: 'Stock acquisitions, supplier purchase orders & returned lots',
    },
    {
      id: 'sales',
      group: 'SALES_FINANCIAL',
      label: 'Sales Invoices',
      icon: Receipt,
      description: 'Counter invoices, revenue, tax VAT, payment methods & discounts',
    },
    {
      id: 'sales_returns',
      group: 'SALES_FINANCIAL',
      label: 'Return / Change Sales',
      icon: RotateCcw,
      description: 'Customer returns, exchanges, refunds & restocked jewelry audit',
    },
    {
      id: 'inventory_valuation',
      group: 'INVENTORY_PURCHASE',
      label: 'Inventory Value List By',
      icon: Layers,
      description: 'Stock valuation categorized by Category, Metal Purity & Gemstone',
    },
    {
      id: 'user_sales',
      group: 'SALES_FINANCIAL',
      label: 'User Sales Performance',
      icon: UserCheck,
      description: 'Staff member performance, transaction volumes & commissions',
    },
    {
      id: 'cash_balance',
      group: 'SALES_FINANCIAL',
      label: 'Cash Balance & Flow',
      icon: Wallet,
      description: 'Inflows vs Outflows cash flow, daily receipts & vault liquidity',
    },
    {
      id: 'expenses',
      group: 'SALES_FINANCIAL',
      label: 'Expenses List by Total',
      icon: TrendingDown,
      description: 'Operating expenses categorized with subtotal allocations',
    },
    {
      id: 'low_stock',
      group: 'INVENTORY_PURCHASE',
      label: 'Low Stock Alerts',
      icon: AlertTriangle,
      description: 'Stock alerts, critical shortages & replenishment cost estimates',
    },
  ];

  const visibleReportTabs = allReportTabs.filter((tab) => {
    if (activeGroup === 'ALL') return true;
    return tab.group === activeGroup;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232936] pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-amber-400" />
            Financial & Workshop Reports Center
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Complete executive reporting suite with A4 printable audit statements and Excel CSV exports.
          </p>
        </div>

        {/* Global Date Range Selector Toolbar */}
        <div className="flex items-center gap-2 flex-wrap bg-[#151921] border border-[#232936] p-2 rounded-2xl">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPresetRange('today')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0F1115] hover:bg-[#232936] text-gray-300 hover:text-white border border-[#232936] transition"
            >
              Today
            </button>
            <button
              onClick={() => setPresetRange('7days')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0F1115] hover:bg-[#232936] text-gray-300 hover:text-white border border-[#232936] transition"
            >
              7 Days
            </button>
            <button
              onClick={() => setPresetRange('this_month')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0F1115] hover:bg-[#232936] text-gray-300 hover:text-white border border-[#232936] transition"
            >
              This Month
            </button>
            <button
              onClick={() => setPresetRange('all')}
              className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#0F1115] hover:bg-[#232936] text-gray-300 hover:text-white border border-[#232936] transition"
            >
              All Time
            </button>
          </div>

          <div className="h-4 w-px bg-[#232936] hidden sm:block" />

          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-2 py-1 bg-[#0F1115] border border-[#232936] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
            <span className="text-gray-500 font-bold">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-2 py-1 bg-[#0F1115] border border-[#232936] rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Category Suite Switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { id: 'WORKSHOP', label: 'Workshop & Artisans (4 Reports)', icon: Hammer, color: 'text-amber-400' },
          { id: 'SALES_FINANCIAL', label: 'Sales & Financials (5 Reports)', icon: Receipt, color: 'text-emerald-400' },
          { id: 'INVENTORY_PURCHASE', label: 'Inventory & Purchases (4 Reports)', icon: Layers, color: 'text-blue-400' },
          { id: 'ALL', label: 'All 13 Reports', icon: FileSpreadsheet, color: 'text-white' },
        ].map((grp) => {
          const Icon = grp.icon;
          const isActive = activeGroup === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-[#151921] text-gray-400 hover:text-white border border-[#232936]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : grp.color}`} />
              <span>{grp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reports Navigation Grid / Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {visibleReportTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`p-3.5 rounded-2xl text-left transition flex flex-col justify-between border ${
                isActive
                  ? 'bg-gradient-to-b from-amber-500 to-amber-600 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/20'
                  : 'bg-[#151921] text-gray-400 hover:text-white border-[#232936] hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'text-slate-950' : 'text-amber-400'
                  }`}
                />
                {tab.badge && (
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <div>
                <div
                  className={`text-xs font-bold leading-snug ${
                    isActive ? 'text-slate-950 font-black' : 'text-gray-200'
                  }`}
                >
                  {tab.label}
                </div>
                <div
                  className={`text-[10px] line-clamp-1 mt-1 ${
                    isActive ? 'text-slate-900/80 font-medium' : 'text-gray-500'
                  }`}
                >
                  {tab.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Report Content Container */}
      <div className="pt-2">
        {/* Workshop Suite Reports */}
        {activeReport === 'workshop_orders' && (
          <WorkshopOrdersReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'workshop_salary' && (
          <WorkshopSalaryReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'workshop_advances' && (
          <WorkshopSalaryAdvanceReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'workshop_completed_by_employee' && (
          <EmployeeCompletedOrdersReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {/* Commercial & Financial Suite Reports */}
        {activeReport === 'supplier_account' && (
          <SupplierAccountReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'purchases_returns' && (
          <PurchasesReturnsReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'sales' && (
          <SalesReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'sales_returns' && (
          <SalesReturnsReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'inventory_valuation' && <InventoryValuationReport />}

        {activeReport === 'user_sales' && (
          <UserSalesReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'cash_balance' && (
          <CashBalanceReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'expenses' && (
          <ExpensesReport dateFrom={dateFrom} dateTo={dateTo} />
        )}

        {activeReport === 'low_stock' && <LowStockReport />}
      </div>
    </div>
  );
};
