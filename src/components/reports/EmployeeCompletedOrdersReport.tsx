import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { exportToCsv, isWithinDateRange } from '../../utils/reportUtils';
import { JewelryOrder, WorkshopEmployee } from '../../types';
import {
  Award,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Sparkles,
  Hammer,
  Clock,
  TrendingUp,
  UserCheck,
  Building2,
  Calendar,
  Layers,
  ChevronRight,
  Eye,
  X,
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

interface EmployeeCompletedOrdersReportProps {
  dateFrom: string;
  dateTo: string;
}

const ARTISAN_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

export const EmployeeCompletedOrdersReport: React.FC<EmployeeCompletedOrdersReportProps> = ({
  dateFrom,
  dateTo,
}) => {
  const { orders, workshopEmployees, workshops, formatCurrency, setActivePrintReport } = useApp();

  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [selectedWorkshop, setSelectedWorkshop] = useState<string>('ALL');
  const [selectedJewelryType, setSelectedJewelryType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<JewelryOrder | null>(null);

  // Completed Orders within Date Range
  const completedOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (ord.status !== 'Completed') return false;

      // Filter by completion date if present, otherwise orderDate
      const compDate = ord.actualCompletionDate || ord.orderDate;
      if (!isWithinDateRange(compDate, dateFrom, dateTo)) return false;

      // Workshop filter
      if (selectedWorkshop !== 'ALL' && ord.workshopId !== selectedWorkshop) return false;

      // Employee filter
      if (selectedEmployee !== 'ALL' && ord.assignedEmployeeId !== selectedEmployee) return false;

      // Jewelry Type
      if (selectedJewelryType !== 'ALL' && ord.jewelryType !== selectedJewelryType) return false;

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesNum = ord.orderNumber.toLowerCase().includes(term);
        const matchesEmp = (ord.assignedEmployeeName || '').toLowerCase().includes(term);
        const matchesCust = ord.customerName.toLowerCase().includes(term);
        const matchesItem = ord.itemName.toLowerCase().includes(term);
        const matchesWs = ord.workshopName.toLowerCase().includes(term);
        if (!matchesNum && !matchesEmp && !matchesCust && !matchesItem && !matchesWs) return false;
      }

      return true;
    });
  }, [orders, dateFrom, dateTo, selectedWorkshop, selectedEmployee, selectedJewelryType, searchTerm]);

  // Aggregate Artisan Performance Metrics
  const artisanStats = useMemo(() => {
    const map = new Map<
      string,
      {
        employeeId: string;
        employeeName: string;
        workshopName: string;
        role: string;
        completedCount: number;
        totalMakingCharges: number;
        totalGoldWeight: number;
        ordersList: JewelryOrder[];
      }
    >();

    // Initialize map with all known employees
    workshopEmployees.forEach((emp) => {
      if (selectedWorkshop === 'ALL' || emp.workshopId === selectedWorkshop) {
        map.set(emp.id, {
          employeeId: emp.id,
          employeeName: emp.name,
          workshopName: emp.workshopName,
          role: emp.role,
          completedCount: 0,
          totalMakingCharges: 0,
          totalGoldWeight: 0,
          ordersList: [],
        });
      }
    });

    // Tally completed orders
    completedOrders.forEach((ord) => {
      const empId = ord.assignedEmployeeId || 'unassigned';
      if (!map.has(empId)) {
        map.set(empId, {
          employeeId: empId,
          employeeName: ord.assignedEmployeeName || 'Unassigned Master Goldsmith',
          workshopName: ord.workshopName,
          role: 'Artisan',
          completedCount: 0,
          totalMakingCharges: 0,
          totalGoldWeight: 0,
          ordersList: [],
        });
      }

      const stat = map.get(empId)!;
      stat.completedCount += 1;
      stat.totalMakingCharges += ord.estimatedMakingCost;
      stat.totalGoldWeight += ord.estimatedGoldWeight || 0;
      stat.ordersList.push(ord);
    });

    return Array.from(map.values()).sort((a, b) => b.completedCount - a.completedCount);
  }, [workshopEmployees, completedOrders, selectedWorkshop]);

  // Summary Metrics
  const totalCompletedOrders = completedOrders.length;
  const totalMakingValueCompleted = completedOrders.reduce((sum, o) => sum + o.estimatedMakingCost, 0);
  const totalGoldWeightCrafted = completedOrders.reduce((sum, o) => sum + (o.estimatedGoldWeight || 0), 0);
  const topArtisan = artisanStats.length > 0 && artisanStats[0].completedCount > 0 ? artisanStats[0] : null;

  // Chart Data for Leaderboard
  const artisanLeaderboardChartData = useMemo(() => {
    return artisanStats
      .filter((a) => a.completedCount > 0)
      .map((a) => ({
        name: a.employeeName.split(' ')[0] || a.employeeName,
        completed: a.completedCount,
        makingCharges: a.totalMakingCharges,
      }));
  }, [artisanStats]);

  // Distinct Jewelry Categories in Completed Orders
  const categoryTypes = useMemo(() => {
    const set = new Set<string>();
    orders.filter((o) => o.status === 'Completed').forEach((o) => set.add(o.jewelryType));
    return Array.from(set);
  }, [orders]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'Order #',
      'Completion Date',
      'Artisan / Employee Name',
      'Workshop Name',
      'Customer Name',
      'Customer Phone',
      'Jewelry Item Name',
      'Jewelry Type',
      'Gold Purity',
      'Gold Weight (g)',
      'Gemstone Specs',
      'Making Charges Earned (LKR)',
      'Agreed Price (LKR)',
      'Turnaround Status',
      'Workshop Notes',
    ];
    const rows = completedOrders.map((o) => [
      o.orderNumber,
      o.actualCompletionDate || o.orderDate,
      o.assignedEmployeeName || 'Unassigned',
      o.workshopName,
      o.customerName,
      o.customerPhone,
      o.itemName,
      o.jewelryType,
      o.metalPurity,
      o.estimatedGoldWeight,
      o.gemstoneSpecs,
      o.estimatedMakingCost,
      o.agreedPriceToCustomer,
      o.actualCompletionDate && o.actualCompletionDate <= o.requiredDeliveryDate
        ? 'Delivered On-Time'
        : 'Delivered',
      o.workshopNotes || '',
    ]);

    exportToCsv('Employees_By_Completed_Work_Orders_Report', headers, rows);
  };

  // Print A4 Statement
  const handlePrintReport = () => {
    const headers = [
      'Order # / Item',
      'Completed Date',
      'Artisan Name & Role',
      'Workshop',
      'Gold & Purity',
      'Making Charge',
      'Status',
    ];
    const rows = completedOrders.map((o) => [
      `${o.orderNumber}\n${o.itemName}`,
      o.actualCompletionDate || o.orderDate,
      o.assignedEmployeeName || 'Staff Artisan',
      o.workshopName,
      `${o.estimatedGoldWeight}g (${o.metalPurity})`,
      formatCurrency(o.estimatedMakingCost),
      'Completed & Inspected',
    ]);
    const totalsRow = [
      'TOTAL COMPLETED',
      `${completedOrders.length} Custom Jobs`,
      '-',
      '-',
      `${totalGoldWeightCrafted.toFixed(2)} g`,
      formatCurrency(totalMakingValueCompleted),
      '100% Quality Passed',
    ];

    setActivePrintReport({
      type: 'artisan_completed_orders_report',
      title: 'Artisans & Goldsmiths Completed Work Orders & Productivity Statement',
      dateRange: `${dateFrom} to ${dateTo}`,
      summaryCards: [
        { label: 'Completed Jobs', value: `${totalCompletedOrders}` },
        { label: 'Total Gold Crafted', value: `${totalGoldWeightCrafted.toFixed(2)} g` },
        { label: 'Total Making Value', value: formatCurrency(totalMakingValueCompleted) },
        { label: 'Top Artisan', value: topArtisan ? topArtisan.employeeName : 'N/A' },
      ],
      headers,
      rows,
      totalsRow,
      notes: 'Official goldsmith performance and custom craftsmanship completion register. Verified by Head Gemologist.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Completed Jobs */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Completed Custom Jobs
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {totalCompletedOrders} <span className="text-xs text-gray-400 font-normal">Pieces</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            100% Inspected & Hallmarked
          </p>
        </div>

        {/* Total Making Value */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Craft Labor Value Generated
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-white mt-1">
            {formatCurrency(totalMakingValueCompleted)}
          </p>
          <p className="text-[11px] text-emerald-400 mt-0.5">
            Earned by partner artisans
          </p>
        </div>

        {/* Gold Weight Crafted */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Total Gold Crafted
            </span>
            <Hammer className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 mt-1">
            {totalGoldWeightCrafted.toFixed(2)} <span className="text-sm text-gray-300 font-normal">grams</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Alloyed, cast & polished
          </p>
        </div>

        {/* Top Goldsmith Performer */}
        <div className="bg-[#151921] border border-[#232936] rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Top Artisan Performer
            </span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-base font-black text-white mt-1 truncate">
            {topArtisan ? topArtisan.employeeName : 'N/A'}
          </p>
          <p className="text-[11px] text-amber-400 mt-0.5">
            {topArtisan ? `${topArtisan.completedCount} Completed (${formatCurrency(topArtisan.totalMakingCharges)})` : '0 Jobs'}
          </p>
        </div>
      </div>

      {/* Artisan Leaderboard Cards */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl p-5 shadow-xl space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-[#232936] pb-2">
          <span className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            Craftsmen Productivity & Completed Work Orders Leaderboard
          </span>
          <span className="text-gray-400 font-mono text-[11px]">Ranked by Completed Volume</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {artisanStats.map((stat, idx) => (
            <div
              key={stat.employeeId}
              onClick={() => setSelectedEmployee(selectedEmployee === stat.employeeId ? 'ALL' : stat.employeeId)}
              className={`p-4 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                selectedEmployee === stat.employeeId
                  ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                  : 'bg-[#0F1115] border-[#232936] hover:border-gray-600'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div>
                      <div className="font-bold text-white text-xs">{stat.employeeName}</div>
                      <div className="text-[10px] text-gray-400">{stat.role} • {stat.workshopName.split(' ')[0]}</div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {stat.completedCount} Done
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-[#232936] text-[11px]">
                  <div>
                    <span className="text-gray-400 text-[10px] block">Labor Charges:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {formatCurrency(stat.totalMakingCharges)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[10px] block">Gold Crafted:</span>
                    <span className="font-mono font-bold text-amber-400">
                      {stat.totalGoldWeight.toFixed(1)} g
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-2 text-[10px] text-right text-gray-500 hover:text-amber-400 transition">
                {selectedEmployee === stat.employeeId ? '✓ Filter Active' : 'Click to filter orders →'}
              </div>
            </div>
          ))}
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
              placeholder="Search by order #, artisan, item, customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
            />
          </div>

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

          {/* Jewelry Type */}
          <select
            value={selectedJewelryType}
            onChange={(e) => setSelectedJewelryType(e.target.value)}
            className="px-2.5 py-1.5 bg-[#0F1115] border border-[#232936] rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="ALL">All Jewelry Types</option>
            {categoryTypes.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
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
            Print Productivity Statement
          </button>
        </div>
      </div>

      {/* Itemized Completed Orders Table */}
      <div className="bg-[#151921] border border-[#232936] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0F1115] text-gray-400 font-semibold border-b border-[#232936]">
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Artisan Name</th>
                <th className="py-3 px-4">Workshop</th>
                <th className="py-3 px-4">Custom Jewelry Item</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Gold & Gem Specs</th>
                <th className="py-3 px-4 text-right">Making Cost</th>
                <th className="py-3 px-4 text-center">Completed Date</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#232936]">
              {completedOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500">
                    No completed work orders match the chosen artisan or date filters.
                  </td>
                </tr>
              ) : (
                completedOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#1A202C] transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {ord.orderNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                        {ord.assignedEmployeeName || 'Unassigned'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300">{ord.workshopName}</td>
                    <td className="py-3.5 px-4 max-w-[200px]">
                      <div className="font-semibold text-white truncate" title={ord.itemName}>
                        {ord.itemName}
                      </div>
                      <div className="text-[10px] text-gray-400">{ord.jewelryType}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-gray-200 font-medium">{ord.customerName}</div>
                      <div className="text-[10px] text-gray-400 font-mono">{ord.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[160px]">
                      <div className="text-amber-300 font-medium">
                        {ord.estimatedGoldWeight}g • {ord.metalPurity}
                      </div>
                      <div className="text-[10px] text-gray-400 truncate" title={ord.gemstoneSpecs}>
                        {ord.gemstoneSpecs || 'No gems'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-emerald-400">
                      {formatCurrency(ord.estimatedMakingCost)}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono text-[11px] text-emerald-400 font-bold">
                      {ord.actualCompletionDate || ord.orderDate}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrderDetails(ord)}
                        className="p-1.5 bg-[#1E2430] hover:bg-amber-500 hover:text-slate-950 text-gray-300 rounded-lg transition"
                        title="View Completed Order Specs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Completed Order Specs Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151921] border border-[#232936] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232936] pb-3">
              <div>
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                  Completed Custom Order Audit
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

            <div className="space-y-3 text-xs">
              <div className="bg-[#0F1115] p-3.5 rounded-xl border border-[#232936]">
                <div className="text-gray-400 text-[10px] uppercase font-bold">Craftsman & Workshop</div>
                <div className="text-white font-bold text-sm mt-0.5">{selectedOrderDetails.assignedEmployeeName || 'Master Goldsmith'}</div>
                <div className="text-amber-400 font-medium">{selectedOrderDetails.workshopName}</div>
                <div className="text-gray-400 mt-1">Labor Making Cost: <span className="text-emerald-400 font-mono font-bold">{formatCurrency(selectedOrderDetails.estimatedMakingCost)}</span></div>
              </div>

              <div className="bg-[#0F1115] p-3.5 rounded-xl border border-[#232936] space-y-1">
                <div className="text-gray-400 text-[10px] uppercase font-bold">Jewelry Item Crafted</div>
                <div className="text-white font-bold">{selectedOrderDetails.itemName}</div>
                <div className="text-gray-300">{selectedOrderDetails.designDescription}</div>
                <div className="text-amber-300 font-mono pt-1 text-[11px]">
                  {selectedOrderDetails.estimatedGoldWeight}g Gold ({selectedOrderDetails.metalPurity}) • {selectedOrderDetails.gemstoneSpecs}
                </div>
              </div>

              {selectedOrderDetails.workshopNotes && (
                <div className="bg-[#0F1115] p-3 rounded-xl border border-[#232936] text-gray-300">
                  <span className="font-bold uppercase text-[10px] block text-gray-400">Artisan Log Notes:</span>
                  {selectedOrderDetails.workshopNotes}
                </div>
              )}
            </div>

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
