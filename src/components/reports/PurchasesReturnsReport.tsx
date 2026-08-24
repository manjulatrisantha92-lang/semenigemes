import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  ShoppingCart,
  Undo2,
  Printer,
  Download,
  Search,
  Filter,
  PackageCheck,
  RotateCcw,
} from 'lucide-react';

interface PurchasesReturnsReportProps {
  dateFrom: string;
  dateTo: string;
}

export const PurchasesReturnsReport: React.FC<PurchasesReturnsReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { purchases, purchaseReturns, formatCurrency, setActivePrintReport } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'purchases' | 'returns' | 'net_summary'>(
    'purchases'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filtered Purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      if (!isWithinDateRange(p.date, dateFrom, dateTo)) return false;
      if (statusFilter !== 'ALL' && p.paymentStatus !== statusFilter && p.status !== statusFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSupplier = p.supplierName.toLowerCase().includes(term);
        const matchesPo = p.purchaseNumber.toLowerCase().includes(term);
        const matchesItems = p.items.some((i) => i.itemName.toLowerCase().includes(term));
        if (!matchesSupplier && !matchesPo && !matchesItems) return false;
      }
      return true;
    });
  }, [purchases, dateFrom, dateTo, statusFilter, searchTerm]);

  // Filtered Returns
  const filteredReturns = useMemo(() => {
    return purchaseReturns.filter((r) => {
      if (!isWithinDateRange(r.returnDate, dateFrom, dateTo)) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesSupplier = r.supplierName.toLowerCase().includes(term);
        const matchesPo = r.purchaseNumber.toLowerCase().includes(term);
        const matchesReturnNo = r.returnNumber.toLowerCase().includes(term);
        if (!matchesSupplier && !matchesPo && !matchesReturnNo) return false;
      }
      return true;
    });
  }, [purchaseReturns, dateFrom, dateTo, searchTerm]);

  // Aggregate Totals
  const totalPurchasesAmount = filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPurchasesPaid = filteredPurchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalPurchasesDue = totalPurchasesAmount - totalPurchasesPaid;
  const totalReturnsAmount = filteredReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);
  const netPurchasesTotal = totalPurchasesAmount - totalReturnsAmount;

  // Export CSV
  const handleExportCsv = () => {
    if (activeSubTab === 'returns') {
      const headers = [
        'Return #',
        'Date',
        'Purchase #',
        'Supplier',
        'Items Summary',
        'Refund Amount (LKR)',
        'Status',
        'Reason',
      ];
      const rows = filteredReturns.map((r) => [
        r.returnNumber,
        r.returnDate,
        r.purchaseNumber,
        r.supplierName,
        r.returnedItems.map((i) => `${i.itemName} (x${i.quantity})`).join('; '),
        r.totalRefundAmount,
        r.refundStatus,
        r.returnedItems.map((i) => i.reason).join('; '),
      ]);
      exportToCsv('Purchase_Returns_Report', headers, rows);
    } else {
      const headers = [
        'PO #',
        'Date',
        'Supplier Name',
        'Contact',
        'Items Summary',
        'Total Cost (LKR)',
        'Paid (LKR)',
        'Balance Due (LKR)',
        'Payment Status',
        'Stock Status',
      ];
      const rows = filteredPurchases.map((p) => [
        p.purchaseNumber,
        p.date,
        p.supplierName,
        p.supplierPhone,
        p.items.map((i) => `${i.itemName} (x${i.quantity})`).join('; '),
        p.totalAmount,
        p.paidAmount,
        p.totalAmount - p.paidAmount,
        p.paymentStatus,
        p.status,
      ]);
      exportToCsv('Purchases_Orders_Report', headers, rows);
    }
  };

  // Print A4 Report
  const handlePrintReport = () => {
    if (activeSubTab === 'returns') {
      const headers = ['Return #', 'Date', 'Purchase #', 'Supplier', 'Items', 'Refund Amount', 'Status'];
      const rows = filteredReturns.map((r) => [
        r.returnNumber,
        r.returnDate,
        r.purchaseNumber,
        r.supplierName,
        r.returnedItems.map((i) => `${i.itemName} (x${i.quantity})`).join(', '),
        formatCurrency(r.totalRefundAmount),
        r.refundStatus,
      ]);
      const totalsRow = [
        'TOTAL RETURNS',
        '-',
        '-',
        `${filteredReturns.length} Records`,
        '-',
        formatCurrency(totalReturnsAmount),
        '-',
      ];
      setActivePrintReport({
        type: 'purchase_returns',
        title: 'Purchase Returns & Supplier Refunds Audit',
        dateRange: `${dateFrom} to ${dateTo}`,
        summaryCards: [
          { label: 'Total Returns Count', value: `${filteredReturns.length}` },
          { label: 'Total Refund Value', value: formatCurrency(totalReturnsAmount) },
        ],
        headers,
        rows,
        totalsRow,
      });
    } else {
      const headers = ['PO #', 'Date', 'Supplier', 'Items Summary', 'Total Cost', 'Paid', 'Due', 'Status'];
      const rows = filteredPurchases.map((p) => [
        p.purchaseNumber,
        p.date,
        p.supplierName,
        p.items.map((i) => `${i.itemName} (${i.quantity})`).join(', '),
        formatCurrency(p.totalAmount),
        formatCurrency(p.paidAmount),
        formatCurrency(p.totalAmount - p.paidAmount),
        p.paymentStatus,
      ]);
      const totalsRow = [
        'TOTAL PURCHASES',
        '-',
        `${filteredPurchases.length} Orders`,
        '-',
        formatCurrency(totalPurchasesAmount),
        formatCurrency(totalPurchasesPaid),
        formatCurrency(totalPurchasesDue),
        '-',
      ];
      setActivePrintReport({
        type: 'purchases_report',
        title: 'Purchase Orders & Stock Acquisitions Statement',
        dateRange: `${dateFrom} to ${dateTo}`,
        summaryCards: [
          { label: 'Total Purchases', value: formatCurrency(totalPurchasesAmount) },
          { label: 'Total Settled', value: formatCurrency(totalPurchasesPaid) },
          { label: 'Total Due', value: formatCurrency(totalPurchasesDue) },
          { label: 'Net Purchases', value: formatCurrency(netPurchasesTotal) },
        ],
        headers,
        rows,
        totalsRow,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Gross Purchases
          </span>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalPurchasesAmount)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {filteredPurchases.length} Purchase Order(s)
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Settled / Paid
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalPurchasesPaid)}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">
            Cash & Cheques cleared
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Purchase Returns
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalReturnsAmount)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {filteredReturns.length} Returned lot(s)
          </p>
        </div>

        <div className="bg-[#151921] border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Net Stock Acquisition Cost
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(netPurchasesTotal)}
          </p>
          <p className="text-[11px] text-amber-300/80 mt-0.5">
            Gross minus Returns
          </p>
        </div>
      </div>

      {/* Sub Tabs & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('purchases')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'purchases'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Purchase Orders ({filteredPurchases.length})
          </button>

          <button
            onClick={() => setActiveSubTab('returns')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeSubTab === 'returns'
                ? 'bg-amber-500 text-slate-950 font-black'
                : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
            }`}
          >
            <Undo2 className="w-3.5 h-3.5" />
            Purchase Returns ({filteredReturns.length})
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO # or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1E2430] hover:bg-[#283040] text-gray-200 hover:text-white rounded-xl text-xs font-semibold border border-[#2D3545] transition"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print A4
          </button>
        </div>
      </div>

      {/* Main Table */}
      {activeSubTab === 'purchases' ? (
        <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                  <th className="py-3 px-4">PO #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Items / Gem Lots</th>
                  <th className="py-3 px-4 text-right">Total Cost</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Stock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-500">
                      No purchase records found in this date range.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((po) => (
                    <tr key={po.id} className="hover:bg-[#1A202C] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {po.purchaseNumber}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{po.date}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{po.supplierName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{po.supplierPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">
                        <div className="max-w-xs truncate" title={po.items.map((i) => `${i.itemName} (x${i.quantity})`).join(', ')}>
                          {po.items.map((i) => `${i.itemName} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">
                        {formatCurrency(po.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                        {formatCurrency(po.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                        {formatCurrency(po.totalAmount - po.paidAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            po.paymentStatus === 'Paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : po.paymentStatus === 'Partial'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {po.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-medium">
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                  <th className="py-3 px-4">Return #</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Purchase Ref</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Returned Items</th>
                  <th className="py-3 px-4 text-right">Refund Amount</th>
                  <th className="py-3 px-4 text-center">Refund Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {filteredReturns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">
                      No purchase return records found.
                    </td>
                  </tr>
                ) : (
                  filteredReturns.map((ret) => (
                    <tr key={ret.id} className="hover:bg-[#1A202C] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-400">
                        {ret.returnNumber}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{ret.returnDate}</td>
                      <td className="py-3.5 px-4 font-mono text-amber-400">{ret.purchaseNumber}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{ret.supplierName}</td>
                      <td className="py-3.5 px-4 text-gray-300">
                        {ret.returnedItems.map((i) => `${i.itemName} (x${i.quantity}) - ${i.reason}`).join('; ')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-400">
                        {formatCurrency(ret.totalRefundAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {ret.refundStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
