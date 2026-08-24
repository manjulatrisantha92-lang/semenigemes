import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv } from '../../utils/reportUtils';
import {
  AlertTriangle,
  Printer,
  Download,
  Search,
  PackageX,
  RefreshCw,
  PlusCircle,
  Sparkles,
} from 'lucide-react';

export const LowStockReport: React.FC = () => {
  const { products, formatCurrency, setActivePrintReport, setCurrentPage } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'OUT_OF_STOCK' | 'LOW_STOCK'>(
    'ALL'
  );

  // Low stock products: stockQuantity <= minStockAlert
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => {
      const isLow = p.stockQuantity <= (p.minStockAlert || 2);
      if (!isLow) return false;
      if (filterSeverity === 'OUT_OF_STOCK' && p.stockQuantity > 0) return false;
      if (filterSeverity === 'LOW_STOCK' && p.stockQuantity === 0) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(term);
        const matchesCode = p.itemCode.toLowerCase().includes(term);
        const matchesCat = p.category.toLowerCase().includes(term);
        if (!matchesName && !matchesCode && !matchesCat) return false;
      }
      return true;
    });
  }, [products, filterSeverity, searchTerm]);

  // Aggregate Metrics
  const totalLowStockCount = lowStockProducts.length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;
  const totalSuggestedReplenishCost = lowStockProducts.reduce((sum, p) => {
    const needed = Math.max(1, (p.minStockAlert || 3) * 2 - p.stockQuantity);
    return sum + needed * p.costPrice;
  }, 0);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Item Code',
      'Item Name',
      'Category',
      'Metal Purity',
      'Current Stock Qty',
      'Min Alert Level',
      'Unit Cost (LKR)',
      'Recommended Reorder Qty',
      'Estimated Reorder Cost (LKR)',
      'Status',
    ];
    const rows = lowStockProducts.map((p) => {
      const recommendedQty = Math.max(1, (p.minStockAlert || 3) * 2 - p.stockQuantity);
      return [
        p.itemCode,
        p.name,
        p.category,
        p.metalPurity,
        p.stockQuantity,
        p.minStockAlert || 2,
        p.costPrice,
        recommendedQty,
        recommendedQty * p.costPrice,
        p.stockQuantity === 0 ? 'CRITICAL OUT OF STOCK' : 'LOW STOCK ALERT',
      ];
    });
    exportToCsv('Low_Stock_and_Reorder_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = [
      'Item Code',
      'Product Name',
      'Category',
      'Stock Qty',
      'Min Alert',
      'Unit Cost',
      'Suggested Order',
      'Restock Cost',
    ];
    const rows = lowStockProducts.map((p) => {
      const recommendedQty = Math.max(1, (p.minStockAlert || 3) * 2 - p.stockQuantity);
      return [
        p.itemCode,
        p.name,
        p.category,
        p.stockQuantity,
        p.minStockAlert || 2,
        formatCurrency(p.costPrice),
        `${recommendedQty} Pcs`,
        formatCurrency(recommendedQty * p.costPrice),
      ];
    });
    const totalsRow = [
      'TOTAL REORDER',
      `${lowStockProducts.length} Items`,
      '-',
      lowStockProducts.reduce((s, p) => s + p.stockQuantity, 0),
      '-',
      '-',
      `${lowStockProducts.reduce(
        (s, p) => s + Math.max(1, (p.minStockAlert || 3) * 2 - p.stockQuantity),
        0
      )} Pcs`,
      formatCurrency(totalSuggestedReplenishCost),
    ];
    setActivePrintReport({
      type: 'low_stock',
      title: 'Low Stock & Critical Inventory Replenishment Audit',
      dateRange: `Generated on ${new Date().toISOString().split('T')[0]}`,
      summaryCards: [
        { label: 'Low Stock SKUs', value: `${totalLowStockCount}` },
        { label: 'Out of Stock', value: `${outOfStockCount}` },
        { label: 'Estimated Restock Cost', value: formatCurrency(totalSuggestedReplenishCost) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Priority purchase order requisition list for gold bullion casting and Ceylon gemstone replenishment.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Low Stock Alerts
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {totalLowStockCount} SKUs
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            At or below safety threshold
          </p>
        </div>

        <div className="bg-[#151921] border border-rose-500/30 bg-rose-500/5 rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <PackageX className="w-3.5 h-3.5 text-rose-400" /> Critical Zero Stock
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {outOfStockCount} SKUs
          </p>
          <p className="text-[11px] text-rose-300/80 mt-0.5">
            Completely sold out
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Replenishment Capital Needed
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalSuggestedReplenishCost)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            To restore optimal stock buffer
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm flex flex-col justify-center">
          <button
            onClick={() => setCurrentPage('purchases')}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search low stock by item code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-1">
            {[
              { id: 'ALL', label: 'All Alerts' },
              { id: 'OUT_OF_STOCK', label: 'Zero Stock' },
              { id: 'LOW_STOCK', label: 'Low Stock' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setFilterSeverity(s.id as any)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterSeverity === s.id
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
                }`}
              >
                {s.label}
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
            Print Reorder Statement
          </button>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Current Stock</th>
                <th className="py-3 px-4 text-center">Min Threshold</th>
                <th className="py-3 px-4 text-right">Unit Cost</th>
                <th className="py-3 px-4 text-center">Suggested Order</th>
                <th className="py-3 px-4 text-right">Estimated Restock Cost</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-emerald-400 font-medium">
                    All inventory stocks are healthy and well above minimum safety thresholds!
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((p) => {
                  const recommendedQty = Math.max(1, (p.minStockAlert || 3) * 2 - p.stockQuantity);
                  const isZero = p.stockQuantity === 0;

                  return (
                    <tr key={p.id} className="hover:bg-[#1A202C] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {p.itemCode}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white">
                        {p.name}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{p.category}</td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded font-black text-xs ${
                            isZero
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {p.stockQuantity} Pcs
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-400 font-semibold">
                        {p.minStockAlert || 2} Pcs
                      </td>
                      <td className="py-3.5 px-4 text-right text-gray-300">
                        {formatCurrency(p.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-400">
                        +{recommendedQty} Units
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                        {formatCurrency(recommendedQty * p.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setCurrentPage('purchases')}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition"
                        >
                          Reorder
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
