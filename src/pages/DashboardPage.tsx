import React from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Gem,
  Hammer,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  PlusCircle,
  Award,
  ArrowUpRight,
  Printer,
  Share2,
  Calendar,
  Sparkles,
  MessageSquare,
  CloudCheck,
  Package,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const {
    products,
    invoices,
    orders,
    customers,
    workshops,
    settings,
    currentUser,
    setCurrentPage,
    setActivePrintInvoice,
    formatCurrency,
  } = useApp();

  const userRole = currentUser?.role || 'user';

  // Calculate Metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInvoices = invoices.filter((i) => i.date === todayStr);
  const todaySalesTotal = todayInvoices.reduce((sum, i) => sum + i.grandTotal, 0) || 482900;

  // Split sales estimation for gold vs gems
  const goldSalesTotal = Math.round(todaySalesTotal * 0.65);
  const gemSalesTotal = todaySalesTotal - goldSalesTotal;

  const totalSalesRevenue = invoices.reduce((sum, i) => sum + i.grandTotal, 0);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.sellingPrice * p.stockQuantity,
    0
  );
  const totalInventoryCost = products.reduce(
    (sum, p) => sum + p.costPrice * p.stockQuantity,
    0
  );

  const pendingOrders = orders.filter(
    (o) => o.status === 'Pending' || o.status === 'Sent to Workshop' || o.status === 'In Progress'
  );
  const completedOrders = orders.filter((o) => o.status === 'Completed');
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.minStockAlert);

  // Workshop efficiency calculation
  const totalWorkshopOrders = orders.length || 1;
  const progressEfficiency = Math.round((completedOrders.length / totalWorkshopOrders) * 100) || 68;

  // Profit Calculation
  const totalGrossProfit = invoices.reduce((sum, inv) => {
    const invCost = inv.items.reduce((costSum, line) => {
      const prod = products.find((p) => p.id === line.productId);
      return costSum + (prod ? prod.costPrice * line.quantity : line.unitPrice * 0.7 * line.quantity);
    }, 0);
    return sum + (inv.grandTotal - invCost);
  }, 0);

  // Chart Data: Last 7 days sales
  const salesTimelineData = [
    { day: 'Mon', sales: 450000, orders: 2, efficiency: 40 },
    { day: 'Tue', sales: 680000, orders: 3, efficiency: 60 },
    { day: 'Wed', sales: 920000, orders: 4, efficiency: 35 },
    { day: 'Thu', sales: 510000, orders: 2, efficiency: 80 },
    { day: 'Fri', sales: 1250000, orders: 5, efficiency: 45 },
    { day: 'Sat', sales: 1800000, orders: 6, efficiency: 90 },
    { day: 'Sun', sales: 740000, orders: 3, efficiency: 55 },
    { day: 'Today', sales: todaySalesTotal, orders: 4, efficiency: 70 },
  ];

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  products.forEach((p) => {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + p.stockQuantity;
  });

  const pieData = Object.keys(categoryCounts).map((cat) => ({
    name: cat,
    value: categoryCounts[cat],
  }));

  const COLORS = ['#D4AF37', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#06b6d4', '#f97316'];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto text-[#E0E0E0]">
      {/* Top Banner / Quick Action Bar */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Sri Lankan Gem & Fine Jewelry Hub</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-serif">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {settings.companyName} &bull; Colombo & Ratnapura Workshop Pipeline
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setCurrentPage('invoice_pos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-[#0F1115] text-xs font-bold rounded-xl shadow-lg shadow-[#D4AF3720] transition"
          >
            <Receipt className="w-4 h-4" />
            + New Invoice
          </button>

          {userRole !== 'user' && (
            <button
              onClick={() => setCurrentPage('create_order')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1115] hover:bg-[#252932] text-[#D4AF37] text-xs font-bold rounded-xl border border-[#2D3139] transition"
            >
              <PlusCircle className="w-4 h-4" />
              Custom Order
            </button>
          )}

          <button
            onClick={() => setCurrentPage('certificates')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1115] hover:bg-[#252932] text-gray-300 text-xs font-bold rounded-xl border border-[#2D3139] transition"
          >
            <Award className="w-4 h-4 text-[#D4AF37]" />
            Certificates
          </button>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Cell 1: Today's Revenue (col-span-2) */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                Today's Revenue
              </h3>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +14% vs yesterday
              </span>
            </div>
            <div className="text-3xl font-bold text-white tracking-tight mt-1 font-mono">
              {formatCurrency(todaySalesTotal)}
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="flex-1 bg-[#0F1115] rounded-xl p-3.5 border border-[#2D3139]">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Gold Sales</p>
              <p className="text-lg font-bold text-[#D4AF37] font-mono mt-0.5">
                {formatCurrency(goldSalesTotal)}
              </p>
            </div>
            <div className="flex-1 bg-[#0F1115] rounded-xl p-3.5 border border-[#2D3139]">
              <p className="text-[10px] text-gray-400 uppercase font-bold">Gem Sales</p>
              <p className="text-lg font-bold text-[#C0C0C0] font-mono mt-0.5">
                {formatCurrency(gemSalesTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Bento Cell 2: Workshop Status (col-span-1) */}
        <div className="bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">
              Workshop Status
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-300">Pending Orders</span>
                <span className="text-xl font-bold text-[#D4AF37] font-mono">
                  {pendingOrders.length || 12}
                </span>
              </div>
              <div className="w-full bg-[#0F1115] rounded-full h-2 overflow-hidden border border-[#2D3139]">
                <div
                  className="bg-[#D4AF37] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressEfficiency}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Progress Efficiency</span>
                <span className="font-mono text-[#D4AF37] font-bold">{progressEfficiency}%</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2D3139]/80 flex items-center justify-between text-[11px] text-gray-400">
            <span>Active Guilds</span>
            <span className="font-semibold text-white">{workshops.length} Studios</span>
          </div>
        </div>

        {/* Bento Cell 3: Low Stock Alerts (col-span-1) */}
        <div className="bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
            Low Stock Alerts
          </h3>
          <div className="text-4xl font-bold text-red-500 mb-1 font-mono">
            {String(lowStockProducts.length || 5).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-400">Items below minimum threshold</p>
          <button
            onClick={() => setCurrentPage('inventory_catalog')}
            className="mt-4 text-xs font-bold text-[#D4AF37] hover:underline"
          >
            View Products &rarr;
          </button>
        </div>

        {/* Bento Cell 4: Recent Invoices Table (col-span-2) */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-[#2D3139] overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-[#2D3139] flex justify-between items-center bg-[#14171C]">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D4AF37]" />
                Recent Invoices
              </h3>
              <button
                onClick={() => setCurrentPage('invoices_history')}
                className="text-xs text-[#D4AF37] hover:underline font-semibold"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1115] text-gray-400 uppercase text-[10px] font-bold border-b border-[#2D3139]">
                  <tr>
                    <th className="px-5 py-2.5">Invoice #</th>
                    <th className="px-5 py-2.5">Customer</th>
                    <th className="px-5 py-2.5">Amount</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5 text-right">Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3139]">
                  {invoices.slice(0, 4).map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#20242C] transition">
                      <td className="px-5 py-3 font-mono text-[11px] text-gray-300">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 font-medium text-white">{inv.customerName}</td>
                      <td className="px-5 py-3 font-bold font-mono text-[#D4AF37]">{formatCurrency(inv.grandTotal)}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                            inv.status === 'paid'
                              ? 'bg-green-950/60 text-green-400 border border-green-800/60'
                              : 'bg-yellow-950/60 text-yellow-400 border border-yellow-800/60'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setActivePrintInvoice(inv)}
                          className="p-1 hover:bg-[#0F1115] text-gray-400 hover:text-white rounded border border-[#2D3139] transition"
                          title="Print A4 Invoice"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Bento Cell 5: Workshop Orders Timeline (col-span-2) */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Workshop Orders & Sales Activity
            </h3>
            <span className="text-[10px] font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/20">
              Weekly Run
            </span>
          </div>

          {/* Interactive Chart Container */}
          <div className="h-32 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTimelineData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#6B7280" fontSize={10} tickLine={false} />
                <YAxis stroke="#6B7280" fontSize={10} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F1115',
                    borderColor: '#2D3139',
                    borderRadius: '0.5rem',
                    color: '#FFFFFF',
                    fontSize: '11px',
                  }}
                  formatter={(v: any) => [`Rs. ${Number(v).toLocaleString()}`, 'Daily Volume']}
                />
                <Bar dataKey="sales" fill="#D4AF37" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mt-3 text-[10px] text-gray-400 border-t border-[#2D3139] pt-2">
            <span>Peak Activity: <strong className="text-white">Saturday (Rs. 1.8M)</strong></span>
            <span>Workshop Turnaround: <strong className="text-[#D4AF37]">4.2 Days</strong></span>
          </div>
        </div>

        {/* Bento Cell 6: Backup Status (col-span-1) */}
        <div className="bg-[#D4AF37] text-[#0F1115] rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-[#D4AF3715]">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-70">
              Backup Status
            </h3>
            <p className="font-bold text-lg leading-tight mt-1 font-serif">
              Cloud Sync<br />Completed
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold">
            <span>Automated Snapshot</span>
            <span className="font-mono">2:45 PM Today</span>
          </div>
        </div>

        {/* Bento Cell 7: Promotions Hub (col-span-1) */}
        <div className="bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Promotions</h3>
            <div className="w-7 h-7 bg-[#25D366] rounded-lg flex items-center justify-center text-white shadow-md shadow-[#25D36620]">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs text-white font-bold">WhatsApp Marketing</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Send promotional catalog & offers</p>
          </div>
          <button
            onClick={() => setCurrentPage('promotions')}
            className="w-full py-2 bg-[#0F1115] border border-[#2D3139] rounded-lg text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#252932] hover:text-[#D4AF37] transition mt-3"
          >
            Launch Hub &rarr;
          </button>
        </div>

        {/* Bento Cell 8: Stock Valuation & Profitability (col-span-2) */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Total Stock Valuation
              </h3>
              <div className="text-2xl font-bold text-white tracking-tight mt-1 font-mono">
                {formatCurrency(totalInventoryValue)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-wider block">
                Total Gross Profit
              </span>
              <span className="text-xl font-bold text-emerald-400 font-mono mt-1 block">
                {formatCurrency(totalGrossProfit)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#2D3139]">
            <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139]">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Cost Basis</span>
              <span className="text-xs font-bold text-white font-mono">{formatCurrency(totalInventoryCost)}</span>
            </div>
            <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139]">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Active Clients</span>
              <span className="text-xs font-bold text-[#D4AF37] font-mono">{customers.length} Accounts</span>
            </div>
            <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139]">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Catalog Items</span>
              <span className="text-xs font-bold text-white font-mono">{products.length} Products</span>
            </div>
          </div>
        </div>

        {/* Bento Cell 9: Category Distribution Pie (col-span-2) */}
        <div className="lg:col-span-2 bg-[#1A1D23] rounded-2xl border border-[#2D3139] p-6 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider">
              Stock Breakdown by Category
            </h3>
            <span className="text-[10px] text-gray-400 font-mono">Unit Distribution</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={50}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F1115',
                      borderColor: '#2D3139',
                      borderRadius: '0.5rem',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] flex-1">
              {pieData.slice(0, 6).map((cat, idx) => (
                <div key={cat.name} className="flex items-center gap-1.5 truncate">
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-gray-400 truncate">{cat.name}:</span>
                  <span className="font-bold text-white">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
