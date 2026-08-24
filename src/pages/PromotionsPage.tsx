import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  formatPromotionSocialText,
  openWhatsAppShare,
  openFacebookShare,
  cleanWhatsAppPhone,
} from '../utils/shareUtils';
import {
  Megaphone,
  Share2,
  Copy,
  Sparkles,
  Facebook,
  Check,
  Send,
  Calendar,
  Ticket,
  MessageSquare,
  Smartphone,
  Phone,
  Layers,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

export const PromotionsPage: React.FC = () => {
  const { products, customers, settings, formatCurrency, showToast } = useApp();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState<number>(15);
  const [campaignTitle, setCampaignTitle] = useState('Festive Gemstone & Jewelry Special');
  const [couponCode, setCouponCode] = useState('WCSGOLD15');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [customHighlights, setCustomHighlights] = useState(
    '• Handcrafted in Ratnapura\n• Complimentary Ring Resizing & Custom Engraving\n• Free Certificate of Authenticity'
  );
  const [targetPhone, setTargetPhone] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [previewTab, setPreviewTab] = useState<'whatsapp' | 'facebook'>('whatsapp');
  const [copied, setCopied] = useState(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  const originalPrice = selectedProduct?.sellingPrice || 0;
  const discountedPrice = Math.round(originalPrice * (1 - promoDiscountPercent / 100));
  const savings = originalPrice - discountedPrice;

  // Generate formatted promotion message
  const promoMessage = formatPromotionSocialText({
    product: selectedProduct,
    discountPercent: promoDiscountPercent,
    campaignTitle,
    couponCode,
    validUntil,
    settings,
    formatCurrency,
    customHighlights,
  });

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(promoMessage);
      setCopied(true);
      showToast('Promotional copy copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Failed to copy text', 'error');
    }
  };

  const handleShareWhatsAppBroadcast = (preferWeb = false) => {
    openWhatsAppShare(targetPhone, promoMessage, preferWeb);
    showToast(
      targetPhone
        ? `Opening WhatsApp for ${targetPhone}...`
        : 'Opening WhatsApp Broadcast...',
      'info'
    );
  };

  const handleShareFacebook = () => {
    openFacebookShare(settings.website || window.location.origin, promoMessage);
    showToast('Opening Facebook Feed Share dialog...', 'info');
  };

  const handleSelectCustomer = (custId: string) => {
    setSelectedCustomerId(custId);
    const c = customers.find((cust) => cust.id === custId);
    if (c && c.phone) {
      setTargetPhone(c.phone);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Megaphone className="w-4 h-4" />
              <span>Social Marketing & Sales Boost</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-white tracking-tight">
              WhatsApp & Facebook Promotion Campaign Generator
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Create and dispatch high-converting social media promotional offers with automatic discount calculations, Ceylon gemstone guarantee highlights, and one-click WhatsApp broadcast or Facebook feed sharing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-quick-broadcast-whatsapp"
              onClick={() => handleShareWhatsAppBroadcast(false)}
              className="px-4 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>WhatsApp Broadcast</span>
            </button>
            <button
              type="button"
              id="btn-quick-share-facebook"
              onClick={handleShareFacebook}
              className="px-4 py-2.5 bg-[#1877F2] hover:bg-[#166FE5] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition"
            >
              <Facebook className="w-4 h-4 fill-white" />
              <span>Share on Facebook</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Campaign Controls & Target (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Offer & Product Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Campaign Configuration</span>
            </h3>

            {/* Product Selector */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                <span>Select Featured Jewelry / Gemstone *</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {products.length} available
                </span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-amber-500 transition"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatCurrency(p.sellingPrice)} [{p.category}]
                  </option>
                ))}
              </select>
            </div>

            {/* Campaign Headline */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Campaign Headline / Occasion
              </label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                placeholder="e.g. Sinhala & Tamil New Year Gem Special"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Promo Discount Slider */}
            <div className="space-y-1.5 bg-slate-950/70 border border-slate-800 rounded-xl p-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Special Discount</span>
                <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                  {promoDiscountPercent}% OFF
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={promoDiscountPercent}
                onChange={(e) => setPromoDiscountPercent(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>5%</span>
                <span>25%</span>
                <span>50%</span>
                <span>60%</span>
              </div>
            </div>

            {/* Coupon Code & Valid Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Ticket className="w-3.5 h-3.5 text-amber-400" />
                  Promo / Coupon Code
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WCSGOLD15"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white uppercase font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Offer Valid Until
                </label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Custom Highlights */}
            <div>
              <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Special Bullets / Value Additions
              </label>
              <textarea
                value={customHighlights}
                onChange={(e) => setCustomHighlights(e.target.value)}
                rows={3}
                placeholder="• Bullet points..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 text-[11px] focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Card 2: 1-on-1 Customer Target (Optional) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3.5 text-xs">
            <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct Customer Target (Optional)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Quick Select Existing Customer
                </label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white"
                >
                  <option value="">-- Choose VIP Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone || 'No phone'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Target WhatsApp Phone Number
                </label>
                <input
                  type="text"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  placeholder="0771234567 or +94771234567"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white font-mono placeholder-slate-500"
                />
              </div>
            </div>

            {targetPhone && (
              <div className="flex items-center justify-between bg-[#141A26] border border-emerald-500/30 rounded-xl p-2.5">
                <span className="text-[11px] text-slate-300">
                  Direct WhatsApp Target: <strong className="text-emerald-400 font-mono">+{cleanWhatsAppPhone(targetPhone)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => handleShareWhatsAppBroadcast(false)}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg transition"
                >
                  Send 1-on-1
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Dual Previews & Actions (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          {/* Tabs: WhatsApp vs Facebook Preview */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewTab('whatsapp')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  previewTab === 'whatsapp'
                    ? 'bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>WhatsApp Message Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewTab('facebook')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                  previewTab === 'facebook'
                    ? 'bg-[#1877F2]/20 text-[#1877F2] border border-[#1877F2]/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Facebook Feed Preview</span>
              </button>
            </div>

            <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
              {promoMessage.length} characters
            </span>
          </div>

          {/* Product Spotlight Card */}
          {selectedProduct && (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-12 h-12 rounded-xl object-cover border border-amber-500/30 shrink-0 bg-slate-900"
                />
                <div>
                  <h4 className="font-bold text-slate-200 text-xs">{selectedProduct.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Code: {selectedProduct.itemCode} • {selectedProduct.category}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 line-through mr-1">
                    {formatCurrency(originalPrice)}
                  </span>
                  <span className="text-sm font-black text-emerald-400 font-mono">
                    {formatCurrency(discountedPrice)}
                  </span>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Save {formatCurrency(savings)}
                </span>
              </div>
            </div>
          )}

          {/* Preview Container: WhatsApp Theme or Facebook Card */}
          {previewTab === 'whatsapp' ? (
            <div
              className="rounded-2xl p-4 sm:p-5 flex flex-col justify-start relative overflow-hidden shadow-inner border border-[#1F2E24] min-h-[380px]"
              style={{
                backgroundColor: '#0B141A',
                backgroundImage:
                  'radial-gradient(#11231A 1px, transparent 1px), radial-gradient(#11231A 1px, #0B141A 1px)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 10px 10px',
              }}
            >
              {/* WhatsApp Message Bubble */}
              <div className="max-w-[95%] bg-[#005C4B] text-[#E9EDEF] rounded-2xl rounded-tr-xs p-3.5 sm:p-4 shadow-lg text-xs leading-relaxed font-sans relative self-end border border-[#0A6C58]">
                <div className="whitespace-pre-wrap font-sans text-[11.5px] leading-relaxed selection:bg-emerald-300 selection:text-black">
                  {promoMessage}
                </div>

                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 mt-2 font-mono">
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-cyan-300 font-black">✓✓</span>
                </div>
              </div>
            </div>
          ) : (
            /* Facebook Feed Post Preview */
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5 text-xs min-h-[380px]">
              {/* Facebook Post Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-bold text-slate-950 font-serif">
                    W
                  </div>
                  <div>
                    <h5 className="font-bold text-white text-xs">{settings.companyName}</h5>
                    <p className="text-[10px] text-slate-400">Sponsored • 🌐 Public</p>
                  </div>
                </div>
                <div className="text-slate-500">•••</div>
              </div>

              {/* Caption Text */}
              <div className="text-slate-200 text-xs whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800 font-sans">
                {promoMessage}
              </div>

              {/* Media Card */}
              {selectedProduct && (
                <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900">
                  <img
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="w-full h-44 object-cover"
                  />
                  <div className="p-3 bg-slate-900/90 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-mono text-slate-400">
                        {settings.website || 'WWW.WCSGEMS.COM'}
                      </p>
                      <h6 className="font-bold text-white text-xs">{selectedProduct.name}</h6>
                      <p className="text-[11px] text-emerald-400 font-mono font-bold">
                        Special Promo: {formatCurrency(discountedPrice)} ({promoDiscountPercent}% OFF)
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleShareWhatsAppBroadcast(false)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg border border-slate-700"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-2 space-y-2.5">
            <button
              type="button"
              id="btn-copy-promo-text"
              onClick={handleCopyText}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Promo Broadcast Copy'}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-share-whatsapp-action"
                onClick={() => handleShareWhatsAppBroadcast(false)}
                className="py-3 bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 stroke-[2.5]" />
                <span>Broadcast on WhatsApp</span>
              </button>

              <button
                type="button"
                id="btn-share-facebook-action"
                onClick={handleShareFacebook}
                className="py-3 bg-[#1877F2] hover:bg-[#166FE5] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2"
              >
                <Facebook className="w-4 h-4 fill-white" />
                <span>Share to Facebook Feed</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

