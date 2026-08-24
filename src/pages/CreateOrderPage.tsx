import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomOrder, MetalPurity } from '../types';
import {
  Hammer,
  PlusCircle,
  Calendar,
  DollarSign,
  Scale,
  Sparkles,
  Upload,
  UserPlus,
  Image as ImageIcon,
  CheckCircle2,
  Eye,
  User,
  Building,
  Phone,
  FileText,
  Gem,
} from 'lucide-react';
import { ImageUploadField } from '../components/common/ImageUploadField';

export const CreateOrderPage: React.FC = () => {
  const {
    customers,
    addCustomer,
    workshops,
    createOrder,
    settings,
    currentUser,
    setCurrentPage,
    formatCurrency,
    showToast,
  } = useApp();

  const [orderNumber, setOrderNumber] = useState(
    `${settings.orderPrefix}${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [requiredDate, setRequiredDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>(workshops[0]?.id || '');

  // Quick Customer Creation inline
  const [isAddingNewCustomer, setIsAddingNewCustomer] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustCity, setNewCustCity] = useState('Colombo');

  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState('Custom Ring');
  const [metalPurity, setMetalPurity] = useState<MetalPurity>('18K Yellow Gold (750)');
  const [allocatedMetalWeight, setAllocatedMetalWeight] = useState<number>(6.5);
  const [customerProvidedGold, setCustomerProvidedGold] = useState<boolean>(false);
  const [customerProvidedGoldWeight, setCustomerProvidedGoldWeight] = useState<number>(0);
  const [gemstonesProvided, setGemstonesProvided] = useState<string>(
    '1x Natural Ceylon Blue Sapphire 2.80ct (Client Stone), 18x Brilliant Diamonds 0.36ct'
  );
  const [ringSize, setRingSize] = useState('14 (US 7)');
  const [designImageUrl, setDesignImageUrl] = useState(
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80'
  );
  const [estimatedMakingCharges, setEstimatedMakingCharges] = useState<number>(35000);
  const [advancePaidToWorkshop, setAdvancePaidToWorkshop] = useState<number>(15000);
  const [agreedPriceToCustomer, setAgreedPriceToCustomer] = useState<number>(245000);
  const [customerAdvancePaid, setCustomerAdvancePaid] = useState<number>(100000);
  const [craftingInstructions, setCraftingInstructions] = useState(
    'Halo pave setting around center sapphire with high-polish shank finish. Precision prong setting.'
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedWorkshop = workshops.find((w) => w.id === selectedWorkshopId);

  const handleQuickAddCustomer = () => {
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Please enter customer name and contact number.', 'error');
      return;
    }

    const created = addCustomer({
      customerCode: `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newCustName.trim(),
      contactNumber: newCustPhone.trim(),
      address: `${newCustCity}, Sri Lanka`,
      city: newCustCity,
      customerType: 'Retail VIP',
    });

    setSelectedCustomerId(created.id);
    setIsAddingNewCustomer(false);
    setNewCustName('');
    setNewCustPhone('');
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) {
      showToast('Please enter the custom jewelry item name.', 'error');
      return;
    }

    if (!selectedCustomer) {
      showToast('Please select or add a customer for this order.', 'error');
      return;
    }

    if (!designImageUrl) {
      showToast('Please attach or select a JPG design image or sketch.', 'error');
      return;
    }

    createOrder({
      orderNumber,
      orderDate,
      requiredDeliveryDate: requiredDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerPhone: selectedCustomer.contactNumber,
      workshopId: selectedWorkshop?.id || 'ws-1',
      workshopName: selectedWorkshop?.name || 'In-House Studio',
      itemName: itemName.trim(),
      itemCategory,
      designImageUrl,
      metalPurity,
      allocatedMetalWeight,
      customerProvidedGold,
      customerProvidedGoldWeight: customerProvidedGold ? customerProvidedGoldWeight || allocatedMetalWeight : undefined,
      gemstonesProvided,
      ringSize: ringSize.trim() || undefined,
      estimatedMakingCharges,
      agreedPriceToCustomer,
      customerAdvancePaid,
      customerBalanceDue: Math.max(0, agreedPriceToCustomer - customerAdvancePaid),
      advancePaidToWorkshop,
      craftingInstructions,
      status: 'Sent to Workshop',
      paymentStatus:
        customerAdvancePaid >= agreedPriceToCustomer
          ? 'paid'
          : customerAdvancePaid > 0
          ? 'partial'
          : 'pending',
    });

    setCurrentPage('pending_orders');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 text-[#E0E0E0]">
      {/* Top Banner */}
      <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold uppercase tracking-wider mb-1">
            <Hammer className="w-4 h-4" />
            <span>Artisan Custom Manufacturing & Job Card</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-white tracking-tight">
            Create Custom Order with Design (JPG)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Upload custom jewelry CAD renders, sketches, assign Sri Lankan goldsmith workshop, and record client deposit.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentPage('pending_orders')}
          className="px-4 py-2 bg-[#0F1115] hover:bg-[#252932] text-gray-300 text-xs font-bold rounded-xl border border-[#2D3139] transition"
        >
          View Active Pipeline &rarr;
        </button>
      </div>

      <form onSubmit={handleCreateOrder} className="space-y-6 text-xs">
        {/* Bento Grid layout for Form Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 & 2: Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Client & Workshop Assignment */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between border-b border-[#2D3139] pb-3">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  1. Client & Workshop Assignment
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Job Card Auto-Tracking</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Work Order Job # *</label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Order Date *</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Delivery Target Date *</label>
                  <input
                    type="date"
                    required
                    value={requiredDate}
                    onChange={(e) => setRequiredDate(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-bold text-amber-400 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Selector / Quick Add */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-gray-300 font-semibold">Select Customer *</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCustomer(!isAddingNewCustomer)}
                    className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
                  >
                    <UserPlus className="w-3 h-3" />
                    {isAddingNewCustomer ? 'Cancel New Customer' : '+ Add New Customer'}
                  </button>
                </div>

                {isAddingNewCustomer ? (
                  <div className="p-3 bg-[#0F1115] border border-[#D4AF37]/40 rounded-xl space-y-3">
                    <p className="text-[11px] font-bold text-[#D4AF37] uppercase">Quick Register Customer</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={newCustName}
                        onChange={(e) => setNewCustName(e.target.value)}
                        className="bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number (e.g. +94 77 123 4567) *"
                        value={newCustPhone}
                        onChange={(e) => setNewCustPhone(e.target.value)}
                        className="bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="City (e.g. Colombo, Kandy)"
                        value={newCustCity}
                        onChange={(e) => setNewCustCity(e.target.value)}
                        className="bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white text-xs"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickAddCustomer}
                      className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold rounded-lg text-xs hover:bg-yellow-400 transition"
                    >
                      Save & Select Customer
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.contactNumber}) — [{c.city}]
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Workshop Assignment */}
              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Assign Workshop / Guild *</label>
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city}) — Master Goldsmith: {w.contactPerson} ({w.contactNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Jewelry Specifications */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                <Gem className="w-4 h-4" />
                <span>2. Jewelry Specifications & Gemstones</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-gray-300 mb-1 font-semibold">Custom Jewelry Item Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 18K Yellow Gold Cushion Sapphire Halo Ring"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Category</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    <option value="Custom Ring">Custom Ring</option>
                    <option value="Necklace / Pendant">Necklace / Pendant</option>
                    <option value="Earrings Set">Earrings Set</option>
                    <option value="Bangle / Bracelet">Bangle / Bracelet</option>
                    <option value="Wedding Band Set">Wedding Band Set</option>
                    <option value="Brooch / Tiara">Brooch / Tiara</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Metal Purity</label>
                  <select
                    value={metalPurity}
                    onChange={(e) => setMetalPurity(e.target.value as MetalPurity)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  >
                    {[
                      '22K Yellow Gold (916)',
                      '18K Yellow Gold (750)',
                      '18K White Gold (750)',
                      '18K Rose Gold (750)',
                      '14K Gold (585)',
                      'Platinum 950',
                      'Sterling Silver 925',
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Allocated Metal Wt (g)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={allocatedMetalWeight}
                    onChange={(e) => setAllocatedMetalWeight(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Ring / Bangle Size</label>
                  <input
                    type="text"
                    placeholder="e.g. Size 14 (US 7)"
                    value={ringSize}
                    onChange={(e) => setRingSize(e.target.value)}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>
              </div>

              {/* Customer Provided Gold toggle */}
              <div className="p-3 bg-[#0F1115] border border-[#2D3139] rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input
                    type="checkbox"
                    checked={customerProvidedGold}
                    onChange={(e) => setCustomerProvidedGold(e.target.checked)}
                    className="rounded border-[#2D3139] text-[#D4AF37] focus:ring-0"
                  />
                  <span className="font-bold text-[#D4AF37]">Customer Provided Own Old Gold / Scrap Bullion</span>
                </label>

                {customerProvidedGold && (
                  <div className="pt-2 border-t border-[#2D3139] grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Old Gold Weight Received (g)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={customerProvidedGoldWeight || allocatedMetalWeight}
                        onChange={(e) => setCustomerProvidedGoldWeight(Number(e.target.value))}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-2 text-white"
                      />
                    </div>
                    <div>
                      <span className="block text-[11px] text-gray-400 mb-1">Metal Value Deduction</span>
                      <p className="text-xs text-emerald-400 font-mono font-bold mt-2">
                        Offset from total making bill
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Gemstones Provided / Client Stones</label>
                <input
                  type="text"
                  value={gemstonesProvided}
                  onChange={(e) => setGemstonesProvided(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-1 font-semibold">Master Artisan Crafting Instructions</label>
                <textarea
                  rows={2}
                  value={craftingInstructions}
                  onChange={(e) => setCraftingInstructions(e.target.value)}
                  className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Column 3: Design JPG Image Upload & Financial Summary */}
          <div className="space-y-6">
            {/* Design JPG Image Uploader */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                <ImageIcon className="w-4 h-4" />
                <span>Design Sketch / CAD JPG</span>
              </h3>

              <ImageUploadField
                value={designImageUrl}
                onChange={setDesignImageUrl}
                label="Customer Design JPG / Render"
                helperText="Upload custom design photo, CAD 3D sketch, or client reference."
                categoryPresets="design"
              />
            </div>

            {/* Financials & Deposits */}
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-6 space-y-4">
              <h3 className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-[#2D3139] pb-3">
                <DollarSign className="w-4 h-4" />
                <span>3. Financials & Advance Deposit</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Agreed Customer Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={agreedPriceToCustomer}
                    onChange={(e) => setAgreedPriceToCustomer(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold text-base text-[#D4AF37] focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-1 font-semibold">Customer Advance Paid (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={customerAdvancePaid}
                    onChange={(e) => setCustomerAdvancePaid(Number(e.target.value))}
                    className="w-full bg-[#0F1115] border border-[#2D3139] rounded-xl p-2.5 text-white font-mono font-bold text-emerald-400 focus:border-[#D4AF37] focus:outline-none"
                  />
                </div>

                <div className="p-3 bg-[#0F1115] rounded-xl border border-[#2D3139] flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Customer Balance Due:</span>
                  <span className="font-bold text-white font-mono text-sm">
                    {formatCurrency(Math.max(0, agreedPriceToCustomer - customerAdvancePaid))}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#2D3139]">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Est. Workshop Cost</label>
                    <input
                      type="number"
                      value={estimatedMakingCharges}
                      onChange={(e) => setEstimatedMakingCharges(Number(e.target.value))}
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg p-2 text-white text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Workshop Advance Paid</label>
                    <input
                      type="number"
                      value={advancePaidToWorkshop}
                      onChange={(e) => setAdvancePaidToWorkshop(Number(e.target.value))}
                      className="w-full bg-[#0F1115] border border-[#2D3139] rounded-lg p-2 text-white text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3.5 bg-[#D4AF37] hover:bg-[#c4a030] text-[#0F1115] font-bold text-xs rounded-xl shadow-lg shadow-[#D4AF3720] transition flex items-center justify-center gap-2 uppercase tracking-wider"
              >
                <Hammer className="w-4 h-4" />
                Dispatch Order to Workshop & Record Deposit
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
