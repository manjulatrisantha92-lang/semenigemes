import React, { useState, useEffect } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import {
  formatInvoiceWhatsAppText,
  openWhatsAppShare,
  cleanWhatsAppPhone,
  InvoiceWhatsAppOptions,
} from '../../utils/shareUtils';
import {
  X,
  Share2,
  Copy,
  Check,
  Send,
  Phone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building,
  List,
  CreditCard,
  FileText,
  Smartphone,
} from 'lucide-react';

interface WhatsAppBillModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const WhatsAppBillModal: React.FC<WhatsAppBillModalProps> = ({ invoice, onClose }) => {
  const { settings, formatCurrency, showToast } = useApp();

  // Phone input state (prefilled from invoice)
  const [phoneNumber, setPhoneNumber] = useState<string>(invoice.customerPhone || '');
  const [customNote, setCustomNote] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Formatting Options
  const [options, setOptions] = useState<InvoiceWhatsAppOptions>({
    includeLetterhead: true,
    includeItemized: true,
    includePaymentDetails: true,
    includeGuaranteeNote: true,
    includeLocation: true,
    customNote: '',
  });

  useEffect(() => {
    setOptions((prev) => ({ ...prev, customNote }));
  }, [customNote]);

  // Compute live WhatsApp text
  const messageText = formatInvoiceWhatsAppText(invoice, settings, formatCurrency, options);
  const cleanedPhone = cleanWhatsAppPhone(phoneNumber);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Copy to Clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      showToast('WhatsApp bill text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Failed to copy text. Please select and copy manually.', 'error');
    }
  };

  // Direct WhatsApp Launch
  const handleSendWhatsApp = (preferWeb = false) => {
    if (!phoneNumber.trim()) {
      showToast('Please enter customer WhatsApp phone number', 'error');
      return;
    }

    openWhatsAppShare(phoneNumber, messageText, preferWeb);
    showToast(`Opening WhatsApp for ${invoice.customerName || 'Customer'}...`, 'info');
  };

  // Mobile Native Web Share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice #${invoice.invoiceNumber} - ${settings.companyName}`,
          text: messageText,
        });
        showToast('Shared successfully!', 'success');
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      id="whatsapp-bill-modal-backdrop"
      className="fixed inset-0 z-50 bg-[#07090E]/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
    >
      <div
        id="whatsapp-bill-modal"
        className="bg-[#0F131C] border border-[#222836] rounded-2xl w-full max-w-3xl shadow-2xl text-slate-200 overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#141A26] border-b border-[#222836] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-inner">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <span>Share Customer Bill via WhatsApp</span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  E-Receipt
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Invoice <span className="text-amber-400 font-mono font-bold">#{invoice.invoiceNumber}</span> • Customer:{' '}
                <span className="text-white font-semibold">{invoice.customerName || 'Valued Customer'}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-xl bg-[#1B2232] hover:bg-[#252E42] border border-[#2D364A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left Controls, Right WhatsApp Bubble Preview */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto">
          {/* Left Column: Form & Toggles (5 cols) */}
          <div className="md:col-span-5 space-y-4 text-xs">
            {/* Phone Number Input */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <Phone className="w-3.5 h-3.5" />
                  Customer WhatsApp Number *
                </span>
                {cleanedPhone && (
                  <span className="text-[10px] text-gray-400 font-mono">+{cleanedPhone}</span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 0771234567 or +94 77 123 4567"
                  className="w-full bg-[#161C27] border border-[#293245] rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
              <p className="text-[10.5px] text-gray-400">
                Formats automatically to Sri Lankan (+94) or International format.
              </p>
            </div>

            {/* Custom Greeting / Note */}
            <div className="space-y-1.5">
              <label className="block font-bold text-gray-200 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                Add Custom Message / Note (Optional)
              </label>
              <textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="e.g. Ring size adjustment scheduled for Friday. Thank you for your custom!"
                rows={2}
                className="w-full bg-[#161C27] border border-[#293245] rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition"
              />
            </div>

            {/* Inclusions / Toggles */}
            <div className="bg-[#141A26] border border-[#222B3D] rounded-xl p-3.5 space-y-2.5">
              <p className="font-bold text-gray-300 uppercase tracking-wider text-[10px] border-b border-[#222B3D] pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                Receipt Inclusions
              </p>

              <label className="flex items-center gap-2.5 text-gray-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeLetterhead}
                  onChange={(e) =>
                    setOptions({ ...options, includeLetterhead: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                />
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span>Store Name & VAT Letterhead</span>
              </label>

              <label className="flex items-center gap-2.5 text-gray-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeItemized}
                  onChange={(e) =>
                    setOptions({ ...options, includeItemized: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                />
                <List className="w-3.5 h-3.5 text-gray-400" />
                <span>Itemized Purchased Gem / Gold List</span>
              </label>

              <label className="flex items-center gap-2.5 text-gray-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includePaymentDetails}
                  onChange={(e) =>
                    setOptions({ ...options, includePaymentDetails: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                />
                <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                <span>Payment Mode & Tender Breakdown</span>
              </label>

              <label className="flex items-center gap-2.5 text-gray-300 hover:text-white cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={options.includeGuaranteeNote}
                  onChange={(e) =>
                    setOptions({ ...options, includeGuaranteeNote: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500"
                />
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>WCS Gemstone Authenticity Guarantee</span>
              </label>
            </div>

            {/* Quick Bill Summary Card */}
            <div className="bg-[#0A0D14] border border-[#1F2738] rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Grand Total</p>
                <p className="text-base font-black text-amber-400 font-mono">
                  {formatCurrency(invoice.grandTotal)}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    invoice.balanceDue && invoice.balanceDue > 0
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {invoice.balanceDue && invoice.balanceDue > 0
                    ? `Due: ${formatCurrency(invoice.balanceDue)}`
                    : 'Paid in Full'}
                </span>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {invoice.items?.length || 0} item(s)
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Real WhatsApp Bubble Live Preview (7 cols) */}
          <div className="md:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp Message Preview
              </span>
              <span className="text-[10px] font-mono text-gray-500">
                {messageText.length} characters
              </span>
            </div>

            {/* WhatsApp Chat Container */}
            <div
              className="rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-start relative overflow-hidden shadow-inner border border-[#1F2E24]"
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
                {/* Preformatted text with line breaks */}
                <div className="whitespace-pre-wrap font-sans text-[11.5px] sm:text-xs selection:bg-emerald-300 selection:text-black">
                  {messageText}
                </div>

                {/* Read Receipt & Timestamp */}
                <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200/80 mt-2 font-mono">
                  <span>{currentTime}</span>
                  <span className="text-cyan-300 font-black">✓✓</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 bg-[#141A26] border-t border-[#222836] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-copy-whatsapp-text"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1B2232] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition shadow-sm"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Text'}</span>
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                id="btn-native-share"
                onClick={handleNativeShare}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#1B2232] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition shadow-sm"
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span>Mobile Share</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-open-whatsapp-web"
              onClick={() => handleSendWhatsApp(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-[#172B23] hover:bg-[#1E3A2F] text-emerald-300 hover:text-emerald-200 font-bold text-xs rounded-xl border border-emerald-700/60 transition shadow-sm"
              title="Open in WhatsApp Web browser tab"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Web</span>
            </button>

            <button
              type="button"
              id="btn-send-whatsapp-primary"
              onClick={() => handleSendWhatsApp(false)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#20BD5A] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition transform active:scale-95"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
              <span>Send WhatsApp Bill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
