import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Invoice } from '../types';
import {
  RotateCcw,
  ArrowLeftRight,
  Search,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Printer,
  FileText,
  DollarSign,
  Package,
  Sparkles,
  Eye,
  Camera,
  Image as ImageIcon,
} from 'lucide-react';
import { ImageUploadField } from '../components/common/ImageUploadField';

export const ReturnInvoicePage: React.FC = () => {
  const {
    invoices,
    products,
    returnInvoiceItem,
    updateProduct,
    formatCurrency,
    settings,
    currentUser,
    showToast,
  } = useApp();

  // Mode: 'return' (Simple refund/credit) vs 'exchange' (Change item)
  const [mode, setMode] = useState<'return' | 'exchange'>('exchange');

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [returnQty, setReturnQty] = useState<number>(1);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [reason, setReason] = useState<string>('Customer requested design change & size upgrade');
  const [conditionPhotoUrl, setConditionPhotoUrl] = useState<string>('');

  // Exchange state
  const [exchangeNewProductId, setExchangeNewProductId] = useState<string>(products[0]?.id || '');
  const [exchangeNewQty, setExchangeNewQty] = useState<number>(1);

  // Completed exchange / return voucher for printing
  const [completedVoucher, setCompletedVoucher] = useState<{
    voucherNumber: string;
    date: string;
    invoiceNumber: string;
    customerName: string;
    type: 'Return' | 'Exchange';
    returnedItem: { name: string; qty: number; value: number };
    newItem?: { name: string; qty: number; value: number };
    netDifference: number;
    reason: string;
    photoUrl?: string;
  } | null>(null);

  const selectedInvoice = invoices.find((i) => i.id === selectedInvoiceId);
  const selectedLine = selectedInvoice?.items.find((it) => it.productId === selectedProductId);
  const newExchangeProduct = products.find((p) => p.id === exchangeNewProductId);

  const handleInvoiceChange = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = invoices.find((i) => i.id === invId);
    if (inv && inv.items.length > 0) {
      setSelectedProductId(inv.items[0].productId);
      setRefundAmount(inv.items[0].unitPrice);
      setReturnQty(1);
    }
  };

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const line = selectedInvoice?.items.find((it) => it.productId === prodId);
    if (line) {
      setRefundAmount(line.unitPrice);
      setReturnQty(1);
    }
  };

  const calculateExchangeDifference = () => {
    if (!newExchangeProduct) return 0;
    const newTotal = newExchangeProduct.sellingPrice * exchangeNewQty;
    return newTotal - refundAmount;
  };

  const handleProcessTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || !selectedLine) {
      showToast('Please select an invoice and item.', 'error');
      return;
    }

    if (returnQty > selectedLine.quantity) {
      showToast(`Cannot return more than purchased quantity (${selectedLine.quantity}).`, 'error');
      return;
    }

    const voucherNum = `WCS-EX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const today = new Date().toISOString().split('T')[0];

    if (mode === 'return') {
      // 1. Process return in context
      returnInvoiceItem(selectedInvoice.id, selectedLine.productId, returnQty, refundAmount, reason);

      setCompletedVoucher({
        voucherNumber: voucherNum,
        date: today,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerName: selectedInvoice.customerName,
        type: 'Return',
        returnedItem: {
          name: selectedLine.name,
          qty: returnQty,
          value: refundAmount,
        },
        netDifference: -refundAmount,
        reason,
        photoUrl: conditionPhotoUrl,
      });

      showToast(`Processed sales return for Invoice #${selectedInvoice.invoiceNumber}. Restocked.`, 'success');
    } else {
      // Exchange Mode
      if (!newExchangeProduct) {
        showToast('Please select a new item for exchange.', 'error');
        return;
      }

      if (newExchangeProduct.stockQuantity < exchangeNewQty) {
        showToast(`Insufficient stock for ${newExchangeProduct.name} (Available: ${newExchangeProduct.stockQuantity}).`, 'error');
        return;
      }

      // Restock old item
      const oldProd = products.find((p) => p.id === selectedLine.productId);
      if (oldProd) {
        updateProduct(oldProd.id, {
          stockQuantity: oldProd.stockQuantity + returnQty,
        });
      }

      // Deduct new item stock
      updateProduct(newExchangeProduct.id, {
        stockQuantity: Math.max(0, newExchangeProduct.stockQuantity - exchangeNewQty),
      });

      // Record return on the invoice
      returnInvoiceItem(
        selectedInvoice.id,
        selectedLine.productId,
        returnQty,
        refundAmount,
        `Exchanged for ${newExchangeProduct.name} (Qty: ${exchangeNewQty}) - ${reason}`
      );

      const netDiff = (newExchangeProduct.sellingPrice * exchangeNewQty) - refundAmount;

      setCompletedVoucher({
        voucherNumber: voucherNum,
        date: today,
        invoiceNumber: selectedInvoice.invoiceNumber,
        customerName: selectedInvoice.customerName,
        type: 'Exchange',
        returnedItem: {
          name: selectedLine.name,
          qty: returnQty,
          value: refundAmount,
        },
        newItem: {
          name: newExchangeProduct.name,
          qty: exchangeNewQty,
          value: newExchangeProduct.sellingPrice * exchangeNewQty,
        },
        netDifference: netDiff,
        reason,
        photoUrl: conditionPhotoUrl,
      });

      showToast(
        `Exchanged ${selectedLine.name} for ${newExchangeProduct.name}. Inventory balances updated.`,
        'success'
      );
    }

    setSelectedInvoiceId('');
    setSelectedProductId('');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-[#E0E0E0]">
      {/* Top Header */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <ArrowLeftRight className="w-4 h-4" />
            <span>Customer Service & Jewelry Exchange Desk</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Sales Return or Change (Exchange)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Seamlessly exchange customer jewelry for another piece with live price-difference calculation, or process refund credit note.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center bg-[#0F1115] border border-[#2D3139] rounded-xl p-1">
          <button
            type="button"
            onClick={() => setMode('exchange')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              mode === 'exchange'
                ? 'bg-[#D4AF37] text-[#0F1115] shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Item Change / Exchange
          </button>
          <button
            type="button"
            onClick={() => setMode('return')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              mode === 'return'
                ? 'bg-rose-600 text-white shadow'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Return & Refund
          </button>
        </div>
      </div>

      <form onSubmit={handleProcessTransaction} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Return / Exchange Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Original Invoice & Item */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                <RotateCcw className="w-4 h-4" />
                <span>1. Original Purchase Reference</span>
              </h3>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">
                  Select Customer Sales Invoice *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  <option value="">-- Select Sold Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.customerName} ({inv.date}) — Total: {formatCurrency(inv.grandTotal)}
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="space-y-4 pt-2 border-t border-[#2D3139]">
                  <div className="bg-[#0F1115] rounded-xl p-3.5 border border-[#2D3139] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <p className="font-bold text-white text-sm">{selectedInvoice.customerName}</p>
                      <p className="text-gray-400 font-mono text-[11px]">{selectedInvoice.customerPhone}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 uppercase">Original Invoice Total</span>
                      <p className="font-mono font-bold text-[#D4AF37] text-base">
                        {formatCurrency(selectedInvoice.grandTotal)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Select Item to Return / Exchange *
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      required
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {selectedInvoice.items.map((line) => (
                        <option key={line.productId} value={line.productId}>
                          {line.name} (Sold Qty: {line.quantity}) — Sold Price: {formatCurrency(line.unitPrice)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Return Quantity (Max: {selectedLine?.quantity || 1}) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={selectedLine?.quantity || 1}
                        value={returnQty}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          setReturnQty(q);
                          if (selectedLine) setRefundAmount(q * selectedLine.unitPrice);
                        }}
                        required
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Credited Value for Returned Item (LKR) *
                      </label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        required
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold text-amber-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: In Exchange Mode -> Select New Item */}
            {mode === 'exchange' && selectedInvoice && (
              <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                  <span>2. Select New Exchange Item from Catalog</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-gray-300 font-semibold mb-1">
                      New Jewelry / Gemstone Item *
                    </label>
                    <select
                      value={exchangeNewProductId}
                      onChange={(e) => setExchangeNewProductId(e.target.value)}
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) — Price: {formatCurrency(p.sellingPrice)} [Stock: {p.stockQuantity}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">Exchange Qty *</label>
                    <input
                      type="number"
                      min="1"
                      value={exchangeNewQty}
                      onChange={(e) => setExchangeNewQty(Number(e.target.value))}
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-bold"
                    />
                  </div>
                </div>

                {newExchangeProduct && (
                  <div className="p-4 bg-[#0F1115] rounded-xl border border-[#2D3139] flex items-center gap-3">
                    <img
                      src={newExchangeProduct.imageUrl}
                      alt={newExchangeProduct.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-white">{newExchangeProduct.name}</p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {newExchangeProduct.itemCode} • {newExchangeProduct.metalPurity}
                      </p>
                      <p className="text-xs font-bold text-[#D4AF37] mt-0.5">
                        {formatCurrency(newExchangeProduct.sellingPrice)} each
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reason */}
            {selectedInvoice && (
              <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Reason for Return / Exchange Note *
                  </label>
                  <input
                    type="text"
                    required
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Ring size upgrade, customer preferred yellow sapphire over blue sapphire..."
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: JPG Photo & Settlement Box */}
          <div className="space-y-6">
            {/* Condition Photo Upload */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                <ImageIcon className="w-4 h-4" />
                <span>Returned Item Condition (JPG)</span>
              </h3>

              <ImageUploadField
                value={conditionPhotoUrl}
                onChange={setConditionPhotoUrl}
                label="Returned Jewelry Condition Photo"
                helperText="Upload JPG photo verifying item condition, prongs, and stone authenticity upon return."
                categoryPresets="jewelry"
              />
            </div>

            {/* Settlement Summary Card */}
            {selectedInvoice && (
              <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#2D3139] pb-3">
                  Financial Settlement Breakdown
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Returned Item Credit:</span>
                    <span className="font-mono font-bold text-amber-400">
                      - {formatCurrency(refundAmount)}
                    </span>
                  </div>

                  {mode === 'exchange' && newExchangeProduct && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">New Item Price:</span>
                      <span className="font-mono font-bold text-white">
                        + {formatCurrency(newExchangeProduct.sellingPrice * exchangeNewQty)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#2D3139] flex justify-between items-center">
                    <span className="font-bold text-white text-xs">
                      {mode === 'exchange'
                        ? calculateExchangeDifference() >= 0
                          ? 'Customer Extra Payable:'
                          : 'Refund Balance to Customer:'
                        : 'Total Refund to Customer:'}
                    </span>
                    <span
                      className={`text-lg font-mono font-bold ${
                        mode === 'exchange'
                          ? calculateExchangeDifference() >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {formatCurrency(
                        mode === 'exchange'
                          ? Math.abs(calculateExchangeDifference())
                          : refundAmount
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className={`w-full mt-4 py-3.5 font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider text-xs ${
                    mode === 'exchange'
                      ? 'bg-[#D4AF37] hover:bg-[#c4a030] text-[#0F1115]'
                      : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {mode === 'exchange' ? (
                    <>
                      <ArrowLeftRight className="w-4 h-4" />
                      Complete Exchange & Update Inventory
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Process Return & Restock Item
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Completed Voucher Printable Modal */}
      {completedVoucher && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 max-w-xl w-full shadow-2xl text-[#E0E0E0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
                  Official {completedVoucher.type} Voucher #{completedVoucher.voucherNumber}
                </h3>
                <p className="text-xs text-gray-400">Date: {completedVoucher.date}</p>
              </div>
              <button
                onClick={() => setCompletedVoucher(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#0F1115] rounded-xl border border-[#2D3139] space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#2D3139] pb-2">
                <div>
                  <span className="text-gray-400 text-[10px] uppercase">Customer</span>
                  <p className="font-bold text-white text-sm">{completedVoucher.customerName}</p>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 text-[10px] uppercase">Ref. Invoice #</span>
                  <p className="font-mono font-bold text-[#D4AF37]">{completedVoucher.invoiceNumber}</p>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-gray-400 uppercase font-bold">Returned Item Received:</span>
                <p className="text-white font-semibold">
                  {completedVoucher.returnedItem.qty}x {completedVoucher.returnedItem.name} — Value: {formatCurrency(completedVoucher.returnedItem.value)}
                </p>
              </div>

              {completedVoucher.newItem && (
                <div className="space-y-1 pt-2 border-t border-[#2D3139]">
                  <span className="text-[10px] text-emerald-400 uppercase font-bold">New Exchanged Item Issued:</span>
                  <p className="text-white font-semibold">
                    {completedVoucher.newItem.qty}x {completedVoucher.newItem.name} — Price: {formatCurrency(completedVoucher.newItem.value)}
                  </p>
                </div>
              )}

              <div className="pt-2 border-t border-[#2D3139] flex justify-between items-center">
                <span className="font-bold text-white">Net Balance Settlement:</span>
                <span className="text-base font-mono font-bold text-[#D4AF37]">
                  {formatCurrency(Math.abs(completedVoucher.netDifference))} ({completedVoucher.netDifference >= 0 ? 'Customer Paid' : 'Refunded'})
                </span>
              </div>

              <p className="text-[11px] text-gray-400 italic">Reason: {completedVoucher.reason}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-yellow-400 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Exchange Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
