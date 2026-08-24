import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseReturn } from '../types';
import {
  Undo2,
  PlusCircle,
  Search,
  AlertCircle,
  Calendar,
  Building,
  CheckCircle2,
  DollarSign,
  FileText,
  Printer,
  Eye,
  Trash2,
  Phone,
  Image as ImageIcon,
  Gem,
  Scale,
} from 'lucide-react';
import { ImageUploadField } from '../components/common/ImageUploadField';

export const PurchaseReturnsPage: React.FC = () => {
  const {
    purchases,
    purchaseReturns,
    addPurchaseReturn,
    products,
    updateProduct,
    formatCurrency,
    showToast,
  } = useApp();

  const [selectedPOId, setSelectedPOId] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [returnNumber, setReturnNumber] = useState(
    `WCS-PRET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [returnDate, setReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnQty, setReturnQty] = useState(1);
  const [refundAmount, setRefundAmount] = useState(45000);
  const [reason, setReason] = useState('Deep internal fracture / clarity grade mismatch under gemological microscope');
  const [returnImageSlipUrl, setReturnImageSlipUrl] = useState('');
  const [refundStatus, setRefundStatus] = useState<'Received' | 'Pending Credit'>('Received');
  const [notes, setNotes] = useState('Returned to Ratnapura gem broker with replacement credit note requested.');

  const [selectedReturnForView, setSelectedReturnForView] = useState<PurchaseReturn | null>(null);

  const selectedPO = purchases.find((p) => p.id === selectedPOId);
  const activeItem = selectedPO && selectedPO.items[selectedItemIndex] ? selectedPO.items[selectedItemIndex] : null;

  const handleReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO || !activeItem) {
      showToast('Please select a valid purchase order and item to return.', 'error');
      return;
    }

    if (returnQty > activeItem.quantity) {
      showToast(`Cannot return more than purchased quantity (${activeItem.quantity}).`, 'error');
      return;
    }

    // 1. Deduct stock from inventory
    const matchedProduct = products.find(
      (p) => p.name.toLowerCase() === activeItem.itemName.toLowerCase()
    );
    if (matchedProduct) {
      updateProduct(matchedProduct.id, {
        stockQuantity: Math.max(0, matchedProduct.stockQuantity - returnQty),
      });
    }

    // 2. Record purchase return
    addPurchaseReturn({
      returnNumber,
      purchaseId: selectedPO.id,
      purchaseNumber: selectedPO.purchaseNumber,
      supplierName: selectedPO.supplierName,
      returnDate,
      returnedItems: [
        {
          itemName: activeItem.itemName,
          quantity: returnQty,
          refundAmount,
          reason: reason.trim(),
        },
      ],
      totalRefundAmount: refundAmount,
      refundStatus,
      notes: `${notes}${returnImageSlipUrl ? ` | Photo Attached` : ''}`,
    });

    showToast(`Processed return #${returnNumber} to ${selectedPO.supplierName}. Stock reduced.`, 'success');

    // Reset Form
    setSelectedPOId('');
    setReturnNumber(`WCS-PRET-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const totalRefundsSum = purchaseReturns.reduce((sum, r) => sum + r.totalRefundAmount, 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-[#E0E0E0]">
      {/* Top Banner */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Undo2 className="w-4 h-4" />
            <span>Supplier Return & Debit Memos</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Purchase Returns to Dealers
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Return substandard gemstones, off-grade bullion, or excess mounts back to suppliers with stock deduction and credit tracking.
          </p>
        </div>

        <div className="bg-[#0F1115] border border-[#2D3139] rounded-xl px-4 py-2 text-right">
          <span className="text-[10px] text-gray-400 uppercase font-semibold">Total Supplier Credits</span>
          <p className="text-lg font-bold text-rose-400 font-mono">{formatCurrency(totalRefundsSum)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Return Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between border-b border-[#2D3139] pb-3">
              <span className="flex items-center gap-2">
                <Undo2 className="w-4 h-4 text-rose-400" />
                Initiate New Supplier Return
              </span>
              <span className="text-[10px] text-gray-400 font-mono">Stock Deduction Auto-Sync</span>
            </h3>

            <form onSubmit={handleReturn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-semibold mb-1">
                    Select Supplier Purchase Order *
                  </label>
                  <select
                    value={selectedPOId}
                    onChange={(e) => {
                      setSelectedPOId(e.target.value);
                      const po = purchases.find((p) => p.id === e.target.value);
                      if (po && po.items.length > 0) {
                        setSelectedItemIndex(0);
                        setRefundAmount(po.items[0].unitCost);
                        setReturnQty(1);
                      }
                    }}
                    required
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="">-- Choose Purchase Order --</option>
                    {purchases.map((po) => (
                      <option key={po.id} value={po.id}>
                        {po.purchaseNumber} — {po.supplierName} ({po.date}) — {formatCurrency(po.totalAmount)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-1">Return Memo # *</label>
                  <input
                    type="text"
                    required
                    value={returnNumber}
                    onChange={(e) => setReturnNumber(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {selectedPO && (
                <div className="space-y-4 pt-2 border-t border-[#2D3139]">
                  {/* Item selection in PO */}
                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Select Item from Purchase Memo to Return *
                    </label>
                    <select
                      value={selectedItemIndex}
                      onChange={(e) => {
                        const idx = Number(e.target.value);
                        setSelectedItemIndex(idx);
                        const it = selectedPO.items[idx];
                        if (it) {
                          setRefundAmount(it.unitCost);
                          setReturnQty(1);
                        }
                      }}
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                    >
                      {selectedPO.items.map((it, idx) => (
                        <option key={idx} value={idx}>
                          {it.itemName} ({it.category}) — Purchased Qty: {it.quantity} @ {formatCurrency(it.unitCost)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Return Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        max={activeItem ? activeItem.quantity : 99}
                        value={returnQty}
                        onChange={(e) => {
                          const q = Number(e.target.value);
                          setReturnQty(q);
                          if (activeItem) {
                            setRefundAmount(q * activeItem.unitCost);
                          }
                        }}
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">
                        Supplier Refund / Credit (LKR) *
                      </label>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(Number(e.target.value))}
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-bold font-mono text-rose-400"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Credit Note Status</label>
                      <select
                        value={refundStatus}
                        onChange={(e) => setRefundStatus(e.target.value as any)}
                        className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white"
                      >
                        <option value="Received">Received Cash / Offset</option>
                        <option value="Pending Credit">Pending Dealer Credit Note</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-300 font-semibold mb-1">
                      Reason for Returning to Gem Dealer / Mine
                    </label>
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. Color zoned, unhealed feather, carat weight deviation"
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                  >
                    <Undo2 className="w-4 h-4" />
                    Confirm Supplier Return & Deduct Inventory Stock
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: JPG Return Slip Upload */}
        <div className="space-y-6">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
              <ImageIcon className="w-4 h-4" />
              <span>Dealer Debit Slip / Stone Photo (JPG)</span>
            </h3>

            <ImageUploadField
              value={returnImageSlipUrl}
              onChange={setReturnImageSlipUrl}
              label="Return Slip / Damaged Stone JPG"
              helperText="Attach photo of dealer debit note or microscope inclusion photo."
              categoryPresets="gemstone"
            />
          </div>
        </div>
      </div>

      {/* History of Purchase Returns */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-xl space-y-3 p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-[#D4AF37]" />
          Purchase Return Records History
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1115] text-gray-400 uppercase text-[10px] font-bold border-b border-[#2D3139]">
              <tr>
                <th className="py-3 px-4">Return # & Date</th>
                <th className="py-3 px-4">Original PO</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Items Returned</th>
                <th className="py-3 px-4 text-right">Refund Value</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3139]">
              {purchaseReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No supplier purchase returns recorded yet.
                  </td>
                </tr>
              ) : (
                purchaseReturns.map((pret) => (
                  <tr key={pret.id} className="hover:bg-[#20242C]">
                    <td className="py-3 px-4">
                      <p className="font-mono font-bold text-white">{pret.returnNumber}</p>
                      <p className="text-[11px] text-gray-400">{pret.returnDate}</p>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#D4AF37]">{pret.purchaseNumber}</td>
                    <td className="py-3 px-4 font-semibold text-white">{pret.supplierName}</td>
                    <td className="py-3 px-4">
                      {pret.returnedItems.map((it, i) => (
                        <p key={i} className="text-gray-300">
                          {it.quantity}x {it.itemName} ({it.reason})
                        </p>
                      ))}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                      {formatCurrency(pret.totalRefundAmount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 bg-rose-950/60 text-rose-400 border border-rose-800/60 rounded-full text-[10px] font-bold">
                        {pret.refundStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedReturnForView(pret)}
                        className="px-2.5 py-1 bg-[#0F1115] hover:bg-[#252932] text-[#D4AF37] border border-[#2D3139] rounded-lg text-xs font-semibold"
                      >
                        <Eye className="w-3.5 h-3.5 inline mr-1" /> Debit Slip
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Slip View Modal */}
      {selectedReturnForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 max-w-lg w-full shadow-2xl text-[#E0E0E0] space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                <FileText className="w-5 h-5 text-rose-400" />
                Debit Return Voucher #{selectedReturnForView.returnNumber}
              </h3>
              <button
                onClick={() => setSelectedReturnForView(null)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-[#0F1115] rounded-xl border border-[#2D3139] space-y-2 text-xs">
              <p>
                <strong className="text-gray-400">Supplier:</strong> {selectedReturnForView.supplierName}
              </p>
              <p>
                <strong className="text-gray-400">Orig. PO:</strong> {selectedReturnForView.purchaseNumber}
              </p>
              <p>
                <strong className="text-gray-400">Date:</strong> {selectedReturnForView.returnDate}
              </p>
              <p>
                <strong className="text-gray-400">Refund Amount:</strong>{' '}
                <span className="text-rose-400 font-mono font-bold">
                  {formatCurrency(selectedReturnForView.totalRefundAmount)}
                </span>
              </p>
              <div className="pt-2 border-t border-[#2D3139]">
                <p className="font-semibold text-white">Returned Items:</p>
                {selectedReturnForView.returnedItems.map((it, idx) => (
                  <p key={idx} className="text-gray-300">
                    &bull; {it.quantity}x {it.itemName} — {it.reason}
                  </p>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#D4AF37] text-[#0F1115] font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-yellow-400 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print Debit Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
