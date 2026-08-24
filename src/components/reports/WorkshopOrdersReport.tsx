import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import { JewelryOrder, OrderStatus } from '../../types';
import {
  Hammer,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  TrendingUp,
  Filter,
  Eye,
  Layers,
  ChevronRight,
  Sparkles,
  Calendar,
  DollarSign,
  User,
  Building2,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface WorkshopOrdersReportProps {
  dateFrom: string;
  dateTo: string;
}

const STATUS_COLORS: Record<string, string> = {
  Completed: '#10B981',
  'In Progress': '#F59E0B',
  'Sent to Workshop': '#3B82F6',
  Pending: '#8B5CF6',
  'Returned from Workshop': '#06B6D4',
  Cancelled: '#EF4444',
};

export const WorkshopOrdersReport: React.FC<WorkshopOrdersReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { orders, workshops, workshopEmployees, formatCurrency, setActivePrintReport, setCurrentPage } = useApp();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Completed' | 'Pending' | 'In Progress' | 'Cancelled'>('ALL');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<JewelryOrder | null>(null);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Date filtering (order date)
      if (!isWithinDateRange(ord.orderDate, dateFrom, dateTo)) return false;

      // Status filter
      if (statusFilter === 'Completed' && ord.status !== 'Completed') return false;
      if (statusFilter === 'Pending' && (ord.status !== 'Pending' && ord.status !== 'Sent to Workshop')) return false;
      if (statusFilter === 'In Progress' && ord.status !== 'In Progress') return false;
      if (statusFilter === 'Cancelled' && ord.status !== 'Cancelled') return false;

      // Workshop filter
      if (selectedWorkshop !== 'ALL' && ord.workshopId !== selectedWorkshop) return false;

      // Employee filter
      if (selectedEmployee !== 'ALL' && ord.assignedEmployeeId !== selectedEmployee) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNum = ord.orderNumber.toLowerCase().includes(term);
        const matchesCust = ord.customerName.toLowerCase().includes(term);
        const matchesPhone = ord.customerPhone.toLowerCase().includes(term);
        const matchesItem = ord.itemName.toLowerCase().includes(term);
        const matchesWs = ord.workshopName.toLowerCase().includes(term);
        const matchesEmp = (ord.assignedEmployeeName || '').toLowerCase().includes(term);
        const matchesSpecs = (ord.gemstoneSpecs || '').toLowerCase().includes(term);

        if (!matchesNum && !matchesCust && !matchesPhone && !matchesItem && !matchesWs && !matchesEmp && !matchesSpecs) {
          return false;
        }
      }

      return true;
    });
  }, [orders, dateFrom, dateTo, statusFilter, selectedWorkshop, selectedEmployee, searchTerm]);

  // Aggregate Metrics
  const totalOrdersCount = filteredOrders.length;
  const completedOrders = filteredOrders.filter((o) => o.status === 'Completed');
  const pendingOrProgressOrders = filteredOrders.filter(
    (o) => o.status === 'Pending' || o.status === 'Sent to Workshop' || o.status === 'In Progress'
  );
  const cancelledOrders = filteredOrders.filter((o) => o.status === 'Cancelled');

  const totalAgreedRevenue = filteredOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.agreedPriceToCustomer, 0);

  const totalMakingCost = filteredOrders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.estimatedMakingCost, 0);

  const totalCustomerAdvance = filteredOrders.reduce((sum, o) => sum + o.advancePaidByCustomer, 0);
  const totalWorkshopAdvance = filteredOrders.reduce((sum, o) => sum + o.advancePaidToWorkshop, 0);
  const balanceMakingChargesDue = Math.max(0, totalMakingCost - totalWorkshopAdvance);

  const totalGoldWeight = filteredOrders.reduce((sum, o) => sum + (o.estimatedGoldWeight || 0), 0);

  // Status Distribution Data for Pie Chart
  const statusChartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach((o) => {
      map.set(o.status, (map.get(o.status) || 0) + 1);
    });
    return Array.from(map.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredOrders]);

  // Workshop Distribution Data for Bar Chart
  const workshopChartData = useMemo(() => {
    const map = new Map<string, { workshop: string; total: number; completed: number }>();
    filteredOrders.forEach((o) => {
      const name = o.workshopName.split(' ')[0] || 'Workshop';
      if (!map.has(o.workshopId)) {
        map.set(o.workshopId, { workshop: name, total: 0, completed: 0 });
      }
      const e = map.get(o.workshopId)!;
      e.total += 1;
      if (o.status === 'Completed') e.completed += 1;
    });
    return Array.from(map.values());
  }, [filteredOrders]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Order #',
      'Order Date',
      'Delivery Due Date',
      'Status',
      'Customer Name',
      'Customer Phone',
      'Jewelry Item Name',
      'Jewelry Type',
      'Metal Purity',
      'Est Gold Weight (g)',
      'Gemstone Specs',
      'Workshop Name',
      'Assigned Artisan',
      'Agreed Price (LKR)',
      'Cust Advance (LKR)',
      'Making Cost (LKR)',
      'Workshop Adv Paid (LKR)',
      'Making Balance Due (LKR)',
      'Completion Date',
      'Workshop Notes / Remarks',
    ];
    const rows = filteredOrders.map((o) => [
      o.orderNumber,
      o.orderDate,
      o.requiredDeliveryDate,
      o.status,
      o.customerName,
      o.customerPhone,
      o.itemName,
      o.jewelryType,
      o.metalPurity,
      o.estimatedGoldWeight,
      o.gemstoneSpecs,
      o.workshopName,
      o.assignedEmployeeName || 'Unassigned',
      o.agreedPriceToCustomer,
      o.advancePaidByCustomer,
      o.estimatedMakingCost,
      o.advancePaidToWorkshop,
      Math.max(0, o.estimatedMakingCost - o.advancePaidToWorkshop),
      o.actualCompletionDate || 'N/A',
      o.status === 'Cancelled' ? `CANCELLED: ${o.cancellationReason || ''}` : o.workshopNotes || '',
    ]);

    exportToCsv(`Workshop_Orders_${statusFilter}_Report`, headers, rows);
  };

  // Print A4 Statement
  const handlePrintReport = () => {
    const headers = [
      'Order # / Item',
      'Order Date',
      'Customer',
      'Workshop & Artisan',
      'Gold (g)',
      'Making Cost',
      'Adv Paid',
      'Status',
    ];
    const rows = filteredOrders.map((o) => [
      `${o.orderNumber}\n${o.itemName}`,
      o.orderDate,
      o.customerName,
      `${o.workshopName}${o.assignedEmployeeName ? ` (${o.assignedEmployeeName})` : ''}`,
      `${o.estimatedGoldWeight}g (${o.metalPurity})`,
      formatCurrency(o.estimatedMakingCost),
      formatCurrency(o.advancePaidToWorkshop),
      o.status,
    ]);

    const totalsRow = [
      'TOTALS',
      `${filteredOrders.length} Orders`,
      '-',
      '-',
      `${totalGoldWeight.toFixed(2)} g`,
      formatCurrency(totalMakingCost),
      formatCurrency(totalWorkshopAdvance),
      `${completedOrders.length} Completed / ${cancelledOrders.length} Cancelled`,
    ];

    setActivePrintReport({
      type: 'workshop_orders_report',
      title: `Workshop Custom Orders Audit (${statusFilter === 'ALL' ? 'All Statuses' : statusFilter})`,
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Total Orders', value: `${totalOrdersCount}` },
        { label: 'Completed', value: `${completedOrders.length}` },
        { label: 'In Progress / Pending', value: `${pendingOrProgressOrders.length}` },
        { label: 'Total Making Cost', value: formatCurrency(totalMakingCost) },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Official workshop production and craft labor auditing report. Gold allocations and advances cross-verified.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders Card */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Workshop Orders
            </span>
            <Hammer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white mt-1">
            {totalOrdersCount} <span className="text-xs text-gray-400 font-normal">Jobs</span>
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px]">
            <span className="text-emerald-400 font-bold">{completedOrders.length} done</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400 font-bold">{pendingOrProgressOrders.length} active</span>
            <span className="text-gray-500">•</span>
            <span className="text-rose-400 font-bold">{cancelledOrders.length} cancelled</span>
          </div>
        </div>

        {/* Total Making Costs & Advances */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Making Charges
            </span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 mt-1">
            {formatCurrency(totalMakingCost)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Adv Paid: <span className="text-white font-mono">{formatCurrency(totalWorkshopAdvance)}</span> • Due: <span className="text-amber-400 font-mono">{formatCurrency(balanceMakingChargesDue)}</span>
          </p>
        </div>

        {/* Customer Agreed Value */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Customer Order Value
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalAgreedRevenue)}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Cust Advance Held: <span className="text-emerald-400 font-mono">{formatCurrency(totalCustomerAdvance)}</span>
          </p>
        </div>

        {/* Gold Weight Handled */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Gold Weight in Craft
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 mt-1">
            {totalGoldWeight.toFixed(2)} <span className="text-sm text-gray-300 font-normal">grams</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Across {workshops.length} Partner Workshops
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Distribution Pie */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Order Status Distribution</span>
            <span className="text-[10px] text-gray-400 font-normal">By Volume</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  innerRadius={35}
                  paddingAngle={3}
                >
                  {statusChartData.map((entry) => (
                    <Cell
                      key={`cell-${entry.status}`}
                      fill={STATUS_COLORS[entry.status] || '#94A3B8'}
                    />
                  ))}
                </Pie>
                <Tooltip
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
          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[#232936] text-[10px]">
            {statusChartData.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[s.status] || '#94A3B8' }}
                />
                <span className="text-gray-300 truncate">{s.status}:</span>
                <span className="font-bold text-white">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Workshop Load Breakdown */}
        <div className="lg:col-span-2 bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Workshop Production Output</span>
            <span className="text-[10px] text-gray-400 font-normal">Active vs Completed Jobs</span>
          </h4>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workshopChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="workshop" stroke="#6B7280" fontSize={11} />
                <YAxis stroke="#6B7280" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1115',
                    borderColor: '#232936',
                    fontSize: '11px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="total" name="Total Allocated" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed & Delivered" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#232936] text-[11px] text-gray-400">
            <span>Blue: Total Orders Assigned</span>
            <span>Green: Finished & Delivered Orders</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="space-y-3 bg-[#151921] border border-[#232936] p-4 rounded-2xl">
        {/* Status Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Orders', count: orders.length },
            { id: 'Completed', label: 'Completed Orders', count: orders.filter((o) => o.status === 'Completed').length, color: 'text-emerald-400' },
            { id: 'In Progress', label: 'In Progress', count: orders.filter((o) => o.status === 'In Progress').length, color: 'text-amber-400' },
            { id: 'Pending', label: 'Pending / Queued', count: orders.filter((o) => o.status === 'Pending' || o.status === 'Sent to Workshop').length, color: 'text-blue-400' },
            { id: 'Cancelled', label: 'Cancelled Orders', count: orders.filter((o) => o.status === 'Cancelled').length, color: 'text-rose-400' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                  : 'bg-[#0F1115] text-gray-300 hover:text-white border border-[#232936]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  statusFilter === tab.id ? 'bg-black/20 text-slate-950 font-bold' : 'bg-[#151921] text-gray-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#232936]">
          <div className="flex items-center gap-2 flex-1 max-w-xl flex-wrap">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, customer, item, gems or craftsman..."
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

            {/* Employee Dropdown */}
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Artisans</option>
              {workshopEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.role})
                </option>
              ))}
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
              Print A4 Orders Statement
            </button>
          </div>
        </div>
      </div>

      {/* Orders Itemized Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer & Contact</th>
                <th className="py-3 px-4">Custom Jewelry Item</th>
                <th className="py-3 px-4">Gold & Gem Specs</th>
                <th className="py-3 px-4">Workshop & Artisan</th>
                <th className="py-3 px-4 text-right">Making Cost</th>
                <th className="py-3 px-4 text-right">Adv Paid</th>
                <th className="py-3 px-4 text-center">Dates</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">
                    No workshop orders match the specified filters or date period.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isCompleted = ord.status === 'Completed';
                  const isCancelled = ord.status === 'Cancelled';
                  const makingBalance = Math.max(0, ord.estimatedMakingCost - ord.advancePaidToWorkshop);

                  return (
                    <tr key={ord.id} className="hover:bg-[#1A202C] transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{ord.customerName}</div>
                        <div className="text-[10px] text-gray-400 font-mono">{ord.customerPhone}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="font-semibold text-white truncate" title={ord.itemName}>
                          {ord.itemName}
                        </div>
                        <div className="text-[10px] text-gray-400">{ord.jewelryType}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[180px]">
                        <div className="text-amber-300 font-medium">
                          {ord.estimatedGoldWeight}g • {ord.metalPurity}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate" title={ord.gemstoneSpecs}>
                          {ord.gemstoneSpecs || 'No gems'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{ord.workshopName}</div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-400" />
                          {ord.assignedEmployeeName || 'Unassigned'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400">
                        {formatCurrency(ord.estimatedMakingCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-gray-300">
                        <div>{formatCurrency(ord.advancePaidToWorkshop)}</div>
                        {makingBalance > 0 && (
                          <div className="text-[10px] text-amber-400">Due: {formatCurrency(makingBalance)}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[11px] font-mono">
                        <div className="text-gray-300">Order: {ord.orderDate}</div>
                        <div className="text-amber-400 font-semibold">Due: {ord.requiredDeliveryDate}</div>
                        {ord.actualCompletionDate && (
                          <div className="text-emerald-400 font-bold">Done: {ord.actualCompletionDate}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1"
                          style={{
                            backgroundColor: `${STATUS_COLORS[ord.status] || '#94A3B8'}20`,
                            color: STATUS_COLORS[ord.status] || '#94A3B8',
                            border: `1px solid ${STATUS_COLORS[ord.status] || '#94A3B8'}40`,
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderDetails(ord)}
                          className="p-1.5 bg-[#1E2430] hover:bg-amber-500 hover:text-slate-950 text-gray-300 rounded-lg transition"
                          title="View Order Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Order Detail Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151921] border border-[#232936] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-[#232936] pb-3">
              <div>
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Workshop Custom Job Spec Sheet
                </span>
                <h3 className="text-lg font-black text-white">{selectedOrderDetails.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="p-1.5 bg-[#0F1115] hover:bg-[#232936] text-gray-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#0F1115] p-3 rounded-xl border border-[#232936] space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Customer Information</span>
                <div className="font-bold text-white text-sm">{selectedOrderDetails.customerName}</div>
                <div className="text-gray-300">Phone: {selectedOrderDetails.customerPhone}</div>
                <div className="text-gray-400">Order Date: {selectedOrderDetails.orderDate}</div>
                <div className="text-amber-400 font-bold">Delivery Due: {selectedOrderDetails.requiredDeliveryDate}</div>
              </div>

              <div className="bg-[#0F1115] p-3 rounded-xl border border-[#232936] space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Workshop & Craft Labor</span>
                <div className="font-bold text-white text-sm">{selectedOrderDetails.workshopName}</div>
                <div className="text-gray-300">
                  Assigned Goldsmith: <span className="text-amber-400 font-bold">{selectedOrderDetails.assignedEmployeeName || 'Unassigned'}</span>
                </div>
                <div className="text-gray-400">Estimated Making Cost: {formatCurrency(selectedOrderDetails.estimatedMakingCost)}</div>
                <div className="text-emerald-400 font-bold">Advance Paid: {formatCurrency(selectedOrderDetails.advancePaidToWorkshop)}</div>
              </div>
            </div>

            <div className="bg-[#0F1115] p-4 rounded-xl border border-[#232936] space-y-2 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Jewelry Design & Material Specifications</span>
              <div className="font-bold text-white text-sm">{selectedOrderDetails.itemName}</div>
              <p className="text-gray-300 leading-relaxed">{selectedOrderDetails.designDescription}</p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#232936] text-[11px]">
                <div>
                  <span className="text-gray-400">Gold Alloy / Purity:</span>{' '}
                  <span className="text-amber-300 font-bold">{selectedOrderDetails.metalPurity}</span>
                </div>
                <div>
                  <span className="text-gray-400">Estimated Gold Weight:</span>{' '}
                  <span className="text-white font-bold">{selectedOrderDetails.estimatedGoldWeight} g</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400">Gemstone Details:</span>{' '}
                  <span className="text-cyan-300 font-semibold">{selectedOrderDetails.gemstoneSpecs}</span>
                </div>
              </div>
            </div>

            {selectedOrderDetails.status === 'Cancelled' ? (
              <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs text-rose-300">
                <span className="font-bold uppercase text-[10px] block text-rose-400">Cancellation Reason:</span>
                {selectedOrderDetails.cancellationReason || 'No reason specified'}
              </div>
            ) : selectedOrderDetails.workshopNotes ? (
              <div className="bg-[#0F1115] border border-[#232936] p-3 rounded-xl text-xs text-gray-300">
                <span className="font-bold uppercase text-[10px] block text-gray-400">Workshop Log & Notes:</span>
                {selectedOrderDetails.workshopNotes}
              </div>
            ) : null}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition"
              >
                Close Spec Sheet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
