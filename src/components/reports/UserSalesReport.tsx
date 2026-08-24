import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  UserCheck,
  Printer,
  Download,
  Award,
  Receipt,
  Percent,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface UserSalesReportProps {
  dateFrom: string;
  dateTo: string;
}

export const UserSalesReport: React.FC<UserSalesReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { invoices, users, formatCurrency, setActivePrintReport } = useApp();

  const [commissionRate, setCommissionRate] = useState<number>(2.0); // 2.0% default commission

  // Group sales invoices by user
  const userSalesData = useMemo(() => {
    const map = new Map<
      string,
      {
        userName: string;
        userRole: string;
        invoicesCount: number;
        itemsSold: number;
        totalGrossSales: number;
        totalDiscountsGiven: number;
        averageTicket: number;
        commissionEarned: number;
        shareOfSales: number;
      }
    >();

    const totalShopSales = invoices.reduce((sum, inv) => {
      if (isWithinDateRange(inv.date, dateFrom, dateTo)) {
        return sum + inv.grandTotal;
      }
      return sum;
    }, 0);

    invoices.forEach((inv) => {
      if (!isWithinDateRange(inv.date, dateFrom, dateTo)) return;

      const userName = inv.issuedByUserName || 'Showroom Cashier';
      const user = users.find((u) => u.name === userName || u.id === inv.issuedByUserId);

      if (!map.has(userName)) {
        map.set(userName, {
          userName,
          userRole: user ? user.role : 'Sales Executive',
          invoicesCount: 0,
          itemsSold: 0,
          totalGrossSales: 0,
          totalDiscountsGiven: 0,
          averageTicket: 0,
          commissionEarned: 0,
          shareOfSales: 0,
        });
      }

      const entry = map.get(userName)!;
      entry.invoicesCount += 1;
      entry.itemsSold += inv.items.reduce((s, line) => s + line.quantity, 0);
      entry.totalGrossSales += inv.grandTotal;
      entry.totalDiscountsGiven += inv.totalDiscount;
    });

    map.forEach((entry) => {
      entry.averageTicket = entry.invoicesCount > 0 ? entry.totalGrossSales / entry.invoicesCount : 0;
      entry.commissionEarned = (entry.totalGrossSales * commissionRate) / 100;
      entry.shareOfSales = totalShopSales > 0 ? (entry.totalGrossSales / totalShopSales) * 100 : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.totalGrossSales - a.totalGrossSales);
  }, [invoices, users, dateFrom, dateTo, commissionRate]);

  // Overall totals
  const totalSalesAllUsers = userSalesData.reduce((sum, u) => sum + u.totalGrossSales, 0);
  const totalInvoicesAllUsers = userSalesData.reduce((sum, u) => sum + u.invoicesCount, 0);
  const totalCommissionAllUsers = userSalesData.reduce((sum, u) => sum + u.commissionEarned, 0);
  const topPerformer = userSalesData.length > 0 ? userSalesData[0] : null;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Sales Executive / User',
      'Role',
      'Invoices Processed',
      'Total Items Sold',
      'Total Sales Revenue (LKR)',
      'Total Discounts Given (LKR)',
      'Average Invoice Value (LKR)',
      `Commission (${commissionRate}%) (LKR)`,
      'Share of Sales (%)',
    ];
    const rows = userSalesData.map((u) => [
      u.userName,
      u.userRole,
      u.invoicesCount,
      u.itemsSold,
      u.totalGrossSales,
      u.totalDiscountsGiven,
      u.averageTicket,
      u.commissionEarned,
      `${u.shareOfSales.toFixed(1)}%`,
    ]);
    exportToCsv('Sales_By_User_Performance_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = [
      'Staff Member',
      'Role',
      'Invoices',
      'Units Sold',
      'Discounts',
      'Gross Sales',
      `Commission (${commissionRate}%)`,
      'Share %',
    ];
    const rows = userSalesData.map((u) => [
      u.userName,
      u.userRole,
      u.invoicesCount,
      u.itemsSold,
      formatCurrency(u.totalDiscountsGiven),
      formatCurrency(u.totalGrossSales),
      formatCurrency(u.commissionEarned),
      `${u.shareOfSales.toFixed(1)}%`,
    ]);
    const totalsRow = [
      'TOTAL SALES TEAM',
      `${userSalesData.length} Staff`,
      totalInvoicesAllUsers,
      userSalesData.reduce((sum, u) => sum + u.itemsSold, 0),
      formatCurrency(userSalesData.reduce((sum, u) => sum + u.totalDiscountsGiven, 0)),
      formatCurrency(totalSalesAllUsers),
      formatCurrency(totalCommissionAllUsers),
      '100%',
    ];
    setActivePrintReport({
      type: 'user_sales',
      title: 'Salesperson & Counter Staff Performance Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Team Sales', value: formatCurrency(totalSalesAllUsers) },
        { label: 'Invoices Cleared', value: `${totalInvoicesAllUsers}` },
        { label: 'Top Performer', value: topPerformer ? topPerformer.userName : 'N/A' },
        { label: `Total Commission (${commissionRate}%)`, value: formatCurrency(totalCommissionAllUsers) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Commission calculated based on net billed revenue per counter sales staff.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Sales Team Revenue
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(totalSalesAllUsers)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {totalInvoicesAllUsers} total invoices processed
          </p>
        </div>

        <div className="bg-[#151921] border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> Top Sales Executive
          </span>
          <p className="text-xl font-black text-white mt-1">
            {topPerformer ? topPerformer.userName : 'N/A'}
          </p>
          <p className="text-[11px] text-amber-300 mt-0.5">
            {topPerformer ? formatCurrency(topPerformer.totalGrossSales) : '0'} (
            {topPerformer ? topPerformer.shareOfSales.toFixed(1) : 0}% of shop sales)
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Active Staff Members
          </span>
          <p className="text-xl font-black text-white mt-1">
            {userSalesData.length} Staff
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Generating revenue this period
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Projected Commission
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalCommissionAllUsers)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            At {commissionRate}% commission rate
          </p>
        </div>
      </div>

      {/* Commission Rate Configurator & Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-gray-300">
              Commission Incentive Rate:
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[1.0, 1.5, 2.0, 2.5, 3.0, 5.0].map((rate) => (
              <button
                key={rate}
                onClick={() => setCommissionRate(rate)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  commissionRate === rate
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
                }`}
              >
                {rate}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1E2430] hover:bg-[#283040] text-gray-200 hover:text-white rounded-xl text-xs font-semibold border border-[#2D3545] transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print A4 Staff Statement
          </button>
        </div>
      </div>

      {/* User Sales Performance Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Salesperson</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">Invoices</th>
                <th className="py-3 px-4 text-center">Items Sold</th>
                <th className="py-3 px-4 text-right">Avg Ticket</th>
                <th className="py-3 px-4 text-right">Discounts Given</th>
                <th className="py-3 px-4 text-right">Gross Sales</th>
                <th className="py-3 px-4 text-right">Commission ({commissionRate}%)</th>
                <th className="py-3 px-4 text-center">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {userSalesData.map((u, idx) => (
                <tr key={u.userName} className="hover:bg-[#1A202C] transition">
                  <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                    {idx === 0 && <Award className="w-4 h-4 text-amber-400 shrink-0" />}
                    <span>{u.userName}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">{u.userRole}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">{u.invoicesCount}</td>
                  <td className="py-3.5 px-4 text-center text-gray-300">{u.itemsSold}</td>
                  <td className="py-3.5 px-4 text-right text-gray-300">{formatCurrency(u.averageTicket)}</td>
                  <td className="py-3.5 px-4 text-right text-rose-400">
                    {u.totalDiscountsGiven > 0 ? formatCurrency(u.totalDiscountsGiven) : '-'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                    {formatCurrency(u.totalGrossSales)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                    {formatCurrency(u.commissionEarned)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {u.shareOfSales.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
