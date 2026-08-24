import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  Building,
  Receipt,
  FileText,
  Printer,
  Eye,
  X,
  CheckCircle2,
  TrendingDown,
  Tag,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';
import { ImageUploadField } from '../components/common/ImageUploadField';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Electricity & Utilities',
  'Showroom Rent & Rates',
  'Workshop Consumables & Acids',
  'Gem Testing & Lab Fees',
  'Staff Wages & Meals',
  'Security & CCTV',
  'Marketing & Advertising',
  'Machinery & Tool Maintenance',
  'Office & Stationery',
  'Transportation & Fuel',
  'Insurance & Audit',
  'Miscellaneous Expenses',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash',
  'Bank Transfer',
  'Online / Card',
  'Cheque',
  'Other',
];

export const ExpensesPage: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    formatCurrency,
    currentUser,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'today' | 'this_year'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [voucherExpense, setVoucherExpense] = useState<Expense | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    expenseNumber: string;
    title: string;
    category: ExpenseCategory;
    amount: number | '';
    expenseDate: string;
    payeeName: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    receiptImageUrl: string;
    notes: string;
  }>({
    expenseNumber: '',
    title: '',
    category: 'Electricity & Utilities',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    payeeName: '',
    paymentMethod: 'Cash',
    referenceNumber: '',
    receiptImageUrl: '',
    notes: '',
  });

  const openAddModal = () => {
    const nextNum = `WCS-EXP-2026-${String(expenses.length + 1).padStart(4, '0')}`;
    setFormData({
      expenseNumber: nextNum,
      title: '',
      category: 'Electricity & Utilities',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      payeeName: '',
      paymentMethod: 'Cash',
      referenceNumber: '',
      receiptImageUrl: '',
      notes: '',
    });
    setEditingExpenseId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setFormData({
      expenseNumber: exp.expenseNumber,
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      expenseDate: exp.expenseDate,
      payeeName: exp.payeeName,
      paymentMethod: exp.paymentMethod,
      referenceNumber: exp.referenceNumber || '',
      receiptImageUrl: exp.receiptImageUrl || '',
      notes: exp.notes || '',
    });
    setEditingExpenseId(exp.id);
    setIsModalOpen(true);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please provide an expense title.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.payeeName.trim()) {
      alert('Please enter the payee/vendor name.');
      return;
    }

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        expenseNumber: formData.expenseNumber,
        title: formData.title.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        payeeName: formData.payeeName.trim(),
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber.trim() || undefined,
        receiptImageUrl: formData.receiptImageUrl || undefined,
        notes: formData.notes.trim() || undefined,
      });
    } else {
      addExpense({
        expenseNumber: formData.expenseNumber || `WCS-EXP-${Date.now().toString().slice(-4)}`,
        title: formData.title.trim(),
        category: formData.category,
        amount: Number(formData.amount),
        expenseDate: formData.expenseDate,
        payeeName: formData.payeeName.trim(),
        paymentMethod: formData.paymentMethod,
        referenceNumber: formData.referenceNumber.trim() || undefined,
        receiptImageUrl: formData.receiptImageUrl || undefined,
        notes: formData.notes.trim() || undefined,
        recordedBy: currentUser?.name || 'Saman Jayasinghe (Admin)',
      });
    }

    setIsModalOpen(false);
  };

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = todayStr.substring(0, 7);
    const thisYearStr = todayStr.substring(0, 4);

    return expenses.filter((exp) => {
      // Search
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        exp.title.toLowerCase().includes(searchLower) ||
        exp.expenseNumber.toLowerCase().includes(searchLower) ||
        exp.payeeName.toLowerCase().includes(searchLower) ||
        (exp.referenceNumber && exp.referenceNumber.toLowerCase().includes(searchLower)) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchLower));

      // Category
      const matchCat = selectedCategory === 'all' || exp.category === selectedCategory;

      // Method
      const matchMethod = selectedMethod === 'all' || exp.paymentMethod === selectedMethod;

      // Date
      let matchDate = true;
      if (dateRange === 'today') {
        matchDate = exp.expenseDate === todayStr;
      } else if (dateRange === 'this_month') {
        matchDate = exp.expenseDate.startsWith(thisMonthStr);
      } else if (dateRange === 'this_year') {
        matchDate = exp.expenseDate.startsWith(thisYearStr);
      }

      return matchSearch && matchCat && matchMethod && matchDate;
    });
  }, [expenses, searchTerm, selectedCategory, selectedMethod, dateRange]);

  // Statistics
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const thisMonthStr = todayStr.substring(0, 7);

    const totalAllTime = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalThisMonth = expenses
      .filter((e) => e.expenseDate.startsWith(thisMonthStr))
      .reduce((sum, e) => sum + e.amount, 0);

    const categoryMap: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });

    let topCategory = 'None';
    let topCategoryAmount = 0;
    Object.entries(categoryMap).forEach(([cat, amt]) => {
      if (amt > topCategoryAmount) {
        topCategoryAmount = amt;
        topCategory = cat;
      }
    });

    return {
      totalAllTime,
      totalThisMonth,
      count: expenses.length,
      filteredTotal: filteredExpenses.reduce((sum, e) => sum + e.amount, 0),
      topCategory,
      topCategoryAmount,
    };
  }, [expenses, filteredExpenses]);

  // Export CSV
  const exportToCsv = () => {
    const headers = [
      'Expense #',
      'Date',
      'Title',
      'Category',
      'Payee',
      'Payment Method',
      'Reference #',
      'Amount (LKR)',
      'Recorded By',
      'Notes',
    ];
    const rows = filteredExpenses.map((e) => [
      `"${e.expenseNumber}"`,
      `"${e.expenseDate}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      `"${e.payeeName.replace(/"/g, '""')}"`,
      `"${e.paymentMethod}"`,
      `"${e.referenceNumber || ''}"`,
      e.amount,
      `"${e.recordedBy}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WCS_Expenses_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="expenses-page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-[#D4AF37]" />
            Operating Expenses & Petty Cash Ledger
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track showroom utilities, rent, workshop chemicals, NGJA gem testing fees, and staff wages.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCsv}
            className="px-3.5 py-2 bg-[#1A1D23] border border-[#2D3139] text-gray-300 hover:text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:border-gray-500 transition"
            title="Export Table to CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition"
            id="add-expense-btn"
          >
            <Plus className="w-4 h-4" /> Record New Expense
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Expenses This Month
            </span>
            <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">
            {formatCurrency(stats.totalThisMonth)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Current calendar month total</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Expenses (All Time)
            </span>
            <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-[#D4AF37] mt-2">
            {formatCurrency(stats.totalAllTime)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.count} recorded vouchers</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Top Expense Category
            </span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Tag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-white mt-2 truncate" title={stats.topCategory}>
            {stats.topCategory}
          </p>
          <p className="text-xs text-gray-500 mt-1">{formatCurrency(stats.topCategoryAmount)} spent</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Filtered Total
            </span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {formatCurrency(stats.filteredTotal)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredExpenses.length} matching {filteredExpenses.length === 1 ? 'record' : 'records'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, payee, expense #, reference #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* Date Range Filter */}
          <div className="flex bg-[#0F1115] border border-[#2D3139] rounded-xl p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setDateRange('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'all' ? 'bg-[#D4AF37] text-[#0F1115] font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setDateRange('this_month')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'this_month' ? 'bg-[#D4AF37] text-[#0F1115] font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              This Month
            </button>
            <button
              type="button"
              onClick={() => setDateRange('today')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition ${
                dateRange === 'today' ? 'bg-[#D4AF37] text-[#0F1115] font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#14171C] text-[11px] uppercase tracking-wider font-semibold text-gray-400 border-b border-[#2D3139]">
              <tr>
                <th className="py-3.5 px-4">Expense # & Date</th>
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Payee / Vendor</th>
                <th className="py-3.5 px-4">Method & Ref</th>
                <th className="py-3.5 px-4 text-right">Amount (LKR)</th>
                <th className="py-3.5 px-4 text-center">Receipt</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3139]">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    No expenses found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-[#20242C] transition">
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      <span className="font-bold text-[#D4AF37]">{exp.expenseNumber}</span>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {exp.expenseDate}
                      </div>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate">{exp.title}</p>
                      {exp.notes && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">{exp.notes}</p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-[#0F1115] border border-[#2D3139] text-amber-300">
                        {exp.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-200">{exp.payeeName}</div>
                      <div className="text-[10px] text-gray-500">By: {exp.recordedBy}</div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-300 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                        {exp.paymentMethod}
                      </span>
                      {exp.referenceNumber && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          Ref: {exp.referenceNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(exp.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {exp.receiptImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewingReceiptUrl(exp.receiptImageUrl || null)}
                          className="p-1.5 bg-[#0F1115] hover:bg-[#2D3139] border border-[#2D3139] rounded-lg text-[#D4AF37] hover:text-yellow-400 transition"
                          title="View Receipt Photo"
                        >
                          <Receipt className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-gray-600">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setVoucherExpense(exp)}
                          className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#0F1115] rounded-lg transition"
                          title="Print Payment Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-[#0F1115] rounded-lg transition"
                          title="Edit Expense"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(exp.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#0F1115] rounded-lg transition"
                          title="Delete Expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {editingExpenseId ? 'Edit Expense Record' : 'Record Operating Expense'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Enter petty cash or showroom operating expense details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Expense Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.expenseNumber}
                    onChange={(e) => setFormData({ ...formData, expenseNumber: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Expense Title / Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CEB Showroom Electricity Bill or Gem Testing Fees"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Amount ({settings.currencySymbol || 'Rs.'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amount: e.target.value === '' ? '' : Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payee / Vendor / Recipient *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceylon Electricity Board or Sea Street Chemicals"
                    value={formData.payeeName}
                    onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })
                    }
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Bill / Cheque / Transaction Reference # (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. CEB-ACC-0914208 or BOC-TX-998822"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional expense description or authorization notes..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Receipt Image Upload */}
              <div className="pt-1">
                <ImageUploadField
                  value={formData.receiptImageUrl}
                  onChange={(url) => setFormData({ ...formData, receiptImageUrl: url })}
                  label="Receipt / Bill Photo / Voucher Scan (JPG/PNG)"
                  helperText="Upload a photo of the cash receipt, invoice bill, or bank slip."
                  categoryPresets="general"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2D3139]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-[#0F1115] border border-[#2D3139]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] font-bold rounded-xl text-sm shadow-lg shadow-yellow-500/10 transition"
                >
                  {editingExpenseId ? 'Save Changes' : 'Save Expense Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Delete Expense Record?</h3>
            <p className="text-xs text-gray-400 mt-2">
              Are you sure you want to delete this expense voucher? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-[#0F1115] border border-[#2D3139] rounded-xl text-sm text-gray-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Image Modal */}
      {viewingReceiptUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingReceiptUrl(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingReceiptUrl(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingReceiptUrl}
              alt="Expense Receipt"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <p className="text-center text-xs text-gray-400 py-2 font-mono">
              Attached Expense Receipt / Bill Voucher
            </p>
          </div>
        </div>
      )}

      {/* Print Payment Voucher Slip Modal */}
      {voucherExpense && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl print:shadow-none print:border-none print:w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase text-slate-500">
                Payment Voucher Preview
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#D4AF37] text-slate-900 font-bold text-xs rounded-lg flex items-center gap-1 hover:bg-yellow-400"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
                <button
                  type="button"
                  onClick={() => setVoucherExpense(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Voucher Body */}
            <div className="pt-3 space-y-4">
              <div className="text-center border-b pb-3">
                <h2 className="text-lg font-black tracking-tight text-slate-900">
                  {settings.companyName || 'WCS Gems & Jewelry'}
                </h2>
                <p className="text-xs text-slate-500">
                  {settings.address}, {settings.city} | Tel: {settings.telephone}
                </p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs font-bold uppercase tracking-wider text-slate-800">
                  Cash / Expense Payment Voucher
                </div>
              </div>

              <div className="grid grid-cols-2 text-xs gap-2">
                <div>
                  <span className="text-slate-500">Voucher No:</span>{' '}
                  <strong className="font-mono">{voucherExpense.expenseNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date:</span>{' '}
                  <strong>{voucherExpense.expenseDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Paid To:</span>{' '}
                  <strong>{voucherExpense.payeeName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Payment Mode:</span>{' '}
                  <strong>{voucherExpense.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Category:</span>{' '}
                  <strong>{voucherExpense.category}</strong>
                </div>
                {voucherExpense.referenceNumber && (
                  <div className="text-right">
                    <span className="text-slate-500">Ref #:</span>{' '}
                    <strong className="font-mono">{voucherExpense.referenceNumber}</strong>
                  </div>
                )}
              </div>

              <div className="border border-slate-200 rounded p-3 bg-slate-50">
                <div className="text-xs text-slate-500">Purpose / Description:</div>
                <div className="text-sm font-semibold text-slate-900 mt-0.5">
                  {voucherExpense.title}
                </div>
                {voucherExpense.notes && (
                  <div className="text-xs text-slate-600 mt-1 italic">
                    Note: {voucherExpense.notes}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider">Amount Paid:</span>
                <span className="text-lg font-black font-mono">
                  {formatCurrency(voucherExpense.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-800">{voucherExpense.recordedBy}</p>
                  <p className="text-[10px] text-slate-500">Prepared / Cashier By</p>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-800">Authorized Signature</p>
                  <p className="text-[10px] text-slate-500">Manager / Owner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
