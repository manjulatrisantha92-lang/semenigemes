import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Invoice } from '../types';
import { WhatsAppBillModal } from '../components/modals/WhatsAppBillModal';
import {
  FileText,
  Search,
  Printer,
  Share2,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Award,
  Send,
} from 'lucide-react';

export const InvoicesHistoryPage: React.FC = () => {
  const {
    invoices,
    setActivePrintInvoice,
    createCertificate,
    setCurrentPage,
    formatCurrency,
    showToast,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [activeWhatsAppInvoice, setActiveWhatsAppInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerPhone.includes(searchTerm) ||
      inv.items.some((i) => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = selectedStatus === 'All' || inv.status === selectedStatus;
    const matchesDate = !selectedDate || inv.date === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleShareWhatsApp = (inv: Invoice) => {
    setActiveWhatsAppInvoice(inv);
  };

  const handleGenerateCertificateForInvoice = (inv: Invoice) => {
    const firstItem = inv.items[0];
    if (!firstItem) return;

    const certNo = `${settings.certificatePrefix}${Math.floor(1000 + Math.random() * 9000)}`;
    createCertificate({
      certificateNumber: certNo,
      date: inv.date,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerId: inv.customerId,
      customerName: inv.customerName,
      productId: firstItem.productId,
      itemCode: firstItem.itemCode,
      barcode: firstItem.barcode,
      jewelryName: firstItem.name,
      metalPurity: '18K Yellow Gold (750)',
      grossWeight: firstItem.grossWeight || 5.2,
      gemstoneType: 'Blue Sapphire',
      caratWeight: firstItem.caratWeight || 2.5,
      cutShape: 'Oval Mixed Cut',
      color: 'Royal Blue',
      clarity: 'VVS (Eye Clean)',
      origin: 'Ratnapura, Sri Lanka (Ceylon)',
      treatment: 'Unheated Natural',
      remarks: 'Natural Ceylon gemstone verified under gemological microscope. Accompanied by official guarantee.',
      itemImageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      gemologistName: settings.defaultGemologistName,
      gemologistTitle: settings.defaultGemologistTitle,
      qrVerificationCode: `VERIFY-${certNo}`,
      useTemplateBackground: false,
    });

    setCurrentPage('certificates');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header & Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              Invoice Registry & Reprinting
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review previous invoices, reprint official A4 invoices, or share digital receipts via WhatsApp.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400">Total Invoices:</span>{' '}
            <span className="font-bold text-amber-400 text-sm">{invoices.length}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search invoice #, customer, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="refunded">Refunded / Returned</option>
            </select>
          </div>

          <div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-700">
                <th className="py-3 px-4">Invoice No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items Count</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 text-right">Grand Total</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No matching invoices found in history.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-medium">{inv.date}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-100">{inv.customerName}</p>
                      <p className="text-[11px] text-slate-400">{inv.customerPhone}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">
                        {inv.items.map((i) => i.name).join(', ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      <span className="font-medium">{inv.paymentMethod}</span>
                      {inv.paymentRef && (
                        <div className="text-[10px] text-slate-500 font-mono">Ref: {inv.paymentRef}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400 text-sm">
                      {formatCurrency(inv.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          inv.status === 'paid'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : inv.status === 'partial'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* Reprint A4 Button */}
                      <button
                        onClick={() => setActivePrintInvoice(inv)}
                        className="p-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 rounded-lg transition"
                        title="Reprint A4 Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        onClick={() => handleShareWhatsApp(inv)}
                        className="p-1.5 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg transition"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>

                      {/* Generate Certificate Button */}
                      <button
                        onClick={() => handleGenerateCertificateForInvoice(inv)}
                        className="p-1.5 bg-blue-500/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition"
                        title="Generate Gemological Certificate"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* WhatsApp Bill Share Modal */}
      {activeWhatsAppInvoice && (
        <WhatsAppBillModal
          invoice={activeWhatsAppInvoice}
          onClose={() => setActiveWhatsAppInvoice(null)}
        />
      )}
    </div>
  );
};
