import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  Wallet,
  Printer,
  Download,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  Building,
  CreditCard,
  Banknote,
  Coins,
} from 'lucide-react';

interface CashBalanceReportProps {
  dateFrom: string;
  dateTo: string;
}

export const CashBalanceReport: React.FC<CashBalanceReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const {
    invoices,
    expenses,
    supplierPayments,
    orders,
    purchaseReturns,
    formatCurrency,
    setActivePrintReport,
  } = useApp();

  // Inflows
  const cashSalesInflow = useMemo(() => {
    return invoices
      .filter((i) => isWithinDateRange(i.date, dateFrom, dateTo) && i.paymentMethod === 'Cash')
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [invoices, dateFrom, dateTo]);

  const electronicSalesInflow = useMemo(() => {
    return invoices
      .filter(
        (i) =>
          isWithinDateRange(i.date, dateFrom, dateTo) &&
          (i.paymentMethod === 'Card' ||
            i.paymentMethod === 'LankaQR / Online' ||
            i.paymentMethod === 'Bank Transfer / Cheque')
      )
      .reduce((sum, i) => sum + i.grandTotal, 0);
  }, [invoices, dateFrom, dateTo]);

  const customOrderAdvancesInflow = useMemo(() => {
    return orders
      .filter((o) => isWithinDateRange(o.orderDate, dateFrom, dateTo))
      .reduce((sum, o) => sum + (o.advancePaid || 0), 0);
  }, [orders, dateFrom, dateTo]);

  const purchaseReturnsRefundInflow = useMemo(() => {
    return purchaseReturns
      .filter((r) => isWithinDateRange(r.returnDate, dateFrom, dateTo))
      .reduce((sum, r) => sum + r.totalRefundAmount, 0);
  }, [purchaseReturns, dateFrom, dateTo]);

  const totalCashInflow =
    cashSalesInflow +
    electronicSalesInflow +
    customOrderAdvancesInflow +
    purchaseReturnsRefundInflow;

  // Outflows
  const operatingExpensesOutflow = useMemo(() => {
    return expenses
      .filter((e) => isWithinDateRange(e.date, dateFrom, dateTo))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, dateFrom, dateTo]);

  const supplierPaymentsOutflow = useMemo(() => {
    return supplierPayments
      .filter((p) => isWithinDateRange(p.paymentDate, dateFrom, dateTo))
      .reduce((sum, p) => sum + p.amount, 0);
  }, [supplierPayments, dateFrom, dateTo]);

  const workshopAdvancesOutflow = useMemo(() => {
    return orders
      .filter((o) => isWithinDateRange(o.orderDate, dateFrom, dateTo))
      .reduce((sum, o) => sum + (o.workshopAdvancePaid || 0), 0);
  }, [orders, dateFrom, dateTo]);

  const salesRefundsOutflow = useMemo(() => {
    let sum = 0;
    invoices.forEach((i) => {
      if (i.returnedItems && i.returnedItems.length > 0) {
        i.returnedItems.forEach((ret) => {
          if (isWithinDateRange(ret.returnDate || i.date, dateFrom, dateTo)) {
            sum += ret.refundAmount;
          }
        });
      }
    });
    return sum;
  }, [invoices, dateFrom, dateTo]);

  const totalCashOutflow =
    operatingExpensesOutflow +
    supplierPaymentsOutflow +
    workshopAdvancesOutflow +
    salesRefundsOutflow;

  const netCashFlow = totalCashInflow - totalCashOutflow;

  // Chronological unified ledger
  const unifiedLedger = useMemo(() => {
    const records: {
      id: string;
      date: string;
      description: string;
      category: string;
      type: 'INFLOW' | 'OUTFLOW';
      amount: number;
      method: string;
    }[] = [];

    // Inflows
    invoices.forEach((i) => {
      if (isWithinDateRange(i.date, dateFrom, dateTo)) {
        records.push({
          id: `inv-${i.id}`,
          date: i.date,
          description: `Sales Invoice #${i.invoiceNumber} (${i.customerName})`,
          category: 'Sales Revenue',
          type: 'INFLOW',
          amount: i.grandTotal,
          method: i.paymentMethod,
        });
      }
    });

    orders.forEach((o) => {
      if (isWithinDateRange(o.orderDate, dateFrom, dateTo) && o.advancePaid > 0) {
        records.push({
          id: `ord-adv-${o.id}`,
          date: o.orderDate,
          description: `Custom Order Advance #${o.orderNumber} (${o.customerName})`,
          category: 'Order Advance',
          type: 'INFLOW',
          amount: o.advancePaid,
          method: 'Cash / Card',
        });
      }
    });

    // Outflows
    expenses.forEach((e) => {
      if (isWithinDateRange(e.date, dateFrom, dateTo)) {
        records.push({
          id: `exp-${e.id}`,
          date: e.date,
          description: `Expense: ${e.title} (${e.payee || e.category})`,
          category: e.category,
          type: 'OUTFLOW',
          amount: e.amount,
          method: e.paymentMethod,
        });
      }
    });

    supplierPayments.forEach((sp) => {
      if (isWithinDateRange(sp.paymentDate, dateFrom, dateTo)) {
        records.push({
          id: `sp-${sp.id}`,
          date: sp.paymentDate,
          description: `Supplier Payment #${sp.paymentNumber} to ${sp.supplierName}`,
          category: 'Supplier Settlement',
          type: 'OUTFLOW',
          amount: sp.amount,
          method: sp.paymentMethod,
        });
      }
    });

    orders.forEach((o) => {
      if (isWithinDateRange(o.orderDate, dateFrom, dateTo) && (o.workshopAdvancePaid || 0) > 0) {
        records.push({
          id: `ws-adv-${o.id}`,
          date: o.orderDate,
          description: `Workshop Advance for Order #${o.orderNumber}`,
          category: 'Workshop Making',
          type: 'OUTFLOW',
          amount: o.workshopAdvancePaid || 0,
          method: 'Cash / Transfer',
        });
      }
    });

    return records.sort((a, b) => (b.date > a.date ? 1 : -1));
  }, [invoices, orders, expenses, supplierPayments, dateFrom, dateTo]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Date',
      'Transaction Description',
      'Category / Purpose',
      'Direction',
      'Inflow Amount (LKR)',
      'Outflow Amount (LKR)',
      'Payment Method',
    ];
    const rows = unifiedLedger.map((tx) => [
      tx.date,
      tx.description,
      tx.category,
      tx.type,
      tx.type === 'INFLOW' ? tx.amount : 0,
      tx.type === 'OUTFLOW' ? tx.amount : 0,
      tx.method,
    ]);
    exportToCsv('Cash_Balance_and_Cashflow_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = ['Date', 'Description', 'Category', 'Method', 'Inflow (+)', 'Outflow (-)'];
    const rows = unifiedLedger.map((tx) => [
      tx.date,
      tx.description,
      tx.category,
      tx.method,
      tx.type === 'INFLOW' ? formatCurrency(tx.amount) : '-',
      tx.type === 'OUTFLOW' ? formatCurrency(tx.amount) : '-',
    ]);
    const totalsRow = [
      'NET CASH MOVEMENT',
      `${unifiedLedger.length} Transactions`,
      '-',
      '-',
      formatCurrency(totalCashInflow),
      formatCurrency(totalCashOutflow),
    ];
    setActivePrintReport({
      type: 'cash_balance',
      title: 'Cash Balance, Liquidity & Cash Flow Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Inflow', value: formatCurrency(totalCashInflow) },
        { label: 'Total Outflow', value: formatCurrency(totalCashOutflow) },
        { label: 'Net Cash Movement', value: formatCurrency(netCashFlow) },
        { label: 'Total Transactions', value: `${unifiedLedger.length}` },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Audited cash inflows (POS sales, order advances) vs outflows (expenses, suppliers, workshops).',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Total Cash Inflow
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalCashInflow)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Counter sales, card & advances
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" /> Total Cash Outflow
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalCashOutflow)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Expenses, suppliers & workshops
          </p>
        </div>

        <div className="bg-[#151921] border border-amber-500/30 bg-amber-500/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            Net Cash Flow
          </span>
          <p
            className={`text-xl font-black mt-1 ${
              netCashFlow >= 0 ? 'text-amber-400' : 'text-rose-400'
            }`}
          >
            {formatCurrency(netCashFlow)}
          </p>
          <p className="text-[11px] text-amber-300/80 mt-0.5">
            Inflows minus Outflows
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Cash in Showroom Vault
          </span>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(cashSalesInflow - operatingExpensesOutflow)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Physical cash on hand estimate
          </p>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Inflows Breakdown */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#232936] pb-2">
            <PlusCircle className="w-4 h-4 text-emerald-400" /> Cash Inflows Breakdown
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Physical Cash Sales</span>
              <span className="font-bold text-emerald-400">{formatCurrency(cashSalesInflow)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Card & LankaQR Electronic Sales</span>
              <span className="font-bold text-emerald-400">{formatCurrency(electronicSalesInflow)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Custom Order Advances Received</span>
              <span className="font-bold text-emerald-400">{formatCurrency(customOrderAdvancesInflow)}</span>
            </div>
            {purchaseReturnsRefundInflow > 0 && (
              <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
                <span className="text-gray-300">Supplier Purchase Returns Refunds</span>
                <span className="font-bold text-emerald-400">{formatCurrency(purchaseReturnsRefundInflow)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 font-bold text-sm text-white">
              <span>Total Receipts & Inflow</span>
              <span className="text-emerald-400">{formatCurrency(totalCashInflow)}</span>
            </div>
          </div>
        </div>

        {/* Outflows Breakdown */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-[#232936] pb-2">
            <MinusCircle className="w-4 h-4 text-rose-400" /> Cash Outflows Breakdown
          </h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Showroom Operating Expenses</span>
              <span className="font-bold text-rose-400">{formatCurrency(operatingExpensesOutflow)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Supplier Payments & Settlements</span>
              <span className="font-bold text-rose-400">{formatCurrency(supplierPaymentsOutflow)}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
              <span className="text-gray-300">Workshop Making Advances Disbursed</span>
              <span className="font-bold text-rose-400">{formatCurrency(workshopAdvancesOutflow)}</span>
            </div>
            {salesRefundsOutflow > 0 && (
              <div className="flex justify-between py-1.5 border-b border-[#232936]/60">
                <span className="text-gray-300">Customer Sales Returns & Refunds</span>
                <span className="font-bold text-rose-400">{formatCurrency(salesRefundsOutflow)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 font-bold text-sm text-white">
              <span>Total Disbursements & Outflow</span>
              <span className="text-rose-400">{formatCurrency(totalCashOutflow)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-amber-400" /> Chronological Cash Transaction Ledger
        </h3>

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
            Print A4 Cash Statement
          </button>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Inflow (+)</th>
                <th className="py-3 px-4 text-right">Outflow (-)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {unifiedLedger.slice(0, 50).map((tx) => (
                <tr key={tx.id} className="hover:bg-[#1A202C] transition">
                  <td className="py-3 px-4 text-gray-300 font-mono">{tx.date}</td>
                  <td className="py-3 px-4 font-medium text-white">{tx.description}</td>
                  <td className="py-3 px-4 text-gray-400">{tx.category}</td>
                  <td className="py-3 px-4 text-gray-300">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1115] border border-[#232936]">
                      {tx.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                    {tx.type === 'INFLOW' ? formatCurrency(tx.amount) : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                    {tx.type === 'OUTFLOW' ? formatCurrency(tx.amount) : '-'}
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
