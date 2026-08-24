import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Calendar,
  Building,
  Receipt,
  FileText,
  Printer,
  Eye,
  X,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupplierPayment, PaymentMethod } from '../types';
import { ImageUploadField } from '../components/common/ImageUploadField';

const PAYMENT_METHODS: PaymentMethod[] = [
  'Bank Transfer',
  'Cash',
  'Cheque',
  'Online / Card',
  'Other',
];

export const SupplierPaymentsPage: React.FC = () => {
  const {
    supplierPayments,
    addSupplierPayment,
    deleteSupplierPayment,
    purchases,
    formatCurrency,
    currentUser,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);
  const [voucherPayment, setVoucherPayment] = useState<SupplierPayment | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    paymentNumber: string;
    supplierName: string;
    supplierPhone: string;
    purchaseId: string;
    purchaseNumber: string;
    amount: number | '';
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber: string;
    receiptImageUrl: string;
    notes: string;
  }>({
    paymentNumber: '',
    supplierName: '',
    supplierPhone: '',
    purchaseId: '',
    purchaseNumber: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Bank Transfer',
    referenceNumber: '',
    receiptImageUrl: '',
    notes: '',
  });

  // Extract unique suppliers from purchases & existing payments
  const uniqueSuppliers = useMemo(() => {
    const names = new Set<string>();
    purchases.forEach((p) => names.add(p.supplierName));
    supplierPayments.forEach((p) => names.add(p.supplierName));
    return Array.from(names).sort();
  }, [purchases, supplierPayments]);

  // Purchases that have outstanding balance
  const duePurchases = useMemo(() => {
    return purchases.filter((p) => (p.totalAmount - (p.paidAmount || 0)) > 0);
  }, [purchases]);

  const openAddModal = (initialPurchaseId?: string) => {
    const nextNum = `WCS-SPAY-2026-${String(supplierPayments.length + 1).padStart(4, '0')}`;
    let targetSupplier = '';
    let targetPhone = '';
    let targetPOId = '';
    let targetPONum = '';
    let targetAmount: number | '' = '';

    if (initialPurchaseId) {
      const matchedPO = purchases.find((p) => p.id === initialPurchaseId);
      if (matchedPO) {
        targetSupplier = matchedPO.supplierName;
        targetPhone = matchedPO.supplierPhone || '';
        targetPOId = matchedPO.id;
        targetPONum = matchedPO.purchaseNumber;
        targetAmount = Math.max(0, matchedPO.totalAmount - (matchedPO.paidAmount || 0));
      }
    }

    setFormData({
      paymentNumber: nextNum,
      supplierName: targetSupplier,
      supplierPhone: targetPhone,
      purchaseId: targetPOId,
      purchaseNumber: targetPONum,
      amount: targetAmount,
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Bank Transfer',
      referenceNumber: '',
      receiptImageUrl: '',
      notes: targetPONum ? `Settlement for Purchase Order #${targetPONum}` : '',
    });
    setIsModalOpen(true);
  };

  const handlePurchaseSelect = (poId: string) => {
    if (!poId) {
      setFormData((prev) => ({
        ...prev,
        purchaseId: '',
        purchaseNumber: '',
      }));
      return;
    }

    const matched = purchases.find((p) => p.id === poId);
    if (matched) {
      const remainingDue = Math.max(0, matched.totalAmount - (matched.paidAmount || 0));
      setFormData((prev) => ({
        ...prev,
        purchaseId: matched.id,
        purchaseNumber: matched.purchaseNumber,
        supplierName: matched.supplierName,
        supplierPhone: matched.supplierPhone || prev.supplierPhone,
        amount: remainingDue > 0 ? remainingDue : prev.amount,
        notes: prev.notes || `Settlement payment for ${matched.purchaseNumber}`,
      }));
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.supplierName.trim()) {
      alert('Please enter or select a supplier name.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    addSupplierPayment({
      paymentNumber: formData.paymentNumber || `WCS-SPAY-${Date.now().toString().slice(-4)}`,
      supplierName: formData.supplierName.trim(),
      supplierPhone: formData.supplierPhone.trim() || undefined,
      purchaseId: formData.purchaseId || undefined,
      purchaseNumber: formData.purchaseNumber || undefined,
      amount: Number(formData.amount),
      paymentDate: formData.paymentDate,
      paymentMethod: formData.paymentMethod,
      referenceNumber: formData.referenceNumber.trim() || undefined,
      receiptImageUrl: formData.receiptImageUrl || undefined,
      notes: formData.notes.trim() || undefined,
      recordedBy: currentUser?.name || 'Saman Jayasinghe (Admin)',
    });

    setIsModalOpen(false);
  };

  // Filtered Payments
  const filteredPayments = useMemo(() => {
    return supplierPayments.filter((p) => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch =
        !searchTerm ||
        p.supplierName.toLowerCase().includes(searchLower) ||
        p.paymentNumber.toLowerCase().includes(searchLower) ||
        (p.purchaseNumber && p.purchaseNumber.toLowerCase().includes(searchLower)) ||
        (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchLower)) ||
        (p.notes && p.notes.toLowerCase().includes(searchLower));

      const matchMethod = selectedMethod === 'all' || p.paymentMethod === selectedMethod;
      const matchSupplier = selectedSupplier === 'all' || p.supplierName === selectedSupplier;

      return matchSearch && matchMethod && matchSupplier;
    });
  }, [supplierPayments, searchTerm, selectedMethod, selectedSupplier]);

  // Statistics
  const stats = useMemo(() => {
    const totalPaid = supplierPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPurchasesAmount = purchases.reduce((sum, po) => sum + po.totalAmount, 0);
    const totalPurchasesPaid = purchases.reduce((sum, po) => sum + (po.paidAmount || 0), 0);
    const totalOutstandingDue = Math.max(0, totalPurchasesAmount - totalPurchasesPaid);

    return {
      totalPaid,
      totalOutstandingDue,
      paymentsCount: supplierPayments.length,
      duePOCount: duePurchases.length,
    };
  }, [supplierPayments, purchases, duePurchases]);

  // Export CSV
  const exportToCsv = () => {
    const headers = [
      'Payment #',
      'Date',
      'Supplier Name',
      'Supplier Phone',
      'Linked Purchase #',
      'Payment Method',
      'Reference / Cheque #',
      'Amount Paid (LKR)',
      'Recorded By',
      'Notes',
    ];
    const rows = filteredPayments.map((p) => [
      `"${p.paymentNumber}"`,
      `"${p.paymentDate}"`,
      `"${p.supplierName.replace(/"/g, '""')}"`,
      `"${p.supplierPhone || ''}"`,
      `"${p.purchaseNumber || 'General Supply'}"`,
      `"${p.paymentMethod}"`,
      `"${p.referenceNumber || ''}"`,
      p.amount,
      `"${p.recordedBy}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WCS_Supplier_Payments_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12" id="supplier-payments-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-[#D4AF37]" />
            Supplier Payments Ledger & Settlements
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage payments made to Ratnapura gemstone mine operators, bullion dealers, and diamond traders.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCsv}
            className="px-3.5 py-2 bg-[#1A1D23] border border-[#2D3139] text-gray-300 hover:text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 hover:border-gray-500 transition"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Export CSV
          </button>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] font-bold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-yellow-500/10 transition"
            id="pay-supplier-btn"
          >
            <Plus className="w-4 h-4" /> Pay Supplier / Record Payment
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Supplier Payments
            </span>
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {formatCurrency(stats.totalPaid)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.paymentsCount} payments logged</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Outstanding Supplier Payables
            </span>
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            {formatCurrency(stats.totalOutstandingDue)}
          </p>
          <p className="text-xs text-gray-500 mt-1">{stats.duePOCount} orders with pending balance</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Active Suppliers
            </span>
            <div className="p-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 rounded-xl text-[#D4AF37]">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{uniqueSuppliers.length}</p>
          <p className="text-xs text-gray-500 mt-1">Gems, Bullion & Tools</p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4.5 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Filtered Total
            </span>
            <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">
            {formatCurrency(filteredPayments.reduce((s, p) => s + p.amount, 0))}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {filteredPayments.length} payment {filteredPayments.length === 1 ? 'record' : 'records'}
          </p>
        </div>
      </div>

      {/* Pending Balances Quick Pay Alert Bar */}
      {duePurchases.length > 0 && (
        <div className="bg-[#1A1D23] border border-amber-500/30 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <span className="text-sm font-bold text-white">
                Pending Supplier Purchase Invoices ({duePurchases.length})
              </span>
            </div>
            <span className="text-xs text-amber-400 font-mono font-bold">
              Total Due: {formatCurrency(stats.totalOutstandingDue)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {duePurchases.map((po) => {
              const due = po.totalAmount - (po.paidAmount || 0);
              return (
                <div
                  key={po.id}
                  className="bg-[#0F1115] border border-[#2D3139] hover:border-amber-500/50 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#D4AF37] font-mono">
                        {po.purchaseNumber}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold">
                        {po.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-white font-medium truncate mt-0.5">
                      {po.supplierName}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      Due: <span className="text-amber-400 font-bold">{formatCurrency(due)}</span> / Total: {formatCurrency(po.totalAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openAddModal(po.id)}
                    className="px-3 py-1.5 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] text-xs font-bold rounded-lg shrink-0 flex items-center gap-1 transition"
                  >
                    Pay <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search supplier, payment #, purchase order #, ref #..."
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
          {/* Supplier Filter */}
          <select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Suppliers</option>
            {uniqueSuppliers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Payment Method Filter */}
          <select
            value={selectedMethod}
            onChange={(e) => setSelectedMethod(e.target.value)}
            className="bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Payment Methods</option>
            {PAYMENT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Supplier Payments Table */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#14171C] text-[11px] uppercase tracking-wider font-semibold text-gray-400 border-b border-[#2D3139]">
              <tr>
                <th className="py-3.5 px-4">Payment # & Date</th>
                <th className="py-3.5 px-4">Supplier & Phone</th>
                <th className="py-3.5 px-4">Linked Purchase Order</th>
                <th className="py-3.5 px-4">Payment Mode & Ref</th>
                <th className="py-3.5 px-4 text-right">Amount Paid (LKR)</th>
                <th className="py-3.5 px-4 text-center">Receipt Slip</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3139]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                    No supplier payments found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-[#20242C] transition">
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap">
                      <span className="font-bold text-[#D4AF37]">{pay.paymentNumber}</span>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" /> {pay.paymentDate}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-semibold text-white">{pay.supplierName}</p>
                      {pay.supplierPhone && (
                        <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                          {pay.supplierPhone}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {pay.purchaseNumber ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-[#0F1115] border border-[#2D3139] text-[#D4AF37] font-mono">
                          <FileText className="w-3 h-3" /> {pay.purchaseNumber}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">General Supplier Advance</span>
                      )}
                      {pay.notes && (
                        <p className="text-[11px] text-gray-400 max-w-xs truncate mt-0.5">
                          {pay.notes}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 text-xs text-gray-300 font-medium">
                        <CreditCard className="w-3.5 h-3.5 text-gray-500" />
                        {pay.paymentMethod}
                      </span>
                      {pay.referenceNumber && (
                        <div className="text-[10px] text-gray-500 font-mono">
                          Ref: {pay.referenceNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(pay.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {pay.receiptImageUrl ? (
                        <button
                          type="button"
                          onClick={() => setViewingReceiptUrl(pay.receiptImageUrl || null)}
                          className="p-1.5 bg-[#0F1115] hover:bg-[#2D3139] border border-[#2D3139] rounded-lg text-[#D4AF37] hover:text-yellow-400 transition"
                          title="View Bank Slip / Cheque Photo"
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
                          onClick={() => setVoucherPayment(pay)}
                          className="p-1.5 text-gray-400 hover:text-[#D4AF37] hover:bg-[#0F1115] rounded-lg transition"
                          title="Print Payment Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(pay.id)}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#0F1115] rounded-lg transition"
                          title="Delete Payment Record"
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

      {/* Record Supplier Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#2D3139]">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Record Supplier Payment</h3>
                  <p className="text-xs text-gray-400">
                    Log settlement to gem mine operators, gold bullion dealers, or traders
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

            <form onSubmit={handleSavePayment} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.paymentNumber}
                    onChange={(e) => setFormData({ ...formData, paymentNumber: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Link to Purchase Order */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Link to Purchase Order (Optional)
                </label>
                <select
                  value={formData.purchaseId}
                  onChange={(e) => handlePurchaseSelect(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">-- No Specific PO (General Supplier Payment / Advance) --</option>
                  {purchases.map((po) => {
                    const due = po.totalAmount - (po.paidAmount || 0);
                    return (
                      <option key={po.id} value={po.id}>
                        {po.purchaseNumber} &bull; {po.supplierName} (Total: {formatCurrency(po.totalAmount)} | Due: {formatCurrency(due)})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-gray-500 mt-1">
                  Selecting a purchase order will automatically update its paid amount and status to &quot;Paid&quot; or &quot;Partial&quot;.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    required
                    list="suppliers-list"
                    placeholder="e.g. Ratnapura Gem Pit Operators Ltd"
                    value={formData.supplierName}
                    onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <datalist id="suppliers-list">
                    {uniqueSuppliers.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Supplier Phone / WhatsApp
                  </label>
                  <input
                    type="tel"
                    placeholder="+94 77 123 4567"
                    value={formData.supplierPhone}
                    onChange={(e) => setFormData({ ...formData, supplierPhone: e.target.value })}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Amount Paid ({settings.currencySymbol || 'Rs.'}) *
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
                  Cheque Number / Bank Transfer Reference / Deposit Slip #
                </label>
                <input
                  type="text"
                  placeholder="e.g. BOC-TX-9902148 or CHQ-002194"
                  value={formData.referenceNumber}
                  onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Settlement Notes / Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Final settlement for 3 Blue Sapphires lot or Advance payment..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Cheque / Deposit Slip Photo Upload */}
              <div className="pt-1">
                <ImageUploadField
                  value={formData.receiptImageUrl}
                  onChange={(url) => setFormData({ ...formData, receiptImageUrl: url })}
                  label="Cheque Photo / Bank Deposit Slip / Voucher Scan (JPG/PNG)"
                  helperText="Upload photo of the issued cheque or bank deposit confirmation slip."
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
                  Confirm & Record Supplier Payment
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
            <h3 className="text-lg font-bold text-white">Delete Supplier Payment Record?</h3>
            <p className="text-xs text-gray-400 mt-2">
              Are you sure you want to delete this payment record from the ledger?
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
                  deleteSupplierPayment(deleteConfirmId);
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

      {/* View Slip Image Modal */}
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
              alt="Supplier Payment Slip"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <p className="text-center text-xs text-gray-400 py-2 font-mono">
              Attached Cheque / Bank Transfer Deposit Slip
            </p>
          </div>
        </div>
      )}

      {/* Print Payment Voucher Slip Modal */}
      {voucherPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0">
          <div className="bg-white text-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl print:shadow-none print:border-none print:w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 print:hidden">
              <span className="text-xs font-bold uppercase text-slate-500">
                Supplier Payment Voucher Preview
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
                  onClick={() => setVoucherPayment(null)}
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
                  Supplier Settlement Payment Voucher
                </div>
              </div>

              <div className="grid grid-cols-2 text-xs gap-2">
                <div>
                  <span className="text-slate-500">Payment Voucher:</span>{' '}
                  <strong className="font-mono">{voucherPayment.paymentNumber}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Date:</span>{' '}
                  <strong>{voucherPayment.paymentDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Supplier:</span>{' '}
                  <strong>{voucherPayment.supplierName}</strong>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Payment Mode:</span>{' '}
                  <strong>{voucherPayment.paymentMethod}</strong>
                </div>
                {voucherPayment.purchaseNumber && (
                  <div>
                    <span className="text-slate-500">Purchase Order:</span>{' '}
                    <strong className="font-mono">{voucherPayment.purchaseNumber}</strong>
                  </div>
                )}
                {voucherPayment.referenceNumber && (
                  <div className="text-right">
                    <span className="text-slate-500">Cheque / Slip Ref:</span>{' '}
                    <strong className="font-mono">{voucherPayment.referenceNumber}</strong>
                  </div>
                )}
              </div>

              {voucherPayment.notes && (
                <div className="border border-slate-200 rounded p-2.5 bg-slate-50 text-xs">
                  <span className="text-slate-500 font-semibold">Remarks:</span> {voucherPayment.notes}
                </div>
              )}

              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded-lg">
                <span className="text-xs font-bold uppercase tracking-wider">Amount Paid:</span>
                <span className="text-lg font-black font-mono">
                  {formatCurrency(voucherPayment.amount)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-6 text-center text-xs">
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-800">{voucherPayment.recordedBy}</p>
                  <p className="text-[10px] text-slate-500">Prepared By (Cashier/Admin)</p>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="font-semibold text-slate-800">{voucherPayment.supplierName}</p>
                  <p className="text-[10px] text-slate-500">Supplier Receiver Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
