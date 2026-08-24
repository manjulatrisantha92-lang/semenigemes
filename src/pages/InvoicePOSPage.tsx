import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Product, Customer, InvoiceItem, PaymentMethod, Invoice } from '../types';
import {
  Barcode,
  Search,
  Plus,
  Trash2,
  Receipt,
  Printer,
  Share2,
  UserPlus,
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Gem,
  Percent,
  ArrowRight,
  UtensilsCrossed,
  Maximize2,
  Minimize2,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PaymentCheckoutModal } from '../components/checkout/PaymentCheckoutModal';
import { WhatsAppBillModal } from '../components/modals/WhatsAppBillModal';

export const InvoicePOSPage: React.FC = () => {
  const {
    products,
    categories,
    customers,
    addCustomer,
    createInvoice,
    settings,
    currentUser,
    setActivePrintInvoice,
    formatCurrency,
    showToast,
    isFullscreen,
    toggleFullscreen,
  } = useApp();

  // Active Cart items
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [paymentRef, setPaymentRef] = useState('');
  const [invoiceNotes, setInvoiceNotes] = useState('');
  const [globalDiscountPercent, setGlobalDiscountPercent] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(0);
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');

  // Payment Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);
  const [activeWhatsAppInvoice, setActiveWhatsAppInvoice] = useState<Invoice | null>(null);

  // Barcode / Search Inputs
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchItemText, setSearchItemText] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // New Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustNIC, setNewCustNIC] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustCity, setNewCustCity] = useState('Colombo');

  // Auto focus barcode input on load and setup F8 shortcut
  useEffect(() => {
    barcodeInputRef.current?.focus();

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If modal is not open and F8 is pressed
      if (e.key === 'F8' && !showCheckoutModal && !showAddCustomerModal) {
        e.preventDefault();
        if (cartItems.length > 0) {
          setShowCheckoutModal(true);
        } else {
          showToast('Please add items to cart before proceeding to checkout.', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [cartItems.length, showCheckoutModal, showAddCustomerModal, showToast]);

  // Filter products for browsing
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    const matchesSearch =
      searchItemText === '' ||
      p.name.toLowerCase().includes(searchItemText.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(searchItemText.toLowerCase()) ||
      p.barcode.includes(searchItemText);
    return matchesCategory && matchesSearch;
  });

  // Handle Barcode Scan / Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const query = barcodeInput.trim();
    const foundProduct = products.find(
      (p) => p.barcode === query || p.itemCode.toLowerCase() === query.toLowerCase()
    );

    if (foundProduct) {
      if (foundProduct.stockQuantity <= 0) {
        showToast(`Warning: Item ${foundProduct.name} is currently out of stock.`, 'warning');
      }
      addItemToCart(foundProduct);
      setBarcodeInput('');
      showToast(`Scanned: ${foundProduct.name}`, 'success');
    } else {
      showToast(`Barcode / Item code "${query}" not found in inventory.`, 'error');
    }
  };

  // Add Item to Cart
  const addItemToCart = (prod: Product) => {
    const existingIndex = cartItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex > -1) {
      // Increase qty
      const updated = [...cartItems];
      const item = updated[existingIndex];
      const newQty = item.quantity + 1;
      const totalAmount = (item.unitPrice * newQty) - item.discountAmount;
      updated[existingIndex] = { ...item, quantity: newQty, totalAmount };
      setCartItems(updated);
    } else {
      // New line
      const gemSummary = prod.gemstoneDetails.length > 0
        ? `${prod.totalCaratWeight}ct ${prod.gemstoneDetails.map((g) => g.gemType).join(', ')}`
        : undefined;

      const newLine: InvoiceItem = {
        productId: prod.id,
        itemCode: prod.itemCode,
        barcode: prod.barcode,
        name: prod.name,
        category: prod.category,
        gemSummary,
        grossWeight: prod.grossWeight,
        caratWeight: prod.totalCaratWeight,
        quantity: 1,
        unitPrice: prod.sellingPrice,
        discountPercentage: 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: prod.sellingPrice,
      };
      setCartItems([...cartItems, newLine]);
    }
  };

  const updateItemQuantity = (index: number, newQty: number) => {
    if (newQty <= 0) {
      removeItemFromCart(index);
      return;
    }
    const updated = [...cartItems];
    const item = updated[index];
    const lineSubtotal = item.unitPrice * newQty;
    const discountAmt = (lineSubtotal * item.discountPercentage) / 100;
    updated[index] = {
      ...item,
      quantity: newQty,
      discountAmount: discountAmt,
      totalAmount: lineSubtotal - discountAmt,
    };
    setCartItems(updated);
  };

  const updateItemDiscount = (index: number, percent: number) => {
    const updated = [...cartItems];
    const item = updated[index];
    const lineSubtotal = item.unitPrice * item.quantity;
    const discountAmt = (lineSubtotal * percent) / 100;
    updated[index] = {
      ...item,
      discountPercentage: percent,
      discountAmount: discountAmt,
      totalAmount: lineSubtotal - discountAmt,
    };
    setCartItems(updated);
  };

  const removeItemFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemsDiscountSum = cartItems.reduce((sum, item) => sum + item.discountAmount, 0);
  const globalDiscountAmount = ((subtotal - itemsDiscountSum) * globalDiscountPercent) / 100;
  const totalDiscount = itemsDiscountSum + globalDiscountAmount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const taxAmount = (taxableAmount * taxPercent) / 100;
  const grandTotal = Math.round(taxableAmount + taxAmount);

  const amountPaid = amountPaidInput === '' ? grandTotal : Number(amountPaidInput);
  const balanceDue = Math.max(0, grandTotal - amountPaid);

  // Handle Quick Customer Creation
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      alert('Name and phone are required.');
      return;
    }
    const created = addCustomer({
      name: newCustName.trim(),
      contactNumber: newCustPhone.trim(),
      whatsappNumber: newCustPhone.trim(),
      nicPassport: newCustNIC.trim(),
      address: newCustAddress.trim() || 'Colombo',
      city: newCustCity.trim() || 'Colombo',
      customerType: 'Retail',
    });
    setSelectedCustomerId(created.id);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustNIC('');
    setNewCustAddress('');
  };

  // Complete and Save Invoice
  const handleCompleteInvoice = (andPrint = true, andWhatsApp = false) => {
    if (cartItems.length === 0) {
      showToast('Please add at least one jewelry or gemstone item to the invoice.', 'error');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId) || {
      id: 'walk-in',
      name: 'Walk-in Client',
      contactNumber: '+94 77 000 0000',
      address: 'Colombo',
      nicPassport: '',
    };

    const nextNumber = `${settings.invoicePrefix}${Math.floor(1000 + Math.random() * 9000)}`;

    const newInvoice = createInvoice({
      invoiceNumber: nextNumber,
      date: invoiceDate,
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
      amountPaid,
      balanceDue,
      paymentMethod,
      paymentRef: paymentRef.trim() || undefined,
      notes: invoiceNotes.trim() || undefined,
      issuedByUserId: currentUser?.id || 'usr-1',
      issuedByUserName: currentUser?.name || 'Cashier',
      status: balanceDue > 0 ? 'partial' : 'paid',
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (andPrint) {
      setActivePrintInvoice(newInvoice);
    }

    if (andWhatsApp) {
      setActiveWhatsAppInvoice(newInvoice);
    }

    // Reset Cart
    setCartItems([]);
    setGlobalDiscountPercent(0);
    setTaxPercent(0);
    setAmountPaidInput('');
    setPaymentRef('');
    setInvoiceNotes('');
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Bar: Barcode Scanner & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Barcode Scanner Input */}
        <form onSubmit={handleBarcodeSubmit} className="flex-1 relative">
          <Barcode className="w-5 h-5 text-amber-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={barcodeInputRef}
            type="text"
            placeholder="Scan barcode or enter item code (Press Enter)..."
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            className="w-full bg-slate-800 border-2 border-amber-500/50 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-mono transition"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
          >
            Scan / Add
          </button>
        </form>

        {/* Item Text Filter */}
        <div className="relative md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter catalog items..."
            value={searchItemText}
            onChange={(e) => setSearchItemText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Fullscreen Toggle Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-semibold transition ${
            isFullscreen
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20'
              : 'text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border-slate-700'
          }`}
          title={isFullscreen ? 'Exit Fullscreen Mode (F11)' : 'Enter POS Fullscreen Mode (F11)'}
        >
          {isFullscreen ? (
            <Minimize2 className="w-4 h-4 text-amber-400" />
          ) : (
            <Maximize2 className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{isFullscreen ? 'Exit Full' : 'Fullscreen'}</span>
        </button>
      </div>

      {/* Main Dual Pane Layout: Left (Cart / Invoice Details), Right (Product Catalog Browser) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Active Invoice & Billing Form */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer & Invoice Meta Header */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Receipt className="w-4 h-4" />
                Customer & Invoice Details
              </span>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" />
                + Add Customer
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Customer *</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.contactNumber}) [{c.customerType}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Invoice Date *</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {selectedCustomer && (
              <div className="bg-slate-800/50 rounded-lg p-2.5 text-[11px] text-slate-300 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-100">{selectedCustomer.name}</span> | Phone:{' '}
                  {selectedCustomer.contactNumber} | {selectedCustomer.address}, {selectedCustomer.city}
                </div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-bold rounded uppercase text-[10px]">
                  {selectedCustomer.customerType}
                </span>
              </div>
            )}
          </div>

          {/* Cart Items Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                Invoice Line Items ({cartItems.length})
              </h3>
              {cartItems.length > 0 && (
                <button
                  onClick={() => setCartItems([])}
                  className="text-xs text-red-400 hover:text-red-300 transition"
                >
                  Clear All
                </button>
              )}
            </div>

            {cartItems.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Gem className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-sm font-medium">Invoice is currently empty</p>
                <p className="text-xs text-slate-600">
                  Scan a barcode above or click items from the inventory catalog on the right.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-800 font-medium">
                      <th className="py-2 px-2">Item Description</th>
                      <th className="py-2 px-2 text-right">Price</th>
                      <th className="py-2 px-2 text-center">Qty</th>
                      <th className="py-2 px-2 text-center">Disc %</th>
                      <th className="py-2 px-2 text-right">Total</th>
                      <th className="py-2 px-2 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cartItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-2">
                          <p className="font-semibold text-slate-200">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {item.itemCode} | {item.category} {item.grossWeight ? `(${item.grossWeight}g)` : ''}
                          </p>
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-300">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <div className="inline-flex items-center border border-slate-700 rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(idx, item.quantity - 1)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(idx, item.quantity + 1)}
                              className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discountPercentage || ''}
                            onChange={(e) => updateItemDiscount(idx, Number(e.target.value) || 0)}
                            placeholder="0%"
                            className="w-14 bg-slate-800 border border-slate-700 rounded p-1 text-center text-xs text-white focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-2.5 px-2 text-right font-bold text-amber-400">
                          {formatCurrency(item.totalAmount)}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <button
                            onClick={() => removeItemFromCart(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 transition"
                            title="Remove Line"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payment & Calculation Totals Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left: Payment Method & Notes */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payment Mode *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Cash">Cash (LKR)</option>
                    <option value="Bank Transfer / Cheque">Bank Transfer / Cheque</option>
                    <option value="Visa / Master Card">Visa / Master Card POS</option>
                    <option value="Koko / Mintpay">Koko / Mintpay (Buy Now Pay Later)</option>
                    <option value="Credit / Advance Balance">Credit / Customer Advance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Payment Ref / Cheque No</label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-TXN-0029"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Invoice Notes / Guarantee Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Accompanied by NGJA Certificate #901"
                    value={invoiceNotes}
                    onChange={(e) => setInvoiceNotes(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Right: Calculations Summary */}
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3 h-3 text-amber-400" />
                    Overall Discount (%):
                  </span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={globalDiscountPercent || ''}
                    onChange={(e) => setGlobalDiscountPercent(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-right text-xs text-white"
                  />
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>Total Discount:</span>
                    <span>-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-300">
                  <span>Tax Rate (%):</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent || ''}
                    onChange={(e) => setTaxPercent(Number(e.target.value) || 0)}
                    placeholder="0"
                    className="w-16 bg-slate-900 border border-slate-700 rounded p-1 text-right text-xs text-white"
                  />
                </div>

                <div className="border-t border-slate-700 pt-2 flex justify-between text-sm font-bold text-white">
                  <span>Grand Total:</span>
                  <span className="text-amber-400 text-base">{formatCurrency(grandTotal)}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-slate-300 font-medium">Amount Tendered:</span>
                  <input
                    type="number"
                    placeholder={String(grandTotal)}
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    className="w-28 bg-slate-900 border border-slate-700 rounded p-1 text-right text-xs text-emerald-400 font-bold"
                  />
                </div>

                {balanceDue > 0 && (
                  <div className="flex justify-between text-red-400 font-bold text-xs pt-1 border-t border-slate-700">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(balanceDue)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                id="btn-pos-checkout-f8"
                onClick={() => {
                  if (cartItems.length === 0) {
                    showToast('Please add items to cart before proceeding to checkout.', 'error');
                    return;
                  }
                  setShowCheckoutModal(true);
                }}
                disabled={cartItems.length === 0}
                className="w-full py-4 bg-[#F59E0B] hover:bg-[#E08D03] disabled:opacity-50 disabled:pointer-events-none text-[#0F1115] font-black text-sm sm:text-base uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
              >
                <CreditCard className="w-5 h-5" />
                <span>PROCEED TO CHECKOUT / PAY [F8]</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  id="btn-quick-pay-whatsapp"
                  onClick={() => handleCompleteInvoice(false, true)}
                  disabled={cartItems.length === 0}
                  className="py-2.5 px-3 bg-[#172B23] hover:bg-[#1E3A2F] disabled:opacity-40 text-emerald-300 hover:text-emerald-200 font-bold text-xs rounded-xl border border-emerald-600/40 transition flex items-center justify-center gap-1.5 shadow-sm"
                  title="Complete bill & share via WhatsApp"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  Quick WhatsApp
                </button>

                <button
                  type="button"
                  id="btn-quick-pay-print"
                  onClick={() => handleCompleteInvoice(true, false)}
                  disabled={cartItems.length === 0}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Quick Print
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCartItems([]);
                    setGlobalDiscountPercent(0);
                    setTaxPercent(0);
                    showToast('Cart cleared.', 'info');
                  }}
                  disabled={cartItems.length === 0}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 disabled:opacity-40 font-semibold text-xs rounded-xl border border-slate-700 hover:border-rose-800 transition flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Cart
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Product Catalog & Quick Add Grid */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Gem className="w-4 h-4 text-amber-400" />
                Jewelry & Gemstone Catalog ({filteredProducts.length})
              </h3>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['All', ...categories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    selectedCategoryFilter === cat
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => addItemToCart(prod)}
                  className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/50 rounded-xl p-2.5 cursor-pointer transition flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-slate-900 relative">
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                        {prod.itemCode}
                      </span>
                    </div>

                    <div>
                      <p className="font-bold text-slate-200 text-xs line-clamp-2">{prod.name}</p>
                      <p className="text-[10px] text-amber-400/90 mt-0.5">{prod.metalPurity}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-400">{formatCurrency(prod.sellingPrice)}</p>
                      <p className="text-[10px] text-slate-400">
                        Stock: <span className="font-semibold text-slate-200">{prod.stockQuantity}</span>
                      </p>
                    </div>
                    <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-400" />
                Add New Customer
              </h3>
              <button
                onClick={() => setShowAddCustomerModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Menaka Wickramasinghe"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact / WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 123 4567"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">NIC / Passport Number</label>
                <input
                  type="text"
                  placeholder="e.g. 199084920193 / N8921820"
                  value={newCustNIC}
                  onChange={(e) => setNewCustNIC(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Address & City</label>
                <input
                  type="text"
                  placeholder="e.g. No. 24, Galle Road"
                  value={newCustAddress}
                  onChange={(e) => setNewCustAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment & Checkout Modal (matching screenshot UI) */}
      <PaymentCheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        cartItems={cartItems}
        customer={{
          id: selectedCustomer?.id || 'walk-in',
          name: selectedCustomer?.name || 'Walk-in Customer',
          contactNumber: selectedCustomer?.contactNumber || '+94 77 000 0000',
          address: selectedCustomer?.address,
          nicPassport: selectedCustomer?.nicPassport,
        }}
        subtotal={subtotal}
        totalDiscount={totalDiscount}
        taxPercent={taxPercent}
        taxAmount={taxAmount}
        grandTotal={grandTotal}
        invoiceDate={invoiceDate}
        invoiceNotes={invoiceNotes}
        onSuccess={() => {
          setCartItems([]);
          setGlobalDiscountPercent(0);
          setTaxPercent(0);
          setAmountPaidInput('');
          setPaymentRef('');
          setInvoiceNotes('');
        }}
        onWhatsAppSuccess={(inv) => {
          setActiveWhatsAppInvoice(inv);
        }}
      />

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
