import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PurchaseOrder, ProductCategory, MetalPurity, GemstoneType, PaymentMethod } from '../types';
import {
  ShoppingCart,
  PlusCircle,
  Search,
  CheckCircle2,
  Calendar,
  Building,
  DollarSign,
  Gem,
  Scale,
  FileText,
  Printer,
  Eye,
  Trash2,
  Phone,
  Tag,
  ArrowDownRight,
  Sparkles,
  Package,
  CreditCard,
  X,
  ArrowUpRight,
} from 'lucide-react';
import { ImageUploadField } from '../components/common/ImageUploadField';

export const PurchasesPage: React.FC = () => {
  const {
    purchases,
    addPurchase,
    addSupplierPayment,
    setCurrentPage,
    products,
    updateProduct,
    addProduct,
    formatCurrency,
    settings,
    currentUser,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPOForView, setSelectedPOForView] = useState<PurchaseOrder | null>(null);

  // Pay Supplier Quick Modal
  const [payingPO, setPayingPO] = useState<PurchaseOrder | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payMethod, setPayMethod] = useState<PaymentMethod>('Bank Transfer');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');
  const [paySlipPhoto, setPaySlipPhoto] = useState('');
  const [payNotes, setPayNotes] = useState('');

  // Form State
  const [purchaseNumber, setPurchaseNumber] = useState(
    `WCS-PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState('Ratnapura Gem Mines Direct');
  const [supplierPhone, setSupplierPhone] = useState('+94 71 892 1199');
  const [supplierAddress, setSupplierAddress] = useState('Gem Market, Main Street, Ratnapura');
  const [invoicePhotoUrl, setInvoicePhotoUrl] = useState('');
  const [notes, setNotes] = useState('Certified Ceylon sapphire parcel & 24K pure bullion cast bars');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Partial' | 'Due'>('Paid');
  const [paidAmount, setPaidAmount] = useState<number>(325000);

  // Items in current PO
  const [items, setItems] = useState<
    {
      productId?: string;
      itemName: string;
      category: ProductCategory;
      gemType?: GemstoneType;
      caratWeight?: number;
      goldWeightGrams?: number;
      metalPurity?: MetalPurity;
      quantity: number;
      unitCost: number;
      totalCost: number;
      autoAddToCatalog: boolean;
    }[]
  >([
    {
      itemName: 'Rough Ceylon Blue Sapphire Parcel (5 Stones)',
      category: 'Loose Gemstones',
      gemType: 'Blue Sapphire',
      caratWeight: 14.5,
      quantity: 5,
      unitCost: 45000,
      totalCost: 225000,
      autoAddToCatalog: true,
    },
    {
      itemName: '24K Pure Gold Casting Grain (999.9)',
      category: 'Gold Bullion & Coins',
      metalPurity: '22K Yellow Gold (916)',
      goldWeightGrams: 10.0,
      quantity: 1,
      unitCost: 100000,
      totalCost: 100000,
      autoAddToCatalog: false,
    },
  ]);

  // Temporary line state for adding a new line
  const [lineSourceType, setLineSourceType] = useState<'catalog' | 'custom'>('custom');
  const [lineSelectedProductId, setLineSelectedProductId] = useState(products[0]?.id || '');
  const [lineItemName, setLineItemName] = useState('');
  const [lineCategory, setLineCategory] = useState<ProductCategory>('Loose Gemstones');
  const [lineGemType, setLineGemType] = useState<GemstoneType>('Blue Sapphire');
  const [lineCarat, setLineCarat] = useState<number>(2.5);
  const [lineGoldWeight, setLineGoldWeight] = useState<number>(5.0);
  const [lineQty, setLineQty] = useState<number>(1);
  const [lineUnitCost, setLineUnitCost] = useState<number>(50000);

  const calculateTotalAmount = () => {
    return items.reduce((sum, it) => sum + it.totalCost, 0);
  };

  const handleAddLineItem = () => {
    if (lineSourceType === 'catalog') {
      const prod = products.find((p) => p.id === lineSelectedProductId);
      if (!prod) return;
      setItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          itemName: prod.name,
          category: prod.category,
          quantity: lineQty,
          unitCost: lineUnitCost || prod.costPrice,
          totalCost: (lineUnitCost || prod.costPrice) * lineQty,
          autoAddToCatalog: false,
        },
      ]);
    } else {
      if (!lineItemName.trim()) {
        showToast('Please enter an item name.', 'error');
        return;
      }
      setItems((prev) => [
        ...prev,
        {
          itemName: lineItemName.trim(),
          category: lineCategory,
          gemType: lineCategory === 'Loose Gemstones' ? lineGemType : undefined,
          caratWeight: lineCategory === 'Loose Gemstones' ? lineCarat : undefined,
          goldWeightGrams: lineCategory !== 'Loose Gemstones' ? lineGoldWeight : undefined,
          quantity: lineQty,
          unitCost: lineUnitCost,
          totalCost: lineUnitCost * lineQty,
          autoAddToCatalog: true,
        },
      ]);
      setLineItemName('');
    }
  };

  const handleRemoveLineItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePurchaseOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('Please add at least one purchased item line.', 'error');
      return;
    }

    const totalCost = calculateTotalAmount();

    // 1. Process inventory stock increment
    items.forEach((item) => {
      if (item.productId) {
        // Increment existing product stock
        const existingProd = products.find((p) => p.id === item.productId);
        if (existingProd) {
          updateProduct(existingProd.id, {
            stockQuantity: existingProd.stockQuantity + item.quantity,
            costPrice: item.unitCost,
          });
        }
      } else if (item.autoAddToCatalog) {
        // Auto-create product in catalog if not existing
        const codeNum = Math.floor(1000 + Math.random() * 9000);
        addProduct({
          itemCode: `WCS-IN-${codeNum}`,
          barcode: `8902026${codeNum}`,
          name: item.itemName,
          category: item.category,
          metalPurity: item.metalPurity || 'Loose Gemstone (Unmounted)',
          grossWeight: item.goldWeightGrams || (item.caratWeight ? item.caratWeight * 0.2 : 1),
          netGoldWeight: item.goldWeightGrams,
          totalCaratWeight: item.caratWeight || 0,
          costPrice: item.unitCost,
          sellingPrice: Math.round(item.unitCost * 1.35),
          stockQuantity: item.quantity,
          minStockAlert: 2,
          imageUrl:
            item.category === 'Loose Gemstones'
              ? 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1611591475152-47354c8d0047?w=600&auto=format&fit=crop&q=80',
          gemstoneDetails: item.gemType
            ? [
                {
                  gemType: item.gemType,
                  caratWeight: item.caratWeight || 1.0,
                  cutShape: 'Oval Faceted / Rough',
                  origin: 'Ratnapura, Sri Lanka',
                  color: 'Natural Vivid',
                  clarity: 'Eye Clean',
                  treatment: 'Unheated / Natural',
                },
              ]
            : [],
          workshopStatus: 'Ready for Sale',
          description: `Stocked in via Purchase Order #${purchaseNumber} from ${supplierName}`,
        });
      }
    });

    // 2. Add PO record to AppContext
    addPurchase({
      purchaseNumber,
      supplierName: supplierName.trim(),
      supplierPhone: supplierPhone.trim(),
      supplierAddress: supplierAddress.trim(),
      date: purchaseDate,
      items: items.map((it) => ({
        itemName: it.itemName,
        category: it.category,
        gemType: it.gemType,
        caratWeight: it.caratWeight,
        goldWeightGrams: it.goldWeightGrams,
        metalPurity: it.metalPurity,
        quantity: it.quantity,
        unitCost: it.unitCost,
        totalCost: it.totalCost,
      })),
      totalAmount: totalCost,
      paidAmount: paidAmount > totalCost ? totalCost : paidAmount,
      paymentStatus:
        paidAmount >= totalCost ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Due',
      status: 'Received & Stocked',
      notes: `${notes}${invoicePhotoUrl ? ` | Memo Photo Attached` : ''}`,
    });

    setShowAddModal(false);
    // Reset form
    setPurchaseNumber(`WCS-PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setItems([]);
  };

  const filteredPurchases = purchases.filter((po) => {
    const matchesSearch =
      po.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.items.some((i) => i.itemName.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && po.status === statusFilter;
  });

  const totalProcurementSum = purchases.reduce((sum, p) => sum + p.totalAmount, 0);
  const totalPaidSum = purchases.reduce((sum, p) => sum + p.paidAmount, 0);
  const totalBalanceDue = totalProcurementSum - totalPaidSum;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-[#E0E0E0]">
      {/* Top Banner */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <ShoppingCart className="w-4 h-4" />
            <span>Supplier Procurement & Gemstone Inward</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Purchase Orders & Stock-In
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Record supplier orders for loose sapphires, gold bullion bars, and mountings with instant inventory stock updates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentPage('supplier_payments')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-[#1A1D23] hover:bg-[#252932] border border-[#2D3139] text-[#D4AF37] hover:text-yellow-400 text-xs font-bold rounded-xl transition"
          >
            <CreditCard className="w-4 h-4" />
            Supplier Payments Ledger
          </button>
          <button
            onClick={() => {
              setPaidAmount(325000);
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-[#0F1115] text-xs font-bold rounded-xl shadow-lg shadow-[#D4AF3720] transition"
          >
            <PlusCircle className="w-4 h-4" />
            + New Purchase Order
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Procurement Volume
          </span>
          <p className="text-2xl font-bold text-white font-mono mt-1">
            {formatCurrency(totalProcurementSum)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Across {purchases.length} Purchase Memos
          </p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Total Settled to Dealers
          </span>
          <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">
            {formatCurrency(totalPaidSum)}
          </p>
          <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> Cash & Bank Settled
          </p>
        </div>

        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
            Supplier Balance Due
          </span>
          <p className="text-2xl font-bold text-[#D4AF37] font-mono mt-1">
            {formatCurrency(totalBalanceDue)}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Outstanding Dealer Credit
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search PO #, supplier, gemstone, bullion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Received & Stocked', 'Pending Delivery', 'Returned'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === st
                  ? 'bg-[#D4AF37] text-[#0F1115]'
                  : 'bg-[#1A1D23] border border-[#2D3139] text-gray-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Purchases List Table */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F1115] text-gray-400 uppercase text-[10px] font-bold border-b border-[#2D3139]">
              <tr>
                <th className="py-3 px-4">PO Number & Date</th>
                <th className="py-3 px-4">Supplier / Dealer</th>
                <th className="py-3 px-4">Items Stocked In</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th className="py-3 px-4 text-right">Paid Amount</th>
                <th className="py-3 px-4 text-center">Payment</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D3139]">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    No supplier purchase orders found. Click "+ New Purchase Order" to record stock inward.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((po) => (
                  <tr key={po.id} className="hover:bg-[#20242C] transition">
                    <td className="py-3.5 px-4">
                      <p className="font-mono font-bold text-white text-xs">{po.purchaseNumber}</p>
                      <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-500" /> {po.date}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-white">{po.supplierName}</p>
                      <p className="text-[11px] text-gray-400 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-500" /> {po.supplierPhone}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="space-y-0.5">
                        {po.items.map((it, idx) => (
                          <p key={idx} className="text-gray-300 truncate text-[11px]">
                            &bull; {it.quantity}x {it.itemName}
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#D4AF37]">
                      {formatCurrency(po.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-emerald-400">
                      {formatCurrency(po.paidAmount)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          po.paymentStatus === 'Paid'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            : po.paymentStatus === 'Partial'
                            ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                            : 'bg-red-950/60 text-red-400 border border-red-800/60'
                        }`}
                      >
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 bg-[#0F1115] text-gray-300 border border-[#2D3139] rounded text-[10px] font-medium">
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {po.totalAmount > (po.paidAmount || 0) && (
                          <button
                            type="button"
                            onClick={() => {
                              const remaining = Math.max(0, po.totalAmount - (po.paidAmount || 0));
                              setPayingPO(po);
                              setPayAmount(remaining);
                              setPayMethod('Bank Transfer');
                              setPayDate(new Date().toISOString().split('T')[0]);
                              setPayRef('');
                              setPaySlipPhoto('');
                              setPayNotes(`Settlement for PO ${po.purchaseNumber}`);
                            }}
                            className="px-2.5 py-1 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] rounded-lg text-xs font-bold transition inline-flex items-center gap-1 shadow-sm"
                            title="Pay Supplier Balance"
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Pay Due
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setSelectedPOForView(po)}
                          className="px-2.5 py-1 bg-[#0F1115] hover:bg-[#252932] text-[#D4AF37] border border-[#2D3139] rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" /> Voucher
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

      {/* Add New Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 max-w-4xl w-full shadow-2xl text-[#E0E0E0] space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <ShoppingCart className="w-5 h-5 text-[#D4AF37]" />
                  Add Supplier Purchase Order (Stock In)
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Record inward rough parcel, cut sapphires, or bullion. Automatically updates stock.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePurchaseOrder} className="space-y-5 text-xs">
              {/* Section 1: PO & Supplier Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Purchase Memo # *</label>
                  <input
                    type="text"
                    required
                    value={purchaseNumber}
                    onChange={(e) => setPurchaseNumber(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Supplier / Dealer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ratnapura Gem Mine Guild"
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Supplier Phone Number</label>
                  <input
                    type="tel"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Supplier Address / Market Hub</label>
                  <input
                    type="text"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Items Line Builder */}
              <div className="p-4 bg-[#0F1115] border border-[#2D3139] rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    Add Items Line to Purchase Order
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setLineSourceType('custom')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        lineSourceType === 'custom'
                          ? 'bg-[#D4AF37] text-[#0F1115]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      New Gem / Bullion Item
                    </button>
                    <button
                      type="button"
                      onClick={() => setLineSourceType('catalog')}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                        lineSourceType === 'catalog'
                          ? 'bg-[#D4AF37] text-[#0F1115]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      From Existing Catalog
                    </button>
                  </div>
                </div>

                {lineSourceType === 'catalog' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-gray-400 mb-1">Select Catalog Product</label>
                      <select
                        value={lineSelectedProductId}
                        onChange={(e) => {
                          setLineSelectedProductId(e.target.value);
                          const p = products.find((prod) => prod.id === e.target.value);
                          if (p) setLineUnitCost(p.costPrice);
                        }}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Current Stock: {p.stockQuantity}) — Cost: {formatCurrency(p.costPrice)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Inward Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={lineQty}
                        onChange={(e) => setLineQty(Number(e.target.value))}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-gray-400 mb-1">Unit Cost (LKR)</label>
                      <input
                        type="number"
                        value={lineUnitCost}
                        onChange={(e) => setLineUnitCost(Number(e.target.value))}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs font-bold text-[#D4AF37]"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-400 mb-1">Item / Parcel Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Ceylon Natural Sapphire Parcel 5ct"
                          value={lineItemName}
                          onChange={(e) => setLineItemName(e.target.value)}
                          className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Category</label>
                        <select
                          value={lineCategory}
                          onChange={(e) => setLineCategory(e.target.value as ProductCategory)}
                          className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                        >
                          <option value="Loose Gemstones">Loose Gemstones</option>
                          <option value="Gold Bullion & Coins">Gold Bullion & Coins</option>
                          <option value="Rough Gemstone Parcel">Rough Gemstone Parcel</option>
                          <option value="Casting Mounts">Casting Mounts</option>
                          <option value="Diamond Lots">Diamond Lots</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {lineCategory === 'Loose Gemstones' ? (
                        <>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Gem Type</label>
                            <select
                              value={lineGemType}
                              onChange={(e) => setLineGemType(e.target.value as GemstoneType)}
                              className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                            >
                              <option value="Blue Sapphire">Blue Sapphire</option>
                              <option value="Padparadscha">Padparadscha</option>
                              <option value="Ruby">Ruby</option>
                              <option value="Emerald">Emerald</option>
                              <option value="Yellow Sapphire">Yellow Sapphire</option>
                              <option value="Pink Sapphire">Pink Sapphire</option>
                              <option value="Ceylon Alexandrite">Ceylon Alexandrite</option>
                              <option value="Spinel">Spinel</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Carat Wt (cts)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={lineCarat}
                              onChange={(e) => setLineCarat(Number(e.target.value))}
                              className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                            />
                          </div>
                        </>
                      ) : (
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-gray-400 mb-1">Metal / Gold Weight (g)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={lineGoldWeight}
                            onChange={(e) => setLineGoldWeight(Number(e.target.value))}
                            className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={lineQty}
                          onChange={(e) => setLineQty(Number(e.target.value))}
                          className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Unit Cost (LKR)</label>
                        <input
                          type="number"
                          value={lineUnitCost}
                          onChange={(e) => setLineUnitCost(Number(e.target.value))}
                          className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs font-bold text-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="px-3 py-1.5 bg-[#0F1115] hover:bg-[#252932] text-[#D4AF37] border border-[#2D3139] rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> + Add Line Item
                  </button>
                </div>
              </div>

              {/* Items Table in Modal */}
              <div className="border border-[#2D3139] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0F1115] text-gray-400 text-[10px] uppercase font-bold border-b border-[#2D3139]">
                    <tr>
                      <th className="py-2.5 px-3">Item Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Cost</th>
                      <th className="py-2.5 px-3 text-right">Total Cost</th>
                      <th className="py-2.5 px-3 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D3139]">
                    {items.map((it, idx) => (
                      <tr key={idx} className="hover:bg-[#20242C]">
                        <td className="py-2.5 px-3 font-semibold text-white">{it.itemName}</td>
                        <td className="py-2.5 px-3 text-gray-400">{it.category}</td>
                        <td className="py-2.5 px-3 text-center font-bold text-white">{it.quantity}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-gray-300">
                          {formatCurrency(it.unitCost)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D4AF37]">
                          {formatCurrency(it.totalCost)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveLineItem(idx)}
                            className="text-gray-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Upload Supplier Invoice / Memo JPG */}
              <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139]">
                <ImageUploadField
                  value={invoicePhotoUrl}
                  onChange={setInvoicePhotoUrl}
                  label="Supplier Invoice / Receipt Memo (JPG)"
                  helperText="Optional: attach photo of physical supplier invoice or gemological sorting memo."
                  categoryPresets="gemstone"
                />
              </div>

              {/* Financial Settlement */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-[#0F1115] border border-[#2D3139] rounded-xl">
                <div>
                  <span className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Total Inward Cost
                  </span>
                  <p className="text-xl font-bold font-mono text-white">
                    {formatCurrency(calculateTotalAmount())}
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Amount Paid to Dealer (LKR) *
                  </label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white font-mono font-bold text-emerald-400"
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-gray-400 font-semibold mb-1">
                    Remaining Dealer Balance
                  </span>
                  <p className="text-xl font-bold font-mono text-[#D4AF37]">
                    {formatCurrency(Math.max(0, calculateTotalAmount() - paidAmount))}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-3 bg-[#0F1115] hover:bg-[#252932] rounded-xl font-semibold text-gray-300 border border-[#2D3139]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#D4AF37] hover:bg-[#c4a030] text-[#0F1115] font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Save Purchase Order & Stock In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PO View & Print Voucher Modal */}
      {selectedPOForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 max-w-2xl w-full shadow-2xl text-[#E0E0E0] space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-serif">
                  <FileText className="w-5 h-5 text-[#D4AF37]" />
                  Purchase Voucher #{selectedPOForView.purchaseNumber}
                </h3>
                <p className="text-xs text-gray-400">Date: {selectedPOForView.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold rounded-lg text-xs flex items-center gap-1.5 hover:bg-yellow-400 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Voucher
                </button>
                <button
                  onClick={() => setSelectedPOForView(null)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#0F1115] rounded-xl border border-[#2D3139] space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Supplier Info</p>
                  <p className="text-white font-bold text-sm mt-0.5">{selectedPOForView.supplierName}</p>
                  <p className="text-gray-400 font-mono">{selectedPOForView.supplierPhone}</p>
                  <p className="text-gray-400">{selectedPOForView.supplierAddress}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-[10px] uppercase font-bold">Total Inward Cost</p>
                  <p className="text-[#D4AF37] font-bold font-mono text-lg mt-0.5">
                    {formatCurrency(selectedPOForView.totalAmount)}
                  </p>
                  <p className="text-emerald-400 text-xs font-mono">
                    Paid: {formatCurrency(selectedPOForView.paidAmount)}
                  </p>
                  <p className="text-amber-400 text-xs font-mono">
                    Balance: {formatCurrency(selectedPOForView.totalAmount - selectedPOForView.paidAmount)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-[#2D3139] rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0F1115] text-gray-400 text-[10px] uppercase font-bold border-b border-[#2D3139]">
                  <tr>
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Cost (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3139]">
                  {selectedPOForView.items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-2.5 px-3 font-semibold text-white">{it.itemName}</td>
                      <td className="py-2.5 px-3 text-gray-400">{it.category}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-white">{it.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-[#D4AF37]">
                        {formatCurrency(it.totalCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedPOForView.notes && (
              <p className="text-xs text-gray-400 italic">Notes: {selectedPOForView.notes}</p>
            )}
          </div>
        </div>
      )}

      {/* Pay Supplier Quick Modal */}
      {payingPO && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Record Supplier Payment</h3>
                  <p className="text-xs text-gray-400">
                    Settle balance for PO #{payingPO.purchaseNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPayingPO(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#0F1115] border border-[#2D3139] rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Supplier:</span>
                <span className="font-bold text-white">{payingPO.supplierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Purchase:</span>
                <span className="font-mono text-white">{formatCurrency(payingPO.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Already Paid:</span>
                <span className="font-mono text-emerald-400">
                  {formatCurrency(payingPO.paidAmount || 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-[#2D3139] pt-1.5 font-bold">
                <span className="text-[#D4AF37]">Outstanding Balance Due:</span>
                <span className="font-mono text-[#D4AF37]">
                  {formatCurrency(Math.max(0, payingPO.totalAmount - (payingPO.paidAmount || 0)))}
                </span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!payAmount || Number(payAmount) <= 0) {
                  alert('Please enter a valid payment amount.');
                  return;
                }

                addSupplierPayment({
                  paymentNumber: `WCS-SPAY-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                  supplierName: payingPO.supplierName,
                  supplierPhone: payingPO.supplierPhone,
                  purchaseId: payingPO.id,
                  purchaseNumber: payingPO.purchaseNumber,
                  amount: Number(payAmount),
                  paymentDate: payDate,
                  paymentMethod: payMethod,
                  referenceNumber: payRef.trim() || undefined,
                  receiptImageUrl: paySlipPhoto || undefined,
                  notes: payNotes.trim() || undefined,
                  recordedBy: currentUser?.name || 'Saman Jayasinghe (Admin)',
                });

                showToast(`Payment of ${formatCurrency(Number(payAmount))} recorded successfully!`);
                setPayingPO(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Amount to Pay (LKR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={payAmount}
                    onChange={(e) =>
                      setPayAmount(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-white font-mono font-bold focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Payment Method *</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online / Card">Online / Card</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">
                    Bank Slip / Cheque Ref #
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BOC-TX-9902"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-300 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  placeholder="Optional settlement notes..."
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <ImageUploadField
                  value={paySlipPhoto}
                  onChange={(url) => setPaySlipPhoto(url)}
                  label="Cheque / Bank Deposit Slip Photo"
                  helperText="Upload deposit confirmation slip or signed voucher photo."
                  categoryPresets="general"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2D3139]">
                <button
                  type="button"
                  onClick={() => setPayingPO(null)}
                  className="px-4 py-2 bg-[#0F1115] border border-[#2D3139] text-gray-300 rounded-xl hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D4AF37] hover:bg-yellow-400 text-[#0F1115] font-bold rounded-xl shadow-md transition"
                >
                  Confirm & Settle Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
