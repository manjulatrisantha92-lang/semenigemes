import React, { useState, useEffect } from 'react';
import { Customer, InvoiceItem, PaymentMethod, Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  Banknote,
  CreditCard,
  Users,
  QrCode,
  Check,
  X,
  FileText,
  UtensilsCrossed,
  Sparkles,
  Smartphone,
  Building2,
  Receipt,
  ArrowRight,
  Calculator,
  Send,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: InvoiceItem[];
  customer: {
    id: string;
    name: string;
    contactNumber: string;
    address?: string;
    nicPassport?: string;
  };
  subtotal: number;
  totalDiscount: number;
  taxPercent: number;
  taxAmount: number;
  grandTotal: number;
  invoiceDate: string;
  invoiceNotes: string;
  onSuccess: (completedInvoice: any) => void;
  onWhatsAppSuccess?: (completedInvoice: Invoice) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  customer,
  subtotal,
  totalDiscount,
  taxPercent,
  taxAmount,
  grandTotal,
  invoiceDate,
  invoiceNotes,
  onSuccess,
  onWhatsAppSuccess,
}) => {
  const {
    createInvoice,
    settings,
    currentUser,
    setActivePrintInvoice,
    formatCurrency,
    showToast,
  } = useApp();

  // Payment Method Selection: 'Cash' | 'Card' | 'Customer Credit' | 'LankaQR / Online'
  const [selectedMethod, setSelectedMethod] = useState<'Cash' | 'Card' | 'Customer Credit' | 'LankaQR / Online'>('Cash');

  // Cash state
  const [cashReceivedInput, setCashReceivedInput] = useState<string>(String(grandTotal));
  
  // Card state
  const [cardType, setCardType] = useState<string>('Visa');
  const [cardLast4, setCardLast4] = useState<string>('');
  const [cardTerminalRef, setCardTerminalRef] = useState<string>('');

  // Customer Credit state
  const [creditRemarks, setCreditRemarks] = useState<string>('Customer Account Ledger Credit');
  const [creditInitialDeposit, setCreditInitialDeposit] = useState<number>(0);

  // LankaQR / Online state
  const [onlineApp, setOnlineApp] = useState<string>('FriMi / Genie');
  const [lankaQrTxnRef, setLankaQrTxnRef] = useState<string>('');

  // When modal opens or grandTotal changes, initialize cashReceived
  useEffect(() => {
    if (isOpen) {
      setCashReceivedInput(String(grandTotal));
    }
  }, [isOpen, grandTotal]);

  // Cash computations
  const cashReceivedNumber = Number(cashReceivedInput) || 0;
  const changeBalance = Math.max(0, cashReceivedNumber - grandTotal);
  const balanceDue = Math.max(0, grandTotal - cashReceivedNumber);

  // Sri Lanka Rupee denominations
  const rupeeDenominations = [500, 1000, 2000, 5000, 10000, 50000, 100000];

  const handleDenominationClick = (val: number) => {
    // If the input is empty or exactly 0, set it to val, otherwise if it's less than grandTotal, set to val, or add
    setCashReceivedInput(String(val));
  };

  const handleAddDenomination = (val: number) => {
    const current = Number(cashReceivedInput) || 0;
    setCashReceivedInput(String(current + val));
  };

  const handleExactCash = () => {
    setCashReceivedInput(String(grandTotal));
  };

  // Keyboard shortcut listener for F8 and Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        e.preventDefault();
        handleExecutePayment(false, true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    selectedMethod,
    cashReceivedInput,
    cardType,
    cardLast4,
    cardTerminalRef,
    creditRemarks,
    onlineApp,
    lankaQrTxnRef,
  ]);

  if (!isOpen) return null;

  // Process transaction
  const handleExecutePayment = (isKotOnly = false, andPrint = true, andWhatsApp = false) => {
    if (cartItems.length === 0) {
      showToast('Cart is empty. Please add items.', 'error');
      return;
    }

    const now = new Date();
    const currentTime = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    let paymentMethodMapped: PaymentMethod = 'Cash';
    let paymentRef = '';
    let finalAmountPaid = grandTotal;
    let finalBalanceDue = 0;

    if (selectedMethod === 'Cash') {
      paymentMethodMapped = 'Cash';
      finalAmountPaid = Math.min(grandTotal, cashReceivedNumber);
      finalBalanceDue = Math.max(0, grandTotal - cashReceivedNumber);
      paymentRef = changeBalance > 0 ? `Change Returned: ${formatCurrency(changeBalance)}` : 'Exact Cash';
    } else if (selectedMethod === 'Card') {
      paymentMethodMapped = 'Visa / Master Card';
      paymentRef = `${cardType} ${cardLast4 ? `(Ending ${cardLast4})` : ''} Ref: ${cardTerminalRef || 'POS-AUTO'}`;
      finalAmountPaid = grandTotal;
      finalBalanceDue = 0;
    } else if (selectedMethod === 'Customer Credit') {
      paymentMethodMapped = 'Credit / Advance Balance';
      finalAmountPaid = creditInitialDeposit;
      finalBalanceDue = Math.max(0, grandTotal - creditInitialDeposit);
      paymentRef = creditRemarks;
    } else if (selectedMethod === 'LankaQR / Online') {
      paymentMethodMapped = 'LankaQR / Online';
      paymentRef = `${onlineApp} QR Txn: ${lankaQrTxnRef || `LQR-${Math.floor(100000 + Math.random() * 900000)}`}`;
      finalAmountPaid = grandTotal;
      finalBalanceDue = 0;
    }

    const nextNumber = `${settings.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = createInvoice({
      invoiceNumber: nextNumber,
      date: invoiceDate,
      time: currentTime,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.contactNumber,
      customerAddress: customer.address,
      customerNIC: customer.nicPassport,
      items: cartItems,
      subtotal,
      totalDiscount,
      taxPercentage: taxPercent,
      taxAmount,
      grandTotal,
      amountPaid: finalAmountPaid,
      balanceDue: finalBalanceDue,
      paymentMethod: paymentMethodMapped,
      paymentRef,
      cashReceived: selectedMethod === 'Cash' ? cashReceivedNumber : undefined,
      changeGiven: selectedMethod === 'Cash' ? changeBalance : undefined,
      cardType: selectedMethod === 'Card' ? cardType : undefined,
      cardLast4: selectedMethod === 'Card' ? cardLast4 : undefined,
      lankaQrRef: selectedMethod === 'LankaQR / Online' ? lankaQrTxnRef : undefined,
      isKotOrDraft: isKotOnly,
      notes: invoiceNotes.trim() || undefined,
      issuedByUserId: currentUser?.id || 'usr-1',
      issuedByUserName: currentUser?.name || 'Cashier',
      status: isKotOnly ? 'partial' : finalBalanceDue > 0 ? 'partial' : 'paid',
    });

    if (!isKotOnly) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
      showToast(`Bill #${nextNumber} completed successfully!`, 'success');
    } else {
      showToast(`Draft Estimate Slip / KOT #${nextNumber} generated!`, 'info');
    }

    onSuccess(newInvoice);

    if (andPrint) {
      setActivePrintInvoice(newInvoice);
    }

    if (andWhatsApp && onWhatsAppSuccess) {
      onWhatsAppSuccess(newInvoice);
    }

    onClose();
  };

  return (
    <div
      id="payment-checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="payment-checkout-modal-card"
        className="bg-[#12151B] border border-[#2D3139] rounded-2xl w-full max-w-lg shadow-2xl text-[#E0E0E0] overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#22262E]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Banknote className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Payment & Checkout
            </h2>
          </div>
          <button
            id="close-checkout-modal-btn"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-[#1E222B] transition"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Grand Total Highlight Box */}
          <div className="bg-[#0A0C0F] border border-[#222630] rounded-2xl p-5 text-center space-y-1 shadow-inner relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              GRAND TOTAL
            </p>
            <p className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tracking-tight">
              {formatCurrency(grandTotal)}
            </p>
            <p className="text-xs text-gray-400 font-medium">
              Customer: <span className="text-gray-200 font-semibold">{customer.name || 'Walk-in Customer'}</span>
              {customer.contactNumber && (
                <span className="text-gray-500 ml-1.5 font-mono text-[11px]">
                  ({customer.contactNumber})
                </span>
              )}
            </p>
          </div>

          {/* Payment Method Selector Grid */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-gray-300">
              Payment Method
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Cash Tab */}
              <button
                type="button"
                id="pm-cash-btn"
                onClick={() => setSelectedMethod('Cash')}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  selectedMethod === 'Cash'
                    ? 'bg-[#F59E0B] text-[#0F1115] shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-[#1A1D24] text-gray-300 hover:text-white hover:bg-[#222630] border border-[#2D3139]'
                }`}
              >
                <Banknote className="w-5 h-5" />
                <span>Cash</span>
              </button>

              {/* Card Tab */}
              <button
                type="button"
                id="pm-card-btn"
                onClick={() => setSelectedMethod('Card')}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  selectedMethod === 'Card'
                    ? 'bg-[#F59E0B] text-[#0F1115] shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-[#1A1D24] text-gray-300 hover:text-white hover:bg-[#222630] border border-[#2D3139]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                <span>Card</span>
              </button>

              {/* Customer Credit Tab */}
              <button
                type="button"
                id="pm-credit-btn"
                onClick={() => setSelectedMethod('Customer Credit')}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  selectedMethod === 'Customer Credit'
                    ? 'bg-[#F59E0B] text-[#0F1115] shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-[#1A1D24] text-gray-300 hover:text-white hover:bg-[#222630] border border-[#2D3139]'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="truncate max-w-full">Customer Cre...</span>
              </button>

              {/* LankaQR / Online Tab */}
              <button
                type="button"
                id="pm-lankaqr-btn"
                onClick={() => setSelectedMethod('LankaQR / Online')}
                className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-bold ${
                  selectedMethod === 'LankaQR / Online'
                    ? 'bg-[#F59E0B] text-[#0F1115] shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                    : 'bg-[#1A1D24] text-gray-300 hover:text-white hover:bg-[#222630] border border-[#2D3139]'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span className="truncate max-w-full">LankaQR / On...</span>
              </button>
            </div>
          </div>

          {/* Tab Specific Content Form */}
          <div className="bg-[#171A21] border border-[#262A33] rounded-2xl p-4 space-y-4">
            {/* CASH MODE */}
            {selectedMethod === 'Cash' && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-300">
                    Cash Received:
                  </label>
                  <button
                    type="button"
                    onClick={handleExactCash}
                    className="px-3 py-1 bg-[#242832] hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 border border-amber-500/40 rounded-lg text-xs font-bold transition"
                  >
                    Exact
                  </button>
                </div>

                {/* Big input field */}
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={cashReceivedInput}
                    onChange={(e) => setCashReceivedInput(e.target.value)}
                    autoFocus
                    placeholder="0"
                    className="w-full bg-[#0D0F13] border-2 border-[#F59E0B] rounded-xl px-4 py-3 text-2xl font-bold font-mono text-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-mono text-sm">
                    LKR
                  </span>
                </div>

                {/* Sri Lankan Rupee denomination quick buttons */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span>Quick Notes / Denominations:</span>
                    <span className="text-[10px] text-gray-500">Click to set</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rupeeDenominations.map((note) => (
                      <button
                        key={note}
                        type="button"
                        onClick={() => handleDenominationClick(note)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition border ${
                          cashReceivedNumber === note
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-[#1F232C] hover:bg-[#282D38] border-[#2E333F] text-gray-300'
                        }`}
                      >
                        Rs. {note.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Change / Balance calculation banner */}
                <div className="pt-2 border-t border-[#262A33] flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-300">
                    Change / Balance:
                  </span>
                  <span className="text-lg font-mono font-bold text-emerald-400">
                    {formatCurrency(changeBalance)}
                  </span>
                </div>

                {balanceDue > 0 && (
                  <p className="text-[11px] text-rose-400 font-medium text-right">
                    Customer still owes: {formatCurrency(balanceDue)}
                  </p>
                )}
              </div>
            )}

            {/* CARD MODE */}
            {selectedMethod === 'Card' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Card Network *</label>
                    <select
                      value={cardType}
                      onChange={(e) => setCardType(e.target.value)}
                      className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="Visa">Visa Credit/Debit</option>
                      <option value="MasterCard">MasterCard</option>
                      <option value="Amex">American Express (Amex)</option>
                      <option value="LankaPay">LankaPay Card</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Last 4 Digits</label>
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="e.g. 4082"
                      value={cardLast4}
                      onChange={(e) => setCardLast4(e.target.value)}
                      className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">POS Terminal Slip / Auth Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-POS-TXN-90214"
                    value={cardTerminalRef}
                    onChange={(e) => setCardTerminalRef(e.target.value)}
                    className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#0D0F13] rounded-xl border border-[#2E333F] flex justify-between items-center text-xs">
                  <span className="text-gray-400">Total Charged to Card:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>
            )}

            {/* CUSTOMER CREDIT MODE */}
            {selectedMethod === 'Customer Credit' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#0D0F13] rounded-xl border border-[#2E333F] space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Customer Name:</span>
                    <span className="font-bold text-white">{customer.name || 'Walk-in'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Credit Ledger:</span>
                    <span className="text-emerald-400 font-semibold">Verified Active Client</span>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Initial Advance / Partial Deposit (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    max={grandTotal}
                    value={creditInitialDeposit || ''}
                    onChange={(e) => setCreditInitialDeposit(Number(e.target.value) || 0)}
                    placeholder="0 (Pay full balance on credit)"
                    className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Credit Ledger Memo / Due Date</label>
                  <input
                    type="text"
                    value={creditRemarks}
                    onChange={(e) => setCreditRemarks(e.target.value)}
                    placeholder="e.g. Due within 30 days upon necklace delivery"
                    className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-[#262A33]">
                  <span className="text-gray-400">Balance added to Credit Account:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {formatCurrency(Math.max(0, grandTotal - creditInitialDeposit))}
                  </span>
                </div>
              </div>
            )}

            {/* LANKAQR / ONLINE APP MODE */}
            {selectedMethod === 'LankaQR / Online' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-[#0D0F13] rounded-xl border border-[#2E333F]">
                  <div className="w-24 h-24 bg-white rounded-lg p-1.5 flex items-center justify-center shrink-0 border border-amber-400">
                    {/* Simulated Clean Dynamic LankaQR Code Graphic */}
                    <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center text-amber-400 p-1 text-center">
                      <QrCode className="w-10 h-10 text-white" />
                      <span className="text-[8px] font-mono font-bold text-amber-400 mt-0.5">
                        LANKA<span className="text-white">QR</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <p className="font-bold text-white text-xs flex items-center gap-1.5 justify-center sm:justify-start">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      Scan to Pay via Sri Lankan Banking Apps
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Supports FriMi, Genie, BOC SmartPay, Commercial Bank Q+, Sampath WePay.
                    </p>
                    <p className="text-xs font-mono font-bold text-amber-400 pt-0.5">
                      Amount: {formatCurrency(grandTotal)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Payment App</label>
                    <select
                      value={onlineApp}
                      onChange={(e) => setOnlineApp(e.target.value)}
                      className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white focus:border-amber-500 focus:outline-none"
                    >
                      <option value="FriMi / Genie">FriMi / Dialog Genie</option>
                      <option value="BOC SmartPay">BOC SmartPay</option>
                      <option value="Commercial Bank Q+">Commercial Bank Q+</option>
                      <option value="Sampath WePay">Sampath WePay</option>
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-1 font-semibold">Transfer / Txn Ref No</label>
                    <input
                      type="text"
                      placeholder="e.g. LQR-920184"
                      value={lankaQrTxnRef}
                      onChange={(e) => setLankaQrTxnRef(e.target.value)}
                      className="w-full bg-[#0D0F13] border border-[#2E333F] rounded-xl p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Action Buttons matching clean checkout */}
        <div className="px-5 sm:px-6 py-4 bg-[#0D0F13] border-t border-[#22262E] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            id="btn-cancel-checkout"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#1A1D24] hover:bg-[#232731] border border-[#2D3139] text-gray-300 hover:text-white font-bold text-xs transition"
          >
            Cancel
          </button>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-2.5">
            {/* PAY & WHATSAPP BILL Button */}
            <button
              type="button"
              id="btn-pay-and-whatsapp"
              onClick={() => handleExecutePayment(false, false, true)}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-[#172B23] hover:bg-[#1E3A2F] text-emerald-300 hover:text-emerald-200 border border-emerald-600/50 font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/15 active:scale-95 transition-all"
              title="Record payment and share bill directly on customer's WhatsApp"
            >
              <Send className="w-4 h-4 text-emerald-400" />
              <span>PAY & WHATSAPP</span>
            </button>

            {/* PAY & PRINT BILL [F8] Primary Button */}
            <button
              type="button"
              id="btn-pay-and-print"
              onClick={() => handleExecutePayment(false, true)}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#E08D03] text-[#0F1115] font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30 active:scale-95 transition-all"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>PAY & PRINT BILL [F8]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
