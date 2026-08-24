import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv } from '../../utils/reportUtils';
import {
  Building2,
  Printer,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Receipt,
  Coins,
  Undo2,
} from 'lucide-react';

interface SupplierAccountReportProps {
  dateFrom: string;
  dateTo: string;
}

export const SupplierAccountReport: React.FC<SupplierAccountReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const {
    purchases,
    supplierPayments,
    purchaseReturns,
    formatCurrency,
    setActivePrintReport,
    setCurrentPage,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplierName, setSelectedSupplierName] = useState<string | null>(null);

  // Group purchases, payments, and returns by supplier
  const supplierAccounts = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        phone: string;
        purchasesCount: number;
        totalPurchases: number;
        totalPayments: number;
        totalReturns: number;
        balanceDue: number;
        purchasesList: typeof purchases;
        paymentsList: typeof supplierPayments;
        returnsList: typeof purchaseReturns;
      }
    >();

    // Collect all supplier names from purchases, payments, and returns
    purchases.forEach((p) => {
      const name = p.supplierName.trim();
      if (!map.has(name)) {
        map.set(name, {
          name,
          phone: p.supplierPhone || 'N/A',
          purchasesCount: 0,
          totalPurchases: 0,
          totalPayments: 0,
          totalReturns: 0,
          balanceDue: 0,
          purchasesList: [],
          paymentsList: [],
          returnsList: [],
        });
      }
      const entry = map.get(name)!;
      entry.purchasesCount += 1;
      entry.totalPurchases += p.totalAmount;
      entry.purchasesList.push(p);
    });

    supplierPayments.forEach((pay) => {
      const name = pay.supplierName.trim();
      if (!map.has(name)) {
        map.set(name, {
          name,
          phone: pay.supplierPhone || 'N/A',
          purchasesCount: 0,
          totalPurchases: 0,
          totalPayments: 0,
          totalReturns: 0,
          balanceDue: 0,
          purchasesList: [],
          paymentsList: [],
          returnsList: [],
        });
      }
      const entry = map.get(name)!;
      entry.totalPayments += pay.amount;
      entry.paymentsList.push(pay);
    });

    purchaseReturns.forEach((ret) => {
      const name = ret.supplierName.trim();
      if (!map.has(name)) {
        map.set(name, {
          name,
          phone: 'N/A',
          purchasesCount: 0,
          totalPurchases: 0,
          totalPayments: 0,
          totalReturns: 0,
          balanceDue: 0,
          purchasesList: [],
          paymentsList: [],
          returnsList: [],
        });
      }
      const entry = map.get(name)!;
      entry.totalReturns += ret.totalRefundAmount;
      entry.returnsList.push(ret);
    });

    // Calculate net balance due: Total Purchases - Total Payments - Total Returns
    map.forEach((entry) => {
      entry.balanceDue = Math.max(
        0,
        entry.totalPurchases - entry.totalPayments - entry.totalReturns
      );
    });

    return Array.from(map.values()).sort((a, b) => b.balanceDue - a.balanceDue);
  }, [purchases, supplierPayments, purchaseReturns]);

  const filteredSuppliers = useMemo(() => {
    if (!searchTerm.trim()) return supplierAccounts;
    const term = searchTerm.toLowerCase();
    return supplierAccounts.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.phone.toLowerCase().includes(term)
    );
  }, [supplierAccounts, searchTerm]);

  // Overall totals
  const totalPurchasesSum = supplierAccounts.reduce((sum, s) => sum + s.totalPurchases, 0);
  const totalPaymentsSum = supplierAccounts.reduce((sum, s) => sum + s.totalPayments, 0);
  const totalReturnsSum = supplierAccounts.reduce((sum, s) => sum + s.totalReturns, 0);
  const totalBalanceDueSum = supplierAccounts.reduce((sum, s) => sum + s.balanceDue, 0);

  // Selected supplier details
  const activeSupplier = supplierAccounts.find((s) => s.name === selectedSupplierName);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Supplier Name',
      'Contact Phone',
      'Purchase Orders Count',
      'Total Purchases (LKR)',
      'Total Paid/Settled (LKR)',
      'Purchase Returns (LKR)',
      'Outstanding Balance Due (LKR)',
      'Account Status',
    ];
    const rows = filteredSuppliers.map((s) => [
      s.name,
      s.phone,
      s.purchasesCount,
      s.totalPurchases,
      s.totalPayments,
      s.totalReturns,
      s.balanceDue,
      s.balanceDue === 0 ? 'Fully Settled' : 'Balance Due',
    ]);
    exportToCsv('Supplier_Account_Balances_Report', headers, rows);
  };

  // Print A4 Report
  const handlePrintReport = () => {
    const headers = [
      'Supplier Name',
      'Contact',
      'Orders',
      'Total Purchases',
      'Paid / Settled',
      'Returns',
      'Balance Due',
    ];
    const rows = filteredSuppliers.map((s) => [
      s.name,
      s.phone,
      s.purchasesCount,
      formatCurrency(s.totalPurchases),
      formatCurrency(s.totalPayments),
      formatCurrency(s.totalReturns),
      formatCurrency(s.balanceDue),
    ]);
    const totalsRow = [
      'TOTAL ACCOUNTS',
      `${filteredSuppliers.length} Suppliers`,
      filteredSuppliers.reduce((sum, s) => sum + s.purchasesCount, 0),
      formatCurrency(totalPurchasesSum),
      formatCurrency(totalPaymentsSum),
      formatCurrency(totalReturnsSum),
      formatCurrency(totalBalanceDueSum),
    ];

    setActivePrintReport({
      type: 'supplier_account',
      title: 'Supplier Accounts & Outstanding Balances Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Active Suppliers', value: `${filteredSuppliers.length}` },
        { label: 'Total Purchases', value: formatCurrency(totalPurchasesSum) },
        { label: 'Total Payments Made', value: formatCurrency(totalPaymentsSum) },
        { label: 'Total Balance Due', value: formatCurrency(totalBalanceDueSum) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Supplier ledger verified against physical purchase receipts, cheques, and credit notes.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Purchases
          </span>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalPurchasesSum)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Gross stock intake
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Settled Payments
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalPaymentsSum)}
          </p>
          <p className="text-[11px] text-emerald-500/80 mt-0.5">
            Disbursed to suppliers
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Purchase Returns
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalReturnsSum)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Returned stock refunds
          </p>
        </div>

        <div className="bg-[#151921] border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Total Outstanding Due
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(totalBalanceDueSum)}
          </p>
          <p className="text-[11px] text-amber-300/80 mt-0.5">
            Payables to suppliers
          </p>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier by name or phone..."
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
            Print A4 Statement
          </button>
        </div>
      </div>

      {/* Supplier Accounts Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#232936] flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            Supplier Account Ledger & Balances
          </h3>
          <span className="text-xs text-gray-400">
            {filteredSuppliers.length} Suppliers Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Purchases</th>
                <th className="py-3 px-4 text-right">Total Purchases</th>
                <th className="py-3 px-4 text-right">Paid / Settled</th>
                <th className="py-3 px-4 text-right">Returns</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No supplier records found.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((sup) => (
                  <tr
                    key={sup.name}
                    className="hover:bg-[#1A202C] transition cursor-pointer"
                    onClick={() => setSelectedSupplierName(sup.name)}
                  >
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                          {sup.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{sup.name}</div>
                          <div className="text-[10px] text-gray-400">
                            {sup.purchasesCount} Purchase Order(s)
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-mono">
                      {sup.phone}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-300">
                      {sup.purchasesCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                      {formatCurrency(sup.totalPurchases)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400">
                      {formatCurrency(sup.totalPayments)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-400">
                      {formatCurrency(sup.totalReturns)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                      {formatCurrency(sup.balanceDue)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {sup.balanceDue === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3 h-3" />
                          Due
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSupplierName(sup.name)}
                          className="px-2.5 py-1 bg-[#232936] hover:bg-[#2D3545] text-gray-300 hover:text-white rounded-lg text-[11px] font-semibold transition"
                        >
                          Details
                        </button>
                        {sup.balanceDue > 0 && (
                          <button
                            onClick={() => setCurrentPage('supplier_payments')}
                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-semibold transition"
                          >
                            Pay
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Drilldown Modal */}
      {activeSupplier && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedSupplierName(null)}
        >
          <div
            className="bg-[#151921] border border-[#2D3545] rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 text-white shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#232936] pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-400" />
                  {activeSupplier.name} &bull; Account Statement
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Phone: {activeSupplier.phone} | Outstanding Balance:{' '}
                  <span className="text-amber-400 font-bold font-mono">
                    {formatCurrency(activeSupplier.balanceDue)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSupplierName(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                &times;
              </button>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#0F1115] border border-[#232936] rounded-xl p-3">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Purchases</span>
                <p className="text-base font-bold text-white mt-0.5">
                  {formatCurrency(activeSupplier.totalPurchases)}
                </p>
              </div>
              <div className="bg-[#0F1115] border border-[#232936] rounded-xl p-3">
                <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Settled</span>
                <p className="text-base font-bold text-emerald-400 mt-0.5">
                  {formatCurrency(activeSupplier.totalPayments)}
                </p>
              </div>
              <div className="bg-[#0F1115] border border-amber-500/20 rounded-xl p-3">
                <span className="text-[10px] text-amber-400 uppercase font-semibold">Net Due</span>
                <p className="text-base font-bold text-amber-400 mt-0.5">
                  {formatCurrency(activeSupplier.balanceDue)}
                </p>
              </div>
            </div>

            {/* Purchase Orders List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-emerald-400" />
                Purchase Orders ({activeSupplier.purchasesList.length})
              </h4>
              <div className="border border-[#232936] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                      <th className="py-2 px-3">PO #</th>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Items Summary</th>
                      <th className="py-2 px-3 text-right">Total</th>
                      <th className="py-2 px-3 text-right">Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#232936]">
                    {activeSupplier.purchasesList.map((po) => (
                      <tr key={po.id}>
                        <td className="py-2 px-3 font-mono font-bold text-amber-400">{po.purchaseNumber}</td>
                        <td className="py-2 px-3 text-gray-300">{po.date}</td>
                        <td className="py-2 px-3 text-gray-400">
                          {po.items.map((i) => `${i.itemName} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-white">{formatCurrency(po.totalAmount)}</td>
                        <td className="py-2 px-3 text-right text-emerald-400">{formatCurrency(po.paidAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments List */}
            {activeSupplier.paymentsList.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Payments Made ({activeSupplier.paymentsList.length})
                </h4>
                <div className="border border-[#232936] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                        <th className="py-2 px-3">Payment #</th>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Method</th>
                        <th className="py-2 px-3">Ref</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#232936]">
                      {activeSupplier.paymentsList.map((pay) => (
                        <tr key={pay.id}>
                          <td className="py-2 px-3 font-mono font-bold text-amber-400">{pay.paymentNumber}</td>
                          <td className="py-2 px-3 text-gray-300">{pay.paymentDate}</td>
                          <td className="py-2 px-3 text-gray-300">{pay.paymentMethod}</td>
                          <td className="py-2 px-3 text-gray-400">{pay.referenceNumber || '-'}</td>
                          <td className="py-2 px-3 text-right font-bold text-emerald-400">{formatCurrency(pay.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
