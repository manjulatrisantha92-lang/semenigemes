import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  RotateCcw,
  Printer,
  Download,
  Search,
  AlertTriangle,
  Receipt,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';

interface SalesReturnsReportProps {
  dateFrom: string;
  dateTo: string;
}

export const SalesReturnsReport: React.FC<SalesReturnsReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { invoices, formatCurrency, setActivePrintReport } = useApp();

  const [searchTerm, setSearchTerm] = useState('');

  // Extract all returned items across invoices
  const salesReturnsList = useMemo(() => {
    const list: {
      id: string;
      invoiceId: string;
      invoiceNumber: string;
      customerName: string;
      customerPhone: string;
      date: string;
      productId: string;
      productName: string;
      quantity: number;
      refundAmount: number;
      returnDate: string;
      reason: string;
      paymentMethod: string;
    }[] = [];

    invoices.forEach((inv) => {
      if (inv.returnedItems && inv.returnedItems.length > 0) {
        inv.returnedItems.forEach((ret, idx) => {
          if (!isWithinDateRange(ret.returnDate || inv.date, dateFrom, dateTo)) return;

          const prod = inv.items.find((i) => i.productId === ret.productId);
          list.push({
            id: `${inv.id}-ret-${idx}`,
            invoiceId: inv.id,
            invoiceNumber: inv.invoiceNumber,
            customerName: inv.customerName,
            customerPhone: inv.customerPhone,
            date: inv.date,
            productId: ret.productId,
            productName: prod ? prod.name : 'Jewelry Item',
            quantity: ret.quantity,
            refundAmount: ret.refundAmount,
            returnDate: ret.returnDate || inv.date,
            reason: ret.reason || 'Customer exchange/return',
            paymentMethod: inv.paymentMethod,
          });
        });
      }
    });

    return list.sort((a, b) => (b.returnDate > a.returnDate ? 1 : -1));
  }, [invoices, dateFrom, dateTo]);

  const filteredReturns = useMemo(() => {
    if (!searchTerm.trim()) return salesReturnsList;
    const term = searchTerm.toLowerCase();
    return salesReturnsList.filter(
      (r) =>
        r.invoiceNumber.toLowerCase().includes(term) ||
        r.customerName.toLowerCase().includes(term) ||
        r.productName.toLowerCase().includes(term) ||
        r.reason.toLowerCase().includes(term)
    );
  }, [salesReturnsList, searchTerm]);

  // Aggregate Metrics
  const totalRefundAmount = filteredReturns.reduce((sum, r) => sum + r.refundAmount, 0);
  const totalItemsReturned = filteredReturns.reduce((sum, r) => sum + r.quantity, 0);
  const totalInvoicesWithReturns = new Set(filteredReturns.map((r) => r.invoiceNumber)).size;

  // Total sales for comparison
  const totalSalesRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const returnRate = totalSalesRevenue > 0 ? (totalRefundAmount / totalSalesRevenue) * 100 : 0;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Return Date',
      'Original Invoice #',
      'Invoice Date',
      'Customer Name',
      'Contact',
      'Returned Item',
      'Quantity Returned',
      'Refund / Credit (LKR)',
      'Return Reason',
      'Payment Method',
    ];
    const rows = filteredReturns.map((r) => [
      r.returnDate,
      r.invoiceNumber,
      r.date,
      r.customerName,
      r.customerPhone,
      r.productName,
      r.quantity,
      r.refundAmount,
      r.reason,
      r.paymentMethod,
    ]);
    exportToCsv('Sales_Returns_and_Exchanges_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = [
      'Return Date',
      'Invoice #',
      'Customer',
      'Returned Item',
      'Qty',
      'Refund Amount',
      'Reason',
    ];
    const rows = filteredReturns.map((r) => [
      r.returnDate,
      r.invoiceNumber,
      r.customerName,
      r.productName,
      r.quantity,
      formatCurrency(r.refundAmount),
      r.reason,
    ]);
    const totalsRow = [
      'TOTAL RETURNS',
      `${totalInvoicesWithReturns} Invoices`,
      '-',
      '-',
      `${totalItemsReturned} Pcs`,
      formatCurrency(totalRefundAmount),
      '-',
    ];
    setActivePrintReport({
      type: 'sales_returns',
      title: 'Sales Returns, Product Exchanges & Refund Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Returns Count', value: `${filteredReturns.length}` },
        { label: 'Total Refund Value', value: formatCurrency(totalRefundAmount) },
        { label: 'Items Restocked', value: `${totalItemsReturned} Pcs` },
        { label: 'Return Rate', value: `${returnRate.toFixed(2)}% of Sales` },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'All returned items verified and restored back into the live inventory catalog.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Sales Refunds
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalRefundAmount)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Issued to customers
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Items Restocked
          </span>
          <p className="text-xl font-black text-white mt-1">
            {totalItemsReturned} Units
          </p>
          <p className="text-[11px] text-emerald-400 mt-0.5">
            Added back to showroom inventory
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Affected Invoices
          </span>
          <p className="text-xl font-black text-white mt-1">
            {totalInvoicesWithReturns} Invoices
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Customer returns & exchanges
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Sales Return Rate
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {returnRate.toFixed(2)}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Refunds relative to total sales
          </p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, item or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1E2430] hover:bg-[#283040] text-gray-200 hover:text-white rounded-xl text-xs font-semibold border border-[#2D3545] transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Returns Statement
          </button>
        </div>
      </div>

      {/* Sales Returns Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Return Date</th>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Returned Item</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Refund Amount</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-500">
                    No sales return records found for the selected date period.
                  </td>
                </tr>
              ) : (
                filteredReturns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 text-gray-300 font-mono">
                      {ret.returnDate}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {ret.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{ret.customerName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{ret.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-100">
                      {ret.productName}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">
                      {ret.quantity}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(ret.refundAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 italic">
                      "{ret.reason}"
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Restocked
                      </span>
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
