import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import {
  TrendingDown,
  Printer,
  Download,
  Search,
  PieChart as PieChartIcon,
  Tag,
  DollarSign,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface ExpensesReportProps {
  dateFrom: string;
  dateTo: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Showroom Rent & Lease': '#3B82F6',
  'Electricity & Utilities': '#F59E0B',
  'Staff Salaries & Commissions': '#10B981',
  'Workshop Tools & Polishing Consumables': '#EC4899',
  'Gem Testing & Lab Certification Fees': '#8B5CF6',
  'Marketing, Photography & Social Ads': '#6366F1',
  'Security & CCTV Monitoring': '#14B8A6',
  'Office Stationery & Packaging Boxes': '#F97316',
  'Tax, Legal & Audit Retainers': '#06B6D4',
  'Showroom Maintenance & Refreshments': '#84CC16',
  'Other Operational Expenses': '#94A3B8',
};

export const ExpensesReport: React.FC<ExpensesReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { expenses, invoices, formatCurrency, setActivePrintReport } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (!isWithinDateRange(e.date, dateFrom, dateTo)) return false;
      if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesTitle = e.title.toLowerCase().includes(term);
        const matchesPayee = (e.payee || '').toLowerCase().includes(term);
        const matchesRef = (e.referenceNumber || '').toLowerCase().includes(term);
        const matchesCat = e.category.toLowerCase().includes(term);
        if (!matchesTitle && !matchesPayee && !matchesRef && !matchesCat) return false;
      }
      return true;
    });
  }, [expenses, dateFrom, dateTo, selectedCategory, searchTerm]);

  // Aggregate Metrics
  const totalExpensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalesInPeriod = invoices
    .filter((i) => isWithinDateRange(i.date, dateFrom, dateTo))
    .reduce((sum, i) => sum + i.grandTotal, 0);
  const expenseToSalesRatio =
    totalSalesInPeriod > 0 ? (totalExpensesAmount / totalSalesInPeriod) * 100 : 0;

  // Grouped by Category with Totals
  const categoryTotals = useMemo(() => {
    const map = new Map<
      string,
      {
        category: string;
        count: number;
        totalAmount: number;
        percentage: number;
      }
    >();

    filteredExpenses.forEach((e) => {
      const cat = e.category || 'Other Operational Expenses';
      if (!map.has(cat)) {
        map.set(cat, {
          category: cat,
          count: 0,
          totalAmount: 0,
          percentage: 0,
        });
      }
      const entry = map.get(cat)!;
      entry.count += 1;
      entry.totalAmount += e.amount;
    });

    map.forEach((entry) => {
      entry.percentage =
        totalExpensesAmount > 0 ? (entry.totalAmount / totalExpensesAmount) * 100 : 0;
    });

    return Array.from(map.values()).sort((a, b) => b.totalAmount - a.totalAmount);
  }, [filteredExpenses, totalExpensesAmount]);

  const topExpenseCategory = categoryTotals.length > 0 ? categoryTotals[0] : null;

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Expense Date',
      'Expense Title',
      'Category',
      'Payee Name',
      'Payment Method',
      'Ref / Receipt #',
      'Amount (LKR)',
      'Recorded By',
    ];
    const rows = filteredExpenses.map((e) => [
      e.date,
      e.title,
      e.category,
      e.payee || 'N/A',
      e.paymentMethod,
      e.referenceNumber || 'N/A',
      e.amount,
      e.recordedByUserName || 'Staff',
    ]);
    exportToCsv('Operating_Expenses_By_Total_Report', headers, rows);
  };

  // Print A4
  const handlePrintReport = () => {
    const headers = ['Category / Expense', 'Date', 'Payee', 'Method', 'Ref #', 'Amount (LKR)'];
    const rows = filteredExpenses.map((e) => [
      e.title,
      e.date,
      e.payee || e.category,
      e.paymentMethod,
      e.referenceNumber || '-',
      formatCurrency(e.amount),
    ]);
    const totalsRow = [
      'TOTAL EXPENSES',
      `${filteredExpenses.length} Records`,
      '-',
      '-',
      '-',
      formatCurrency(totalExpensesAmount),
    ];
    setActivePrintReport({
      type: 'expenses_report',
      title: 'Operating Expenses & Overhead Cost Breakdown',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Expenses', value: formatCurrency(totalExpensesAmount) },
        { label: 'Top Category', value: topExpenseCategory ? topExpenseCategory.category : 'N/A' },
        { label: 'Entries Count', value: `${filteredExpenses.length}` },
        { label: 'Expense/Sales Ratio', value: `${expenseToSalesRatio.toFixed(1)}%` },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Operating expenditures verified and categorized against official shop receipts and payment vouchers.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Total Expenses
          </span>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalExpensesAmount)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {filteredExpenses.length} vouchers / receipts
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Top Overhead Category
          </span>
          <p className="text-base font-black text-white mt-1 truncate">
            {topExpenseCategory ? topExpenseCategory.category : 'N/A'}
          </p>
          <p className="text-[11px] text-amber-400 mt-0.5">
            {topExpenseCategory ? formatCurrency(topExpenseCategory.totalAmount) : '0'} (
            {topExpenseCategory ? topExpenseCategory.percentage.toFixed(1) : 0}%)
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Expense / Sales Ratio
          </span>
          <p className="text-xl font-black text-white mt-1">
            {expenseToSalesRatio.toFixed(1)}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Against {formatCurrency(totalSalesInPeriod)} revenue
          </p>
        </div>

        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
            Expense Categories
          </span>
          <p className="text-xl font-black text-white mt-1">
            {categoryTotals.length} Active Categories
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Tracked operational heads
          </p>
        </div>
      </div>

      {/* Category Totals Summary Cards & Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Category Breakdown Table */}
        <div className="lg:col-span-2 bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-[#232936] pb-2">
            <span>Expenses List by Category Totals</span>
            <span className="text-gray-400 font-mono">100.0% Distribution</span>
          </h4>
          <div className="space-y-2">
            {categoryTotals.map((cat) => (
              <div
                key={cat.category}
                className="bg-[#0F1115] border border-[#232936] p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: CATEGORY_COLORS[cat.category] || '#94A3B8' }}
                  />
                  <div>
                    <div className="text-xs font-bold text-white">{cat.category}</div>
                    <div className="text-[10px] text-gray-400">
                      {cat.count} voucher(s)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-rose-400">
                    {formatCurrency(cat.totalAmount)}
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">
                    {cat.percentage.toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Donut Chart */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Expense Allocation
          </h4>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals}
                  dataKey="totalAmount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={2}
                >
                  {categoryTotals.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.category] || '#94A3B8'}
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
          <div className="text-center text-[10px] text-gray-400 mt-2">
            Visual breakdown of all operating overheads
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search expenses by title, payee, or ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Categories</option>
            {categoryTotals.map((c) => (
              <option key={c.category} value={c.category}>
                {c.category}
              </option>
            ))}
          </select>
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
            Print Expenses Statement
          </button>
        </div>
      </div>

      {/* Itemized Expenses Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payee</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Reference / Receipt #</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No operating expense records found for this period.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 text-gray-300 font-mono">{exp.date}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{exp.title}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1115] text-gray-300 border border-[#232936]">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{exp.payee || '-'}</td>
                    <td className="py-3.5 px-4 text-gray-300">{exp.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono">{exp.referenceNumber || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(exp.amount)}
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
