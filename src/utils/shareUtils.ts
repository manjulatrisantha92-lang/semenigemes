import { Invoice, Product, Settings } from '../types';

/**
 * Clean and format phone number for WhatsApp URL
 * Supports Sri Lankan numbers (07X... -> 947X...) as well as international formats.
 */
export function cleanWhatsAppPhone(phone: string, defaultCountryCode = '94'): string {
  if (!phone) return '';
  // Remove all non-digits except leading plus
  let cleaned = phone.trim().replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0')) {
    cleaned = defaultCountryCode + cleaned.substring(1);
  }
  return cleaned;
}

export interface InvoiceWhatsAppOptions {
  includeLetterhead?: boolean;
  includeItemized?: boolean;
  includePaymentDetails?: boolean;
  includeGuaranteeNote?: boolean;
  includeLocation?: boolean;
  customNote?: string;
}

/**
 * Generate beautifully formatted WhatsApp receipt text for a customer bill
 */
export function formatInvoiceWhatsAppText(
  invoice: Invoice,
  settings: Settings,
  formatCurrency: (amount: number) => string,
  options: InvoiceWhatsAppOptions = {}
): string {
  const {
    includeLetterhead = true,
    includeItemized = true,
    includePaymentDetails = true,
    includeGuaranteeNote = true,
    includeLocation = true,
    customNote = '',
  } = options;

  const displayBillNo = invoice.invoiceNumber.startsWith('INV-')
    ? invoice.invoiceNumber.replace('INV-', '#')
    : `#${invoice.invoiceNumber}`;

  const lines: string[] = [];

  // Header / Letterhead
  if (includeLetterhead) {
    lines.push(`✨ *${(settings.companyName || 'WCS JEWELRY & GEM MANAGEMENT').toUpperCase()}* ✨`);
    if (settings.tagline) {
      lines.push(`_${settings.tagline}_`);
    }
    if (settings.address) {
      lines.push(`📍 ${settings.address}, ${settings.city || 'Colombo'}`);
    }
    if (settings.telephone || settings.whatsappNumber) {
      lines.push(`📞 Tel: ${settings.telephone || settings.whatsappNumber}`);
    }
    if (settings.businessRegistrationNumber) {
      lines.push(`🏛️ Reg / Tax No: ${settings.businessRegistrationNumber}`);
    }
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Invoice Title & Info
  lines.push(`🧾 *OFFICIAL SALES RECEIPT*`);
  lines.push(`🔢 *Invoice No:* \`${displayBillNo}\``);
  lines.push(`📅 *Date & Time:* ${invoice.date} ${invoice.time || ''}`.trim());
  lines.push(`👤 *Customer:* ${invoice.customerName || 'Valued Customer'}`);
  if (invoice.customerPhone) {
    lines.push(`📱 *Contact:* ${invoice.customerPhone}`);
  }
  if (invoice.issuedByUserName) {
    lines.push(`🧑‍💼 *Issued By:* ${invoice.issuedByUserName}`);
  }
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━');

  // Itemized List
  if (includeItemized && invoice.items && invoice.items.length > 0) {
    lines.push(`🛍️ *PURCHASED ITEMS:*`);
    invoice.items.forEach((item, index) => {
      const itemCodeStr = item.itemCode ? ` [${item.itemCode}]` : '';
      const weightStr = item.grossWeight ? ` (${item.grossWeight}g)` : '';
      const caratStr = item.caratWeight ? ` [${item.caratWeight}ct]` : '';
      lines.push(`${index + 1}. *${item.name}*${itemCodeStr}`);
      lines.push(`   ↳ ${item.quantity} x ${formatCurrency(item.unitPrice)}${weightStr}${caratStr} = *${formatCurrency(item.totalAmount)}*`);
    });
    lines.push('───────────────────────');
  }

  // Financial Breakdown
  lines.push(`💵 *Subtotal:* ${formatCurrency(invoice.subtotal)}`);
  if (invoice.totalDiscount > 0) {
    lines.push(`🏷️ *Discount Savings:* -${formatCurrency(invoice.totalDiscount)}`);
  }
  if (invoice.taxAmount > 0) {
    lines.push(`🏛️ *VAT / Tax (${invoice.taxPercentage || 0}%):* +${formatCurrency(invoice.taxAmount)}`);
  }
  lines.push(`⭐ *GRAND TOTAL:* *${formatCurrency(invoice.grandTotal)}*`);

  // Payment Breakdown
  if (includePaymentDetails) {
    lines.push('───────────────────────');
    lines.push(`💳 *Payment Method:* ${invoice.paymentMethod.toUpperCase()}`);
    if (invoice.paymentRef) {
      lines.push(`🔖 *Ref / Auth:* ${invoice.paymentRef}`);
    }
    if (invoice.cashReceived !== undefined && invoice.cashReceived > 0) {
      lines.push(`📥 *Cash Tendered:* ${formatCurrency(invoice.cashReceived)}`);
    }
    if (invoice.changeGiven !== undefined && invoice.changeGiven > 0) {
      lines.push(`🔄 *Change Returned:* ${formatCurrency(invoice.changeGiven)}`);
    }
    if (invoice.balanceDue !== undefined && invoice.balanceDue > 0) {
      lines.push(`⚠️ *Outstanding Balance Due:* *${formatCurrency(invoice.balanceDue)}*`);
    } else {
      lines.push(`✅ *Payment Status:* FULLY PAID`);
    }
  }

  // Custom Note
  if (customNote.trim()) {
    lines.push('───────────────────────');
    lines.push(`📝 *Note:* ${customNote.trim()}`);
  } else if (invoice.notes) {
    lines.push('───────────────────────');
    lines.push(`📝 *Note:* ${invoice.notes}`);
  }

  // Official Guarantee & Warranty
  if (includeGuaranteeNote) {
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('💎 *WCS AUTHENTICITY GUARANTEE*');
    lines.push('• 100% Guaranteed Genuine Natural Ceylon Gemstones & Hallmarked Precious Metals.');
    lines.push('• Lifetime Cleaning & Inspection services complimentary at all WCS branches.');
  }

  // Footer / Location
  if (includeLocation) {
    lines.push('\n🙏 *Thank you for your business!*');
    lines.push(`🌟 We look forward to serving you again at ${settings.companyName || 'WCS'}.`);
    if (settings.email) {
      lines.push(`📧 Email: ${settings.email}`);
    }
  }

  return lines.join('\n');
}

/**
 * Open WhatsApp via API / Web with phone & message
 */
export function openWhatsAppShare(phone: string, text: string, preferWeb = false): void {
  const cleanPhone = cleanWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text);
  
  let url = '';
  if (preferWeb) {
    url = cleanPhone
      ? `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://web.whatsapp.com/send?text=${encodedText}`;
  } else {
    url = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`
      : `https://api.whatsapp.com/send?text=${encodedText}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Open Facebook Feed Share Dialog
 */
export function openFacebookShare(urlToShare: string, quoteText: string): void {
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    urlToShare || window.location.href
  )}&quote=${encodeURIComponent(quoteText)}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Format Promotion Social Broadcast Message for WhatsApp & Facebook
 */
export function formatPromotionSocialText({
  product,
  discountPercent,
  campaignTitle,
  couponCode,
  validUntil,
  settings,
  formatCurrency,
  customHighlights,
}: {
  product?: Product;
  discountPercent: number;
  campaignTitle: string;
  couponCode?: string;
  validUntil?: string;
  settings: Settings;
  formatCurrency: (amount: number) => string;
  customHighlights?: string;
}): string {
  const originalPrice = product?.sellingPrice || 0;
  const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  const savings = originalPrice - discountedPrice;

  const lines: string[] = [
    `✨🔥 *${(settings.companyName || 'WCS JEWELRY & GEMS').toUpperCase()} — ${campaignTitle.toUpperCase()}* 🔥✨`,
    `💎 *EXCLUSIVE LIMITED TIME OFFER* 💎`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  if (product) {
    lines.push(`👑 *Featured Item:* *${product.name}*`);
    lines.push(`🏷️ *Item Code:* \`${product.itemCode}\``);
    if (product.metalPurity) {
      lines.push(`⚖️ *Gold / Purity:* ${product.metalPurity} (${product.grossWeight}g)`);
    }
    if (product.gemstoneDetails && product.gemstoneDetails.length > 0) {
      const gem = product.gemstoneDetails[0];
      lines.push(`🌟 *Ceylon Gemstone:* ${product.totalCaratWeight || gem.caratWeight}ct ${gem.gemType} (${gem.origin || 'Ratnapura, Sri Lanka'})`);
      if (gem.treatment) {
        lines.push(`🔬 *Clarity & Treatment:* ${gem.treatment} Natural`);
      }
    }

    lines.push('\n💰 *PRICING & SAVINGS:*');
    lines.push(`❌ Regular Retail Price: ~${formatCurrency(originalPrice)}~`);
    lines.push(`🔥 *Special Promo Price: ${formatCurrency(discountedPrice)}* (*${discountPercent}% OFF!*)`);
    lines.push(`💵 *You Save: ${formatCurrency(savings)}*`);
  }

  if (couponCode) {
    lines.push(`\n🎟️ *Use Promo Code:* \`${couponCode}\``);
  }

  if (validUntil) {
    lines.push(`⏳ *Offer Valid Until:* ${validUntil}`);
  }

  if (customHighlights) {
    lines.push(`\n✨ *Special Highlights:*\n${customHighlights}`);
  }

  lines.push('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push('📜 *WHY CHOOSE WCS:*');
  lines.push('✅ Official Gemological Laboratory Certificate Included');
  lines.push('✅ 100% Natural Ceylon Unheated Gemstones');
  lines.push('✅ Free Insured Express Delivery across Sri Lanka & Worldwide Courier');
  lines.push('✅ Hallmarked Precious Metals Guarantee');

  lines.push('\n📲 *ORDER / INQUIRE NOW VIA WHATSAPP:*');
  lines.push(`👉 WhatsApp / Call: ${settings.whatsappNumber || settings.telephone || '+94 77 123 4567'}`);
  if (settings.address) {
    lines.push(`📍 Store Visit: ${settings.address}, ${settings.city || 'Colombo'}`);
  }
  if (settings.website) {
    lines.push(`🌐 Website: ${settings.website}`);
  }

  lines.push('\n#SriLankanGems #CeylonSapphire #NaturalSapphire #Ratnapura #FineJewelry #GoldJewellery #WCSGems');

  return lines.join('\n');
}
