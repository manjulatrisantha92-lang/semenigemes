import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv } from '../../utils/reportUtils';
import {
  Gem,
  Layers,
  Printer,
  Download,
  Search,
  Scale,
  Sparkles,
  TrendingUp,
  Tag,
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

const CHART_COLORS = [
  '#F59E0B',
  '#3B82F6',
  '#10B981',
  '#EC4899',
  '#8B5CF6',
  '#6366F1',
  '#14B8A6',
  '#F97316',
  '#06B6D4',
];

export const InventoryValuationReport: React.FC = () => {
  const { products, formatCurrency, setActivePrintReport } = useApp();

  const [groupBy, setGroupBy] = useState<
    'category' | 'metal_purity' | 'gemstone_type' | 'workshop_status' | 'itemized'
  >('category');
  const [searchTerm, setSearchTerm] = useState('');

  // Aggregated Overall Totals
  const totalStockItems = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalCostBasis = products.reduce((sum, p) => sum + p.costPrice * p.stockQuantity, 0);
  const totalRetailValue = products.reduce(
    (sum, p) => sum + p.sellingPrice * p.stockQuantity,
    0
  );
  const projectedGrossProfit = totalRetailValue - totalCostBasis;
  const averageMargin = totalRetailValue > 0 ? (projectedGrossProfit / totalRetailValue) * 100 : 0;
  const totalGrossWeightGrams = products.reduce(
    (sum, p) => sum + (p.grossWeight || 0) * p.stockQuantity,
    0
  );
  const totalGemCarats = products.reduce(
    (sum, p) =>
      sum +
      (p.gemstoneDetails || []).reduce((gSum, g) => gSum + (g.caratWeight || 0), 0) *
        p.stockQuantity,
    0
  );

  // Grouping Logic
  const groupedData = useMemo(() => {
    const map = new Map<
      string,
      {
        groupName: string;
        itemsCount: number;
        totalQty: number;
        grossWeightGrams: number;
        caratWeight: number;
        totalCost: number;
        totalRetail: number;
        projectedProfit: number;
        marginPercentage: number;
      }
    >();

    products.forEach((p) => {
      let keys: string[] = [];

      if (groupBy === 'category') {
        keys = [p.category || 'Uncategorized'];
      } else if (groupBy === 'metal_purity') {
        keys = [p.metalPurity || 'Other / Not Specified'];
      } else if (groupBy === 'workshop_status') {
        keys = [p.workshopStatus || 'in_stock'];
      } else if (groupBy === 'gemstone_type') {
        if (p.gemstoneDetails && p.gemstoneDetails.length > 0) {
          keys = p.gemstoneDetails.map((g) => g.gemType || 'Other Gemstone');
        } else {
          keys = ['Plain Gold / No Gems'];
        }
      }

      keys.forEach((key) => {
        if (!map.has(key)) {
          map.set(key, {
            groupName: key,
            itemsCount: 0,
            totalQty: 0,
            grossWeightGrams: 0,
            caratWeight: 0,
            totalCost: 0,
            totalRetail: 0,
            projectedProfit: 0,
            marginPercentage: 0,
          });
        }

        const entry = map.get(key)!;
        entry.itemsCount += 1;
        entry.totalQty += p.stockQuantity;
        entry.grossWeightGrams += (p.grossWeight || 0) * p.stockQuantity;
        entry.caratWeight +=
          (p.gemstoneDetails || []).reduce((s, g) => s + (g.caratWeight || 0), 0) *
          p.stockQuantity;
        entry.totalCost += p.costPrice * p.stockQuantity;
        entry.totalRetail += p.sellingPrice * p.stockQuantity;
      });
    });

    map.forEach((entry) => {
      entry.projectedProfit = entry.totalRetail - entry.totalCost;
      entry.marginPercentage =
        entry.totalRetail > 0 ? (entry.projectedProfit / entry.totalRetail) * 100 : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.totalRetail - a.totalRetail);
  }, [products, groupBy]);

  // Filtered Itemized Products
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;
    const term = searchTerm.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.itemCode.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.metalPurity.toLowerCase().includes(term)
    );
  }, [products, searchTerm]);

  // Export CSV
  const handleExportCsv = () => {
    if (groupBy === 'itemized') {
      const headers = [
        'Item Code',
        'Name',
        'Category',
        'Metal Purity',
        'Gross Wt (g)',
        'Gem Specs',
        'Stock Qty',
        'Unit Cost (LKR)',
        'Unit Selling (LKR)',
        'Total Cost (LKR)',
        'Total Retail Value (LKR)',
        'Projected Profit (LKR)',
        'Margin %',
      ];
      const rows = filteredProducts.map((p) => [
        p.itemCode,
        p.name,
        p.category,
        p.metalPurity,
        p.grossWeight || 0,
        p.gemstoneDetails?.map((g) => `${g.caratWeight}ct ${g.gemType}`).join(', ') || 'None',
        p.stockQuantity,
        p.costPrice,
        p.sellingPrice,
        p.costPrice * p.stockQuantity,
        p.sellingPrice * p.stockQuantity,
        (p.sellingPrice - p.costPrice) * p.stockQuantity,
        p.sellingPrice > 0
          ? (((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100).toFixed(1)
          : '0',
      ]);
      exportToCsv('Itemized_Inventory_Valuation_Report', headers, rows);
    } else {
      const headers = [
        'Group / Classification',
        'SKUs Count',
        'Total Stock Units',
        'Gross Weight (g)',
        'Gem Carats (cts)',
        'Total Cost Basis (LKR)',
        'Total Retail Value (LKR)',
        'Projected Profit (LKR)',
        'Profit Margin (%)',
      ];
      const rows = groupedData.map((g) => [
        g.groupName,
        g.itemsCount,
        g.totalQty,
        g.grossWeightGrams.toFixed(2),
        g.caratWeight.toFixed(2),
        g.totalCost,
        g.totalRetail,
        g.projectedProfit,
        `${g.marginPercentage.toFixed(1)}%`,
      ]);
      exportToCsv(`Inventory_Valuation_By_${groupBy}_Report`, headers, rows);
    }
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = [
      'Classification',
      'Items',
      'Stock Qty',
      'Gold Wt (g)',
      'Gem Cts',
      'Cost Basis',
      'Retail Value',
      'Projected Profit',
    ];
    const rows = groupedData.map((g) => [
      g.groupName,
      g.itemsCount,
      g.totalQty,
      `${g.grossWeightGrams.toFixed(1)}g`,
      `${g.caratWeight.toFixed(1)}ct`,
      formatCurrency(g.totalCost),
      formatCurrency(g.totalRetail),
      formatCurrency(g.projectedProfit),
    ]);
    const totalsRow = [
      'TOTAL INVENTORY',
      `${products.length} SKUs`,
      `${totalStockItems} Pcs`,
      `${totalGrossWeightGrams.toFixed(1)}g`,
      `${totalGemCarats.toFixed(1)}ct`,
      formatCurrency(totalCostBasis),
      formatCurrency(totalRetailValue),
      formatCurrency(projectedGrossProfit),
    ];
    setActivePrintReport({
      type: 'inventory_valuation',
      title: `Inventory Stock Valuation Audit (Grouped by ${groupBy.replace('_', ' ').toUpperCase()})`,
      dateRange: `As of ${new Date().toISOString().split('T')[0]}`,
      summaryCards: [
        { label: 'Total Retail Value', value: formatCurrency(totalRetailValue) },
        { label: 'Total Cost Basis', value: formatCurrency(totalCostBasis) },
        { label: 'Projected Profit', value: formatCurrency(projectedGrossProfit) },
        { label: 'Average Margin', value: `${averageMargin.toFixed(1)}%` },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Certified valuation based on actual showroom cost basis and retail catalog pricing.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Inventory Retail Value
          </span>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(totalRetailValue)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {totalStockItems} total jewelry & gem units
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Cost Basis Valuation
          </span>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalCostBasis)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Capital invested in stock
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Projected Gross Profit
          </span>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(projectedGrossProfit)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-0.5">
            {averageMargin.toFixed(1)}% Average Markup Margin
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Precious Metals & Gems Weight
          </span>
          <div className="flex items-center justify-between mt-1">
            <p className="text-base font-bold text-amber-300">
              {totalGrossWeightGrams.toFixed(1)} g
            </p>
            <p className="text-base font-bold text-cyan-300">
              {totalGemCarats.toFixed(1)} cts
            </p>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Gold weight & Ceylon gemstone carats
          </p>
        </div>
      </div>

      {/* Grouping Switcher & Actions Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-gray-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-400" /> List By:
          </span>
          {[
            { id: 'category', label: 'Category' },
            { id: 'metal_purity', label: 'Metal Purity' },
            { id: 'gemstone_type', label: 'Gemstone Type' },
            { id: 'workshop_status', label: 'Workshop Status' },
            { id: 'itemized', label: 'Itemized SKU List' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setGroupBy(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                groupBy === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow'
                  : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {groupBy === 'itemized' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#1E2430] hover:bg-[#283040] text-gray-200 hover:text-white rounded-xl text-xs font-semibold border border-[#2D3545] transition"
          >
            <Download className="w-3.5 h-3.5" />
            CSV
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print A4 Valuation
          </button>
        </div>
      </div>

      {/* Main Table */}
      {groupBy !== 'itemized' ? (
        <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                  <th className="py-3 px-4">Group Classification</th>
                  <th className="py-3 px-4 text-center">SKUs</th>
                  <th className="py-3 px-4 text-center">Stock Units</th>
                  <th className="py-3 px-4 text-right">Gold Wt (g)</th>
                  <th className="py-3 px-4 text-right">Gem Cts</th>
                  <th className="py-3 px-4 text-right">Cost Basis</th>
                  <th className="py-3 px-4 text-right">Retail Value</th>
                  <th className="py-3 px-4 text-right">Projected Profit</th>
                  <th className="py-3 px-4 text-center">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {groupedData.map((g) => (
                  <tr key={g.groupName} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      {g.groupName}
                    </td>
                    <td className="py-3.5 px-4 text-center text-gray-400">{g.itemsCount}</td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">{g.totalQty}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-amber-300">
                      {g.grossWeightGrams > 0 ? `${g.grossWeightGrams.toFixed(1)}g` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-cyan-300">
                      {g.caratWeight > 0 ? `${g.caratWeight.toFixed(1)}ct` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-gray-300">
                      {formatCurrency(g.totalCost)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                      {formatCurrency(g.totalRetail)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(g.projectedProfit)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {g.marginPercentage.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
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
                  <th className="py-3 px-4">Item Code</th>
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Purity & Gem</th>
                  <th className="py-3 px-4 text-center">Stock</th>
                  <th className="py-3 px-4 text-right">Unit Cost</th>
                  <th className="py-3 px-4 text-right">Selling Price</th>
                  <th className="py-3 px-4 text-right">Stock Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">{p.itemCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-white">{p.name}</td>
                    <td className="py-3.5 px-4 text-gray-300">{p.category}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      <div className="text-[11px] text-gray-300">{p.metalPurity}</div>
                      {p.gemstoneDetails?.length > 0 && (
                        <div className="text-[10px] text-amber-300/80">
                          {p.gemstoneDetails.map((g) => `${g.caratWeight}ct ${g.gemType}`).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-white">{p.stockQuantity}</td>
                    <td className="py-3.5 px-4 text-right text-gray-400">{formatCurrency(p.costPrice)}</td>
                    <td className="py-3.5 px-4 text-right text-gray-200">{formatCurrency(p.sellingPrice)}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                      {formatCurrency(p.sellingPrice * p.stockQuantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
