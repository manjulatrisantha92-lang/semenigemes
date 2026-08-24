import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  Receipt,
  Printer,
  Download,
  Search,
  Filter,
  CreditCard,
  Banknote,
  QrCode,
  Tag,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface SalesReportProps {
  dateFrom: string;
  dateTo: string;
}

const PAYMENT_COLORS: Record<string, string> = {
  Cash: '#10B981',
  Card: '#3B82F6',
  'Visa / Master Card': '#6366F1',
  'LankaQR / Online': '#F59E0B',
  'Bank Transfer / Cheque': '#8B5CF6',
  'Customer Credit': '#EC4899',
  'Koko / Mintpay': '#14B8A6',
};

export const SalesReport: React.FC<SalesReportProps> = ({ dateFrom, dateTo }) => {
  const { invoices, products, formatCurrency, setActivePrintReport } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState('ALL');

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (!isWithinDateRange(inv.date, dateFrom, dateTo)) return false;
      if (selectedPaymentMethod !== 'ALL' && inv.paymentMethod !== selectedPaymentMethod) {
        return false;
      }
      if (selectedStaff !== 'ALL' && inv.issuedByUserName !== selectedStaff) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesInvoice = inv.invoiceNumber.toLowerCase().includes(term);
        const matchesCustomer = inv.customerName.toLowerCase().includes(term);
        const matchesPhone = (inv.customerPhone || '').toLowerCase().includes(term);
        const matchesItems = inv.items.some((i) => i.name.toLowerCase().includes(term) || i.itemCode.toLowerCase().includes(term));
        if (!matchesInvoice && !matchesCustomer && !matchesPhone && !matchesItems) return false;
      }
      return true;
    });
  }, [invoices, dateFrom, dateTo, selectedPaymentMethod, selectedStaff, searchTerm]);

  // Aggregate Metrics
  const totalGrossSales = filteredInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalSubtotal = filteredInvoices.reduce((sum, i) => sum + i.subtotal, 0);
  const totalDiscount = filteredInvoices.reduce((sum, i) => sum + i.totalDiscount, 0);
  const totalTax = filteredInvoices.reduce((sum, i) => sum + i.taxAmount, 0);
  const totalItemsCount = filteredInvoices.reduce(
    (sum, i) => sum + i.items.reduce((s, line) => s + line.quantity, 0),
    0
  );
  const averageTicketSize = filteredInvoices.length > 0 ? totalGrossSales / filteredInvoices.length : 0;

  // Estimated COGS & Profit
  const totalCogs = filteredInvoices.reduce((sum, inv) => {
    return (
      sum +
      inv.items.reduce((costSum, line) => {
        const prod = products.find((p) => p.id === line.productId);
        return costSum + (prod ? prod.costPrice * line.quantity : line.unitPrice * 0.7 * line.quantity);
      }, 0)
    );
  }, 0);
  const totalGrossProfit = totalGrossSales - totalCogs;
  const grossProfitMargin = totalGrossSales > 0 ? (totalGrossProfit / totalGrossSales) * 100 : 0;

  // Payment Method Breakdown Data for Chart
  const paymentBreakdownData = useMemo(() => {
    const map = new Map<string, number>();
    filteredInvoices.forEach((i) => {
      const pm = i.paymentMethod || 'Cash';
      map.set(pm, (map.get(pm) || 0) + i.grandTotal);
    });
    return Array.from(map.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filteredInvoices]);

  // Distinct Staff List
  const staffList = useMemo(() => {
    const set = new Set<string>();
    invoices.forEach((i) => {
      if (i.issuedByUserName) set.add(i.issuedByUserName);
    });
    return Array.from(set);
  }, [invoices]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Invoice #',
      'Date',
      'Customer Name',
      'Phone',
      'Items Count',
      'Subtotal (LKR)',
      'Discount (LKR)',
      'Tax / VAT (LKR)',
      'Grand Total (LKR)',
      'Payment Method',
      'Salesperson / Cashier',
      'Status',
    ];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.date,
      i.customerName,
      i.customerPhone || 'N/A',
      i.items.reduce((s, line) => s + line.quantity, 0),
      i.subtotal,
      i.totalDiscount,
      i.taxAmount,
      i.grandTotal,
      i.paymentMethod,
      i.issuedByUserName || 'N/A',
      i.status,
    ]);
    exportToCsv('Sales_Invoices_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = ['Invoice #', 'Date', 'Customer', 'Items', 'Payment', 'Discount', 'Tax', 'Grand Total'];
    const rows = filteredInvoices.map((i) => [
      i.invoiceNumber,
      i.date,
      i.customerName,
      i.items.map((line) => `${line.name} (x${line.quantity})`).join(', '),
      i.paymentMethod,
      formatCurrency(i.totalDiscount),
      formatCurrency(i.taxAmount),
      formatCurrency(i.grandTotal),
    ]);
    const totalsRow = [
      'TOTAL SALES',
      `${filteredInvoices.length} Invoices`,
      '-',
      `${totalItemsCount} Pcs`,
      '-',
      formatCurrency(totalDiscount),
      formatCurrency(totalTax),
      formatCurrency(totalGrossSales),
    ];
    setActivePrintReport({
      type: 'sales_report',
      title: 'Detailed Sales & Revenue Audit Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Invoices', value: `${filteredInvoices.length}` },
        { label: 'Gross Revenue', value: formatCurrency(totalGrossSales) },
        { label: 'Total Discounts', value: formatCurrency(totalDiscount) },
        { label: 'Gross Profit Est.', value: formatCurrency(totalGrossProfit) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Audited sales invoices and payment reconciliations. Includes all counter POS transactions.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Sales Revenue
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(totalGrossSales)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Across {filteredInvoices.length} transactions
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Gross Margin & Profit
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalGrossProfit)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            {grossProfitMargin.toFixed(1)}% Gross Margin
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Discounts & Tax
          </span>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm font-bold text-rose-400">
              Disc: {formatCurrency(totalDiscount)}
            </p>
            <p className="text-sm font-bold text-sky-400">
              VAT: {formatCurrency(totalTax)}
            </p>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Subtotal: {formatCurrency(totalSubtotal)}
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Average Ticket Size
          </span>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(averageTicketSize)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {totalItemsCount} total items sold
          </p>
        </div>
      </div>

      {/* Payment Methods Chart & Toolbar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Methods Distribution */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Payment Breakdown
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentBreakdownData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {paymentBreakdownData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={PAYMENT_COLORS[entry.name] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#0F1115',
                    borderColor: '#232936',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] justify-center mt-1">
            {paymentBreakdownData.map((p) => (
              <span key={p.name} className="flex items-center gap-1 text-gray-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PAYMENT_COLORS[p.name] || '#94A3B8' }}
                />
                {p.name}: {formatCurrency(p.value)}
              </span>
            ))}
          </div>
        </div>

        {/* Filters & Actions Panel */}
        <div className="lg:col-span-2 bg-[#151921] border border-[#232936] rounded-2xl p-4 flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Sales Query & Filter Console
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase">
                  Payment Method
                </label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Payment Methods</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="LankaQR / Online">LankaQR / Online</option>
                  <option value="Bank Transfer / Cheque">Bank Transfer / Cheque</option>
                  <option value="Customer Credit">Customer Credit</option>
                  <option value="Koko / Mintpay">Koko / Mintpay (BNPL)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase">
                  Salesperson / Staff
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Staff Members</option>
                  {staffList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-gray-400 font-semibold uppercase">
                  Search Keyword
                </label>
                <div className="relative mt-1">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Invoice #, Customer, Gem..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#232936]">
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
              Print A4 Sales Statement
            </button>
          </div>
        </div>
      </div>

      {/* Sales Invoices Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items / Gemstones</th>
                <th className="py-3 px-4">Salesperson</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Discount</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No sales invoices match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{inv.date}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{inv.customerName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{inv.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      <div className="max-w-xs truncate" title={inv.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}>
                        {inv.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">
                      {inv.issuedByUserName || 'Staff'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-400">
                      {inv.totalDiscount > 0 ? formatCurrency(inv.totalDiscount) : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
