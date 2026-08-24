import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import { WorkshopEmployee, EmployeePayment } from '../../types';
import {
  Users2,
  Printer,
  Download,
  Search,
  DollarSign,
  Briefcase,
  BadgePercent,
  Coins,
  Receipt,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  UserCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface WorkshopSalaryReportProps {
  dateFrom: string;
  dateTo: string;
}

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  'Daily Wage': '#3B82F6',
  'Piece Rate Work': '#10B981',
  Overtime: '#F59E0B',
  'Bonus / Festival Advance': '#8B5CF6',
};

export const WorkshopSalaryReport: React.FC<WorkshopSalaryReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { workshopEmployees, employeePayments, workshops, formatCurrency, setActivePrintReport } = useApp();

  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'employees_ledger' | 'disbursements_log'>('employees_ledger');

  // Filtered Payments History within Date Range
  const filteredPayments = useMemo(() => {
    return employeePayments.filter((p) => {
      if (!isWithinDateRange(p.paymentDate, dateFrom, dateTo)) return false;
      if (selectedWorkshop !== 'ALL' && p.workshopId !== selectedWorkshop) return false;
      if (selectedPaymentType !== 'ALL' && p.paymentType !== selectedPaymentType) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNum = p.paymentNumber.toLowerCase().includes(term);
        const matchesEmp = p.employeeName.toLowerCase().includes(term);
        const matchesWs = p.workshopName.toLowerCase().includes(term);
        const matchesType = p.paymentType.toLowerCase().includes(term);
        const matchesDesc = (p.workDescription || '').toLowerCase().includes(term);
        if (!matchesNum && !matchesEmp && !matchesWs && !matchesType && !matchesDesc) return false;
      }
      return true;
    });
  }, [employeePayments, dateFrom, dateTo, selectedWorkshop, selectedPaymentType, searchTerm]);

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return workshopEmployees.filter((emp) => {
      if (selectedWorkshop !== 'ALL' && emp.workshopId !== selectedWorkshop) return false;
      if (selectedRole !== 'ALL' && emp.role !== selectedRole) return false;

      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = emp.name.toLowerCase().includes(term);
        const matchesRole = emp.role.toLowerCase().includes(term);
        const matchesWs = emp.workshopName.toLowerCase().includes(term);
        const matchesNic = (emp.nicNumber || '').toLowerCase().includes(term);
        if (!matchesName && !matchesRole && !matchesWs && !matchesNic) return false;
      }
      return true;
    });
  }, [workshopEmployees, selectedWorkshop, selectedRole, searchTerm]);

  // Aggregate Metrics
  const totalPaidInPeriod = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const totalEarnedAllEmployees = filteredEmployees.reduce((sum, e) => sum + e.totalEarned, 0);
  const totalPaidAllEmployees = filteredEmployees.reduce((sum, e) => sum + e.totalPaid, 0);
  const totalOutstandingWagesDue = Math.max(0, totalEarnedAllEmployees - totalPaidAllEmployees);

  const averageDailyRate =
    filteredEmployees.length > 0
      ? filteredEmployees.reduce((sum, e) => sum + e.dailyRate, 0) / filteredEmployees.length
      : 0;

  // Grouped by Payment Type for Pie Chart
  const paymentTypeChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredPayments.forEach((p) => {
      map.set(p.paymentType, (map.get(p.paymentType) || 0) + p.amount);
    });
    return Array.from(map.entries()).map(([type, amount]) => ({
      type,
      amount,
    }));
  }, [filteredPayments]);

  // Grouped by Employee Earnings for Bar Chart
  const employeeEarningsChartData = useMemo(() => {
    return filteredEmployees.map((emp) => ({
      name: emp.name.split(' ')[0] || emp.name,
      earned: emp.totalEarned,
      paid: emp.totalPaid,
    }));
  }, [filteredEmployees]);

  // Export CSV
  const handleExportCsv = () => {
    if (activeSubTab === 'employees_ledger') {
      const headers = [
        'Artisan / Employee Name',
        'Role / Specialty',
        'Workshop Name',
        'NIC Number',
        'Contact Phone',
        'Daily Rate (LKR)',
        'Total Wages Earned (LKR)',
        'Total Wages Paid (LKR)',
        'Outstanding Balance Due (LKR)',
        'Joined Date',
        'Status',
      ];
      const rows = filteredEmployees.map((e) => [
        e.name,
        e.role,
        e.workshopName,
        e.nicNumber,
        e.phone,
        e.dailyRate,
        e.totalEarned,
        e.totalPaid,
        Math.max(0, e.totalEarned - e.totalPaid),
        e.joinedDate,
        e.status,
      ]);
      exportToCsv('Workshop_Artisans_Salary_Ledger', headers, rows);
    } else {
      const headers = [
        'Payment Voucher #',
        'Payment Date',
        'Artisan Name',
        'Workshop Name',
        'Payment Type',
        'Work Description',
        'Payment Method',
        'Amount Paid (LKR)',
        'Authorized By',
        'Notes',
      ];
      const rows = filteredPayments.map((p) => [
        p.paymentNumber,
        p.paymentDate,
        p.employeeName,
        p.workshopName,
        p.paymentType,
        p.workDescription || 'N/A',
        p.paymentMethod,
        p.amount,
        p.recordedBy,
        p.notes || '',
      ]);
      exportToCsv('Workshop_Salary_Disbursements_Log', headers, rows);
    }
  };

  // Print A4 Statement
  const handlePrintReport = () => {
    if (activeSubTab === 'employees_ledger') {
      const headers = [
        'Artisan Name',
        'Specialty / Role',
        'Workshop',
        'Daily Rate',
        'Total Earned',
        'Total Paid',
        'Balance Due',
      ];
      const rows = filteredEmployees.map((e) => [
        e.name,
        e.role,
        e.workshopName,
        formatCurrency(e.dailyRate),
        formatCurrency(e.totalEarned),
        formatCurrency(e.totalPaid),
        formatCurrency(Math.max(0, e.totalEarned - e.totalPaid)),
      ]);
      const totalsRow = [
        'TOTALS',
        `${filteredEmployees.length} Artisans`,
        '-',
        `Avg: ${formatCurrency(averageDailyRate)}`,
        formatCurrency(totalEarnedAllEmployees),
        formatCurrency(totalPaidAllEmployees),
        formatCurrency(totalOutstandingWagesDue),
      ];

      setActivePrintReport({
        type: 'workshop_salary_report',
        title: 'Workshop Artisans & Goldsmiths Salary & Wage Ledger',
        dateRange: `Audit as of ${new Date().toISOString().split('T')[0]}`,
        summaryCards: [
          { label: 'Active Artisans', value: `${filteredEmployees.length}` },
          { label: 'Total Wages Earned', value: formatCurrency(totalEarnedAllEmployees) },
          { label: 'Total Wages Paid', value: formatCurrency(totalPaidAllEmployees) },
          { label: 'Net Wages Due', value: formatCurrency(totalOutstandingWagesDue) },
        ],
        headers,
        rows,
        totalsRow,
        notes: 'Official payroll statement for master craftsmen, gem setters, and goldsmiths. Verified against shop wage vouchers.',
      });
    } else {
      const headers = [
        'Voucher #',
        'Date',
        'Artisan',
        'Workshop',
        'Type',
        'Description',
        'Method',
        'Amount (LKR)',
      ];
      const rows = filteredPayments.map((p) => [
        p.paymentNumber,
        p.paymentDate,
        p.employeeName,
        p.workshopName,
        p.paymentType,
        p.workDescription || '-',
        p.paymentMethod,
        formatCurrency(p.amount),
      ]);
      const totalsRow = [
        'TOTAL DISBURSEMENTS',
        `${filteredPayments.length} Vouchers`,
        '-',
        '-',
        '-',
        '-',
        '-',
        formatCurrency(totalPaidInPeriod),
      ];

      setActivePrintReport({
        type: 'salary_disbursements_report',
        title: 'Workshop Artisan Wage Disbursements & Payment Vouchers Log',
        dateRange: `${dateFrom} to ${dateTo}`,
        summaryCards: [
          { label: 'Total Wages Disbursed', value: formatCurrency(totalPaidInPeriod) },
          { label: 'Vouchers Issued', value: `${filteredPayments.length}` },
          { label: 'Artisans Paid', value: `${new Set(filteredPayments.map((p) => p.employeeId)).size}` },
        ],
        headers,
        rows,
        totalsRow,
        notes: 'Disbursement vouchers verified with cash drawer and bank transfer authorizations.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Wages Disbursed in Period */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Wages Paid in Period
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalPaidInPeriod)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {filteredPayments.length} Wage payment vouchers
          </p>
        </div>

        {/* Total Earned vs Paid */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Wages Earned
            </span>
            <Briefcase className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalEarnedAllEmployees)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Paid to date: <span className="text-emerald-400 font-mono">{formatCurrency(totalPaidAllEmployees)}</span>
          </p>
        </div>

        {/* Outstanding Wage Balance */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Outstanding Wage Balance
            </span>
            <Coins className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black text-rose-400 mt-1">
            {formatCurrency(totalOutstandingWagesDue)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Payable to active craftsmen
          </p>
        </div>

        {/* Active Artisans & Avg Daily Rate */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Craftsmen Team
            </span>
            <Users2 className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">
            {filteredEmployees.length} <span className="text-sm text-gray-400 font-normal">Artisans</span>
          </p>
          <p className="text-[11px] text-amber-400 mt-0.5">
            Avg Daily Rate: {formatCurrency(averageDailyRate)}
          </p>
        </div>
      </div>

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Payment Type Allocation Pie */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Wage Payment Types</span>
            <span className="text-[10px] text-gray-400 font-normal">In Selected Period</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentTypeChartData}
                  dataKey="amount"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {paymentTypeChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.type}`}
                      fill={PAYMENT_TYPE_COLORS[entry.type] || '#94A3B8'}
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
            {paymentTypeChartData.map((t) => (
              <div key={t.type} className="flex items-center gap-1 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: PAYMENT_TYPE_COLORS[t.type] || '#94A3B8' }}
                />
                <span className="text-gray-300 truncate">{t.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Employee Earned vs Paid Bar Chart */}
        <div className="lg:col-span-2 bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Artisan Wages Earned vs Paid</span>
            <span className="text-[10px] text-gray-400 font-normal">Lifetime Ledger</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeEarningsChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#6B7280" fontSize={11} />
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
                <Bar dataKey="earned" name="Total Wages Earned" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Total Wages Disbursed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#232936] text-[11px] text-gray-400">
            <span>Amber: Total Wages Earned</span>
            <span>Green: Total Disbursed to Artisan</span>
          </div>
        </div>
      </div>

      {/* Sub-Tab Navigation & Filter Controls */}
      <div className="space-y-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        <div className="flex items-center gap-2 border-b border-[#232936] pb-3">
          <button
            onClick={() => setActiveSubTab('employees_ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'employees_ledger'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
            }`}
          >
            <Users2 className="w-3.5 h-3.5" />
            Artisan Salary & Wage Ledger ({filteredEmployees.length})
          </button>

          <button
            onClick={() => setActiveSubTab('disbursements_log')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeSubTab === 'disbursements_log'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-[#0F1115] text-gray-400 hover:text-white border border-[#232936]'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            Disbursements & Payment Vouchers Log ({filteredPayments.length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 flex-1 max-w-xl flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeSubTab === 'employees_ledger'
                    ? 'Search craftsman by name, role, NIC...'
                    : 'Search voucher #, artisan, description...'
                }
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

            {/* SubTab Specific Filter */}
            {activeSubTab === 'employees_ledger' ? (
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Roles</option>
                <option value="Master Craftsman">Master Craftsman</option>
                <option value="Gem Setter">Gem Setter</option>
                <option value="Gold Smelter">Gold Smelter</option>
                <option value="Polisher">Polisher</option>
                <option value="Cad Designer">Cad Designer</option>
                <option value="Apprentice">Apprentice</option>
              </select>
            ) : (
              <select
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="ALL">All Payment Types</option>
                <option value="Daily Wage">Daily Wage</option>
                <option value="Piece Rate Work">Piece Rate Work</option>
                <option value="Overtime">Overtime</option>
                <option value="Bonus / Festival Advance">Bonus / Festival Advance</option>
              </select>
            )}
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
              Print A4 Payroll Statement
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Display */}
      {activeSubTab === 'employees_ledger' ? (
        /* Artisan Salary & Wage Ledger Table */
        <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                  <th className="py-3 px-4">Artisan Name</th>
                  <th className="py-3 px-4">Role / Specialty</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">NIC & Phone</th>
                  <th className="py-3 px-4 text-right">Daily Rate</th>
                  <th className="py-3 px-4 text-right">Total Earned</th>
                  <th className="py-3 px-4 text-right">Total Paid</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      No workshop employees match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => {
                    const balanceDue = Math.max(0, emp.totalEarned - emp.totalPaid);

                    return (
                      <tr key={emp.id} className="hover:bg-[#1A202C] transition">
                        <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-amber-400" />
                          {emp.name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-[#0F1115] text-amber-300 border border-amber-500/30">
                            {emp.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">{emp.workshopName}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-gray-300">{emp.nicNumber}</div>
                          <div className="text-[10px] text-gray-400 font-mono">{emp.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-gray-200">
                          {formatCurrency(emp.dailyRate)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-400">
                          {formatCurrency(emp.totalEarned)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                          {formatCurrency(emp.totalPaid)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-black">
                          {balanceDue > 0 ? (
                            <span className="text-rose-400">{formatCurrency(balanceDue)}</span>
                          ) : (
                            <span className="text-gray-400">Settled (0.00)</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              emp.status === 'active'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {emp.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Disbursements Log Table */
        <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                  <th className="py-3 px-4">Voucher #</th>
                  <th className="py-3 px-4">Payment Date</th>
                  <th className="py-3 px-4">Artisan Name</th>
                  <th className="py-3 px-4">Workshop</th>
                  <th className="py-3 px-4">Payment Type</th>
                  <th className="py-3 px-4">Work / Job Description</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Amount (LKR)</th>
                  <th className="py-3 px-4">Authorized By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#232936]">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-gray-500">
                      No wage disbursement vouchers recorded for this period.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-[#1A202C] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {p.paymentNumber}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-300">{p.paymentDate}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{p.employeeName}</td>
                      <td className="py-3.5 px-4 text-gray-300">{p.workshopName}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-semibold"
                          style={{
                            backgroundColor: `${PAYMENT_TYPE_COLORS[p.paymentType] || '#94A3B8'}20`,
                            color: PAYMENT_TYPE_COLORS[p.paymentType] || '#94A3B8',
                          }}
                        >
                          {p.paymentType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300 max-w-[200px] truncate" title={p.workDescription}>
                        {p.workDescription || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{p.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400">{p.recordedBy}</td>
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
