import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import { WorkshopAdvancePayment } from '../../types';
import {
  Coins,
  Printer,
  Download,
  Search,
  DollarSign,
  Building2,
  Receipt,
  FileCheck,
  Calendar,
  Wallet,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

interface WorkshopSalaryAdvanceReportProps {
  dateFrom: string;
  dateTo: string;
}

const PURPOSE_COLORS: Record<string, string> = {
  'Order Advance': '#3B82F6',
  'Worker Advance': '#10B981',
  'Gold Bullion Advance': '#F59E0B',
  'Settlement of Making Charges': '#8B5CF6',
};

export const WorkshopSalaryAdvanceReport: React.FC<WorkshopSalaryAdvanceReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { advances, workshops, formatCurrency, setActivePrintReport } = useApp();

  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedPurpose, setSelectedPurpose] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Filtered Advances
  const filteredAdvances = useMemo(() => {
    return advances.filter((adv) => {
      if (!isWithinDateRange(adv.paymentDate, dateFrom, dateTo)) return false;
      if (selectedWorkshop !== 'ALL' && adv.workshopId !== selectedWorkshop) return false;
      if (selectedPurpose !== 'ALL' && adv.paymentPurpose !== selectedPurpose) return false;
      if (selectedPaymentMethod !== 'ALL' && adv.paymentMethod !== selectedPaymentMethod) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNum = adv.paymentNumber.toLowerCase().includes(term);
        const matchesWs = adv.workshopName.toLowerCase().includes(term);
        const matchesOrd = (adv.orderNumber || '').toLowerCase().includes(term);
        const matchesRef = (adv.receiptRef || '').toLowerCase().includes(term);
        const matchesNotes = (adv.notes || '').toLowerCase().includes(term);
        if (!matchesNum && !matchesWs && !matchesOrd && !matchesRef && !matchesNotes) return false;
      }

      return true;
    });
  }, [advances, dateFrom, dateTo, selectedWorkshop, selectedPurpose, selectedPaymentMethod, searchTerm]);

  // Aggregate Metrics
  const totalAdvancesAmount = filteredAdvances.reduce((sum, a) => sum + a.amount, 0);

  const orderAdvancesTotal = filteredAdvances
    .filter((a) => a.paymentPurpose === 'Order Advance')
    .reduce((sum, a) => sum + a.amount, 0);

  const workerSalaryAdvancesTotal = filteredAdvances
    .filter((a) => a.paymentPurpose === 'Worker Advance')
    .reduce((sum, a) => sum + a.amount, 0);

  const bullionAdvancesTotal = filteredAdvances
    .filter((a) => a.paymentPurpose === 'Gold Bullion Advance')
    .reduce((sum, a) => sum + a.amount, 0);

  const settlementAdvancesTotal = filteredAdvances
    .filter((a) => a.paymentPurpose === 'Settlement of Making Charges')
    .reduce((sum, a) => sum + a.amount, 0);

  // Grouped by Purpose for Pie Chart
  const purposeChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredAdvances.forEach((a) => {
      map.set(a.paymentPurpose, (map.get(a.paymentPurpose) || 0) + a.amount);
    });
    return Array.from(map.entries()).map(([purpose, amount]) => ({
      purpose,
      amount,
    }));
  }, [filteredAdvances]);

  // Grouped by Workshop for Bar Chart
  const workshopAdvancesChartData = useMemo(() => {
    const map = new Map<string, { workshop: string; total: number }>();
    filteredAdvances.forEach((a) => {
      const name = a.workshopName.split(' ')[0] || 'Workshop';
      if (!map.has(a.workshopId)) {
        map.set(a.workshopId, { workshop: name, total: 0 });
      }
      map.get(a.workshopId)!.total += a.amount;
    });
    return Array.from(map.values());
  }, [filteredAdvances]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Voucher / Advance #',
      'Disbursement Date',
      'Workshop Name',
      'Advance Purpose',
      'Linked Order #',
      'Payment Method',
      'Receipt Ref / Voucher',
      'Amount Disbursed (LKR)',
      'Authorized / Recorded By',
      'Notes & Particulars',
    ];
    const rows = filteredAdvances.map((a) => [
      a.paymentNumber,
      a.paymentDate,
      a.workshopName,
      a.paymentPurpose,
      a.orderNumber || 'General Workshop Pool',
      a.paymentMethod,
      a.receiptRef || 'N/A',
      a.amount,
      a.recordedBy,
      a.notes || '',
    ]);

    exportToCsv('Workshop_Advances_and_Disbursements_Report', headers, rows);
  };

  // Print A4 Statement
  const handlePrintReport = () => {
    const headers = [
      'Voucher #',
      'Date',
      'Workshop',
      'Advance Purpose',
      'Linked Order',
      'Method',
      'Ref #',
      'Amount (LKR)',
    ];
    const rows = filteredAdvances.map((a) => [
      a.paymentNumber,
      a.paymentDate,
      a.workshopName,
      a.paymentPurpose,
      a.orderNumber || '-',
      a.paymentMethod,
      a.receiptRef || '-',
      formatCurrency(a.amount),
    ]);
    const totalsRow = [
      'TOTAL ADVANCES',
      `${filteredAdvances.length} Vouchers`,
      '-',
      '-',
      '-',
      '-',
      '-',
      formatCurrency(totalAdvancesAmount),
    ];

    setActivePrintReport({
      type: 'workshop_advances_report',
      title: 'Workshop Salary Advances & Production Advances Disbursement Audit',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Advances Disbursed', value: formatCurrency(totalAdvancesAmount) },
        { label: 'Order Advances', value: formatCurrency(orderAdvancesTotal) },
        { label: 'Worker / Salary Advances', value: formatCurrency(workerSalaryAdvancesTotal) },
        { label: 'Bullion & Settlements', value: formatCurrency(bullionAdvancesTotal + settlementAdvancesTotal) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Disbursement register for goldsmith cash advances, order casting deposits, and metal bullion advance settlements.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Advances Paid */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Advances Disbursed
            </span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 mt-1">
            {formatCurrency(totalAdvancesAmount)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {filteredAdvances.length} Disbursed advance vouchers
          </p>
        </div>

        {/* Order Advances */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Job Order Advances
            </span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-xl font-black text-blue-400 mt-1">
            {formatCurrency(orderAdvancesTotal)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Directly tied to custom orders
          </p>
        </div>

        {/* Worker / Salary Advances */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Worker / Salary Advances
            </span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(workerSalaryAdvancesTotal)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Personal & festival advances
          </p>
        </div>

        {/* Bullion & Final Settlements */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Bullion & Settlements
            </span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-black text-purple-400 mt-1">
            {formatCurrency(bullionAdvancesTotal + settlementAdvancesTotal)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Material and labor charge settlements
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Advance Purpose Allocation Pie */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Advance Purpose Allocation</span>
            <span className="text-[10px] text-gray-400 font-normal">By Value</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={purposeChartData}
                  dataKey="amount"
                  nameKey="purpose"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {purposeChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.purpose}`}
                      fill={PURPOSE_COLORS[entry.purpose] || '#94A3B8'}
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
          <div className="grid grid-cols-2 gap-1 pt-2 border-t border-[#232936] text-[10px]">
            {purposeChartData.map((p) => (
              <div key={p.purpose} className="flex items-center gap-1 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: PURPOSE_COLORS[p.purpose] || '#94A3B8' }}
                />
                <span className="text-gray-300 truncate">{p.purpose}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Advances Bar Chart */}
        <div className="lg:col-span-2 bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Advances by Workshop Recipient</span>
            <span className="text-[10px] text-gray-400 font-normal">Cumulative in Period</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workshopAdvancesChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="workshop" stroke="#6B7280" fontSize={11} />
                <YAxis
                  stroke="#6B7280"
                  fontSize={11}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => formatCurrency(val)}
                  contentStyle={{
                    backgroundColor: '#0F1115',
                    borderColor: '#232936',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="total" name="Advances Disbursed" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#232936] text-[11px] text-gray-400">
            <span>Total advance balance settled against completed jewelry making charges</span>
          </div>
        </div>
      </div>

      {/* Filter Controls Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-2 flex-1 max-w-xl flex-wrap">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search voucher #, workshop, order #, ref..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Workshop Dropdown */}
          <select
            value={selectedWorkshop}
            onChange={(e) => setSelectedWorkshop(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Workshops</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>

          {/* Purpose Dropdown */}
          <select
            value={selectedPurpose}
            onChange={(e) => setSelectedPurpose(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Purposes</option>
            <option value="Order Advance">Order Advance</option>
            <option value="Worker Advance">Worker Advance</option>
            <option value="Gold Bullion Advance">Gold Bullion Advance</option>
            <option value="Settlement of Making Charges">Settlement of Making Charges</option>
          </select>

          {/* Method Dropdown */}
          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Methods</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer / Cheque">Bank Transfer / Cheque</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {/* Action Buttons */}
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
            Print Advances Statement
          </button>
        </div>
      </div>

      {/* Advances Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Workshop</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Linked Order #</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Ref / Receipt #</th>
                <th className="py-3 px-4 text-right">Amount (LKR)</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredAdvances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-gray-500">
                    No workshop advance disbursement records found.
                  </td>
                </tr>
              ) : (
                filteredAdvances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {adv.paymentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{adv.paymentDate}</td>
                    <td className="py-3.5 px-4 font-bold text-white">{adv.workshopName}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-semibold"
                        style={{
                          backgroundColor: `${PURPOSE_COLORS[adv.paymentPurpose] || '#94A3B8'}20`,
                          color: PURPOSE_COLORS[adv.paymentPurpose] || '#94A3B8',
                        }}
                      >
                        {adv.paymentPurpose}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">
                      {adv.orderNumber || <span className="text-gray-500">General Advance</span>}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{adv.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-gray-400 font-mono">{adv.receiptRef || '-'}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-amber-400">
                      {formatCurrency(adv.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{adv.recordedBy}</td>
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
