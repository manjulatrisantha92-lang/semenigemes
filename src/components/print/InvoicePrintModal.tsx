import React, { useState } from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { ThermalBillPrint } from './ThermalBillPrint';
import { A4InvoicePrint } from './A4InvoicePrint';
import { WhatsAppBillModal } from '../modals/WhatsAppBillModal';
import {
  Printer,
  X,
  Copy,
  ExternalLink,
  HelpCircle,
  Download,
  Receipt,
  FileText,
  Tag,
  CheckCircle2,
  Share2,
  Send,
} from 'lucide-react';

interface InvoicePrintModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({ invoice, onClose }) => {
  const { settings, formatCurrency, showToast } = useApp();

  // Print Format: Defaults to 'a4' for A4 paper printout
  const [printFormat, setPrintFormat] = useState<'a4' | 'thermal'>('a4');
  const [printBarcode, setPrintBarcode] = useState<boolean>(true);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);
  const [showItemBarcodesModal, setShowItemBarcodesModal] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  // Bill formatted number (e.g. 0#120 or INV-000120)
  const displayBillNo = invoice.invoiceNumber.startsWith('INV-')
    ? invoice.invoiceNumber.replace('INV-', '0#')
    : invoice.invoiceNumber;

  const displayDateTime = `${invoice.date} ${invoice.time || '09:24 PM'}`;

  // Copy plain text receipt to clipboard
  const handleCopyText = async () => {
    const divider = '------------------------------------------';
    const lines: string[] = [
      settings.companyName || 'WCS RESTAURANT & FOODS',
      `${settings.address || 'No 184/B, Galle Road, Bambalapitiya'}, ${settings.city || 'Colombo 04'}`,
      `Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}`,
      `VAT Reg: ${settings.taxRegistrationNo || 'VAT-10928374-7000'}`,
      divider,
      displayDateTime,
      `Sales Receipt ${displayBillNo}           Store: 1`,
      divider,
      `Cashier: ${invoice.issuedByUserName || 'Kasun Weerasinghe (Admin)'}`,
      `Customer: ${invoice.customerName || 'Walk-in Customer'}`,
      divider,
      'Qty  Item Name             U/Price      Total',
    ];

    invoice.items.forEach((it) => {
      const name = it.name.padEnd(20, ' ').substring(0, 20);
      const qty = String(it.quantity).padEnd(4, ' ');
      const unit = it.unitPrice.toFixed(2).padStart(9, ' ');
      const total = it.totalAmount.toFixed(2).padStart(9, ' ');
      lines.push(`${qty} ${name} ${unit} ${total}`);
    });

    lines.push(divider);
    lines.push(`Subtotal:                    ${invoice.subtotal.toFixed(2)}`);
    if (invoice.totalDiscount > 0) {
      lines.push(`Discount:                   -${invoice.totalDiscount.toFixed(2)}`);
    }
    if (invoice.taxAmount > 0) {
      lines.push(`VAT/Tax:                    +${invoice.taxAmount.toFixed(2)}`);
    }
    lines.push(`RECEIPT TOTAL:               ${invoice.grandTotal.toFixed(2)}`);
    lines.push(divider);
    if (invoice.cashReceived) {
      lines.push(`Amount Tendered:             ${invoice.cashReceived.toFixed(2)}`);
      lines.push(`Change Given:                ${(invoice.changeGiven || 0).toFixed(2)}`);
    }
    lines.push(`Payment: ${invoice.paymentMethod.toUpperCase()}`);
    lines.push(divider);
    lines.push('Thank You For Your Business! Come Again.');
    lines.push('System by WCS POS');

    const textToCopy = lines.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Sales bill text copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy text. Permission denied.', 'error');
    }
  };

  // Open standalone print tab for crystal clear printing on A4 or Thermal
  const handlePrintPageStandalone = () => {
    let htmlContent = '';

    if (printFormat === 'a4') {
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Invoice A4 - ${invoice.invoiceNumber}</title>
            <style>
              @page {
                size: A4 portrait;
                margin: 15mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                font-size: 13px;
                line-height: 1.4;
                color: #000;
                background: #fff;
                width: 100%;
                max-width: 180mm;
                margin: 0 auto;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .header-title { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px; }
              .header-sub { font-size: 13px; color: #333; }
              .divider { border-top: 2px solid #000; margin: 12px 0; }
              .thin-divider { border-top: 1px solid #ddd; margin: 6px 0; }
              .flex-row { display: flex; justify-content: space-between; align-items: baseline; }
              .meta-row { font-size: 13px; margin-bottom: 3px; }
              table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
              th { text-align: left; border-bottom: 2px solid #000; padding: 6px 4px; font-weight: 900; }
              td { padding: 6px 4px; vertical-align: top; border-bottom: 1px solid #eee; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .font-mono { font-family: "Courier New", Courier, monospace; }
              .grand-total { font-size: 17px; font-weight: 900; border-top: 2px solid #000; padding-top: 6px; }
              .barcode-box { text-align: center; margin-top: 18px; }
              .footer-text { margin-top: 15px; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="center">
              <div class="header-title">${settings.companyName || 'WCS RESTAURANT & FOODS'}</div>
              <div class="header-sub">${settings.address || 'No 184/B, Galle Road, Bambalapitiya'}, ${settings.city || 'Colombo 04'}</div>
              <div class="header-sub">Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}</div>
              <div class="bold" style="font-size: 12px; margin-top: 2px;">VAT Reg: ${settings.taxRegistrationNo || 'VAT-10928374-7000'}</div>
            </div>

            <div class="divider"></div>
            <div class="meta-row">${displayDateTime}</div>
            <div class="flex-row bold meta-row" style="font-size: 15px;">
              <span>Sales Receipt ${displayBillNo}</span>
              <span>Store: 1</span>
            </div>

            <div class="divider"></div>
            <div class="meta-row"><strong>Cashier:</strong> ${invoice.issuedByUserName || 'Kasun Weerasinghe (Admin)'}</div>
            <div class="meta-row"><strong>Customer:</strong> ${invoice.customerName || 'Walk-in Customer'} (සාමාන්‍ය පාරිභෝගිකයා)</div>

            <div class="divider"></div>
            <table>
              <thead>
                <tr>
                  <th style="width: 45px; text-align: center;">Qty</th>
                  <th>Item Name</th>
                  <th class="text-right" style="width: 110px;">U/Price</th>
                  <th class="text-right" style="width: 110px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (it) => `
                  <tr>
                    <td class="text-center bold" style="font-size: 14px;">${it.quantity}</td>
                    <td><strong>${it.name}</strong></td>
                    <td class="text-right font-mono">${it.unitPrice.toFixed(2)}</td>
                    <td class="text-right font-mono bold" style="font-size: 14px;">${it.totalAmount.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="divider"></div>
            <div class="flex-row" style="margin-bottom: 4px;">
              <span class="bold">Subtotal:</span>
              <span class="font-mono bold">${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${
              invoice.totalDiscount > 0
                ? `<div class="flex-row" style="margin-bottom: 4px; color: #333;"><span>Discount:</span><span class="font-mono">-${invoice.totalDiscount.toFixed(2)}</span></div>`
                : ''
            }
            ${
              invoice.taxAmount > 0
                ? `<div class="flex-row" style="margin-bottom: 4px; color: #333;"><span>VAT / Tax (${invoice.taxPercentage}%):</span><span class="font-mono">+${invoice.taxAmount.toFixed(2)}</span></div>`
                : ''
            }
            <div class="flex-row grand-total">
              <span>RECEIPT TOTAL:</span>
              <span class="font-mono">${invoice.grandTotal.toFixed(2)}</span>
            </div>

            <div class="divider"></div>
            ${
              invoice.cashReceived
                ? `
              <div class="flex-row" style="margin-bottom: 4px;">
                <span class="bold">Amount Tendered:</span>
                <span class="font-mono bold">${invoice.cashReceived.toFixed(2)}</span>
              </div>
              <div class="flex-row bold" style="margin-bottom: 4px; font-size: 14px;">
                <span>Change Given:</span>
                <span class="font-mono">${(invoice.changeGiven || 0).toFixed(2)}</span>
              </div>
            `
                : ''
            }
            <div class="flex-row">
              <span class="bold">Payment:</span>
              <span class="bold">${invoice.paymentMethod.toUpperCase()}</span>
            </div>

            ${
              printBarcode
                ? `
              <div class="barcode-box">
                <svg width="220" height="42" viewBox="0 0 160 36">
                  <rect x="5" y="2" width="2" height="28" fill="#000"/>
                  <rect x="9" y="2" width="1" height="28" fill="#000"/>
                  <rect x="12" y="2" width="3" height="28" fill="#000"/>
                  <rect x="17" y="2" width="1" height="28" fill="#000"/>
                  <rect x="20" y="2" width="2" height="28" fill="#000"/>
                  <rect x="24" y="2" width="3" height="28" fill="#000"/>
                  <rect x="29" y="2" width="1" height="28" fill="#000"/>
                  <rect x="32" y="2" width="4" height="28" fill="#000"/>
                  <rect x="38" y="2" width="2" height="28" fill="#000"/>
                  <rect x="42" y="2" width="1" height="28" fill="#000"/>
                  <rect x="45" y="2" width="3" height="28" fill="#000"/>
                  <rect x="50" y="2" width="2" height="28" fill="#000"/>
                  <rect x="54" y="2" width="1" height="28" fill="#000"/>
                  <rect x="57" y="2" width="4" height="28" fill="#000"/>
                  <rect x="63" y="2" width="2" height="28" fill="#000"/>
                  <rect x="67" y="2" width="1" height="28" fill="#000"/>
                  <rect x="70" y="2" width="3" height="28" fill="#000"/>
                  <rect x="75" y="2" width="2" height="28" fill="#000"/>
                  <rect x="79" y="2" width="1" height="28" fill="#000"/>
                  <rect x="82" y="2" width="3" height="28" fill="#000"/>
                  <rect x="87" y="2" width="2" height="28" fill="#000"/>
                  <rect x="91" y="2" width="4" height="28" fill="#000"/>
                  <rect x="97" y="2" width="1" height="28" fill="#000"/>
                  <rect x="100" y="2" width="3" height="28" fill="#000"/>
                  <rect x="105" y="2" width="2" height="28" fill="#000"/>
                  <rect x="109" y="2" width="1" height="28" fill="#000"/>
                  <rect x="112" y="2" width="4" height="28" fill="#000"/>
                  <rect x="118" y="2" width="2" height="28" fill="#000"/>
                  <rect x="122" y="2" width="3" height="28" fill="#000"/>
                  <rect x="127" y="2" width="1" height="28" fill="#000"/>
                  <rect x="130" y="2" width="2" height="28" fill="#000"/>
                  <rect x="134" y="2" width="3" height="28" fill="#000"/>
                  <rect x="139" y="2" width="1" height="28" fill="#000"/>
                  <rect x="142" y="2" width="4" height="28" fill="#000"/>
                  <rect x="148" y="2" width="2" height="28" fill="#000"/>
                  <rect x="152" y="2" width="2" height="28" fill="#000"/>
                </svg>
                <div style="font-size: 11px; letter-spacing: 2px; font-weight: bold; font-family: monospace;">*${invoice.invoiceNumber}*</div>
              </div>
            `
                : ''
            }

            <div class="center footer-text">
              <div class="bold" style="font-size: 14px;">Thank You For Your Business!</div>
              <div style="font-style: italic; color: #444; margin-top: 2px;">Come Again.</div>
              <div style="font-size: 10px; color: #777; margin-top: 6px;">System by WCS POS</div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;
    } else {
      // 80mm Thermal Mode
      htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Bill - ${invoice.invoiceNumber}</title>
            <style>
              @page {
                size: 80mm auto;
                margin: 0mm;
              }
              body {
                margin: 0;
                padding: 10px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 11px;
                line-height: 1.35;
                color: #000;
                background: #fff;
                width: 72mm;
              }
              .center { text-align: center; }
              .bold { font-weight: bold; }
              .header-title { font-size: 13px; font-weight: 900; text-transform: uppercase; }
              .divider { border-top: 1px dashed #000; margin: 6px 0; }
              .solid-divider { border-top: 1px solid #000; margin: 6px 0; }
              .flex-row { display: flex; justify-content: space-between; }
              table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
              th { text-align: left; border-bottom: 1px solid #000; padding: 2px 0; }
              td { padding: 3px 0; vertical-align: top; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .grand-total { font-size: 12px; font-weight: 900; }
              .barcode { text-align: center; margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="center">
              <div class="header-title">${settings.companyName || 'WCS RESTAURANT & FOODS'}</div>
              <div>${settings.address || 'No 184/B, Galle Road, Bambalapitiya'}, ${settings.city || 'Colombo 04'}</div>
              <div>Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}</div>
              <div>VAT Reg: ${settings.taxRegistrationNo || 'VAT-10928374-7000'}</div>
            </div>

            <div class="solid-divider"></div>
            <div>${displayDateTime}</div>
            <div class="flex-row bold">
              <span>Sales Receipt ${displayBillNo}</span>
              <span>Store: 1</span>
            </div>

            <div class="solid-divider"></div>
            <div><strong>Cashier:</strong> ${invoice.issuedByUserName || 'Kasun Weerasinghe (Admin)'}</div>
            <div><strong>Customer:</strong> ${invoice.customerName || 'Walk-in Customer'} (සාමාන්‍ය පාරිභෝගිකයා)</div>

            <div class="solid-divider"></div>
            <table>
              <thead>
                <tr>
                  <th style="width:24px; text-align:center;">Qty</th>
                  <th>Item Name</th>
                  <th class="text-right">U/Price</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  .map(
                    (it) => `
                  <tr>
                    <td class="text-center bold">${it.quantity}</td>
                    <td>${it.name}</td>
                    <td class="text-right">${it.unitPrice.toFixed(2)}</td>
                    <td class="text-right bold">${it.totalAmount.toFixed(2)}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>

            <div class="solid-divider"></div>
            <div class="flex-row">
              <span>Subtotal:</span>
              <span>${invoice.subtotal.toFixed(2)}</span>
            </div>
            ${
              invoice.totalDiscount > 0
                ? `<div class="flex-row"><span>Discount:</span><span>-${invoice.totalDiscount.toFixed(2)}</span></div>`
                : ''
            }
            ${
              invoice.taxAmount > 0
                ? `<div class="flex-row"><span>VAT / Tax (${invoice.taxPercentage}%):</span><span>+${invoice.taxAmount.toFixed(2)}</span></div>`
                : ''
            }
            <div class="solid-divider"></div>
            <div class="flex-row grand-total">
              <span>RECEIPT TOTAL:</span>
              <span>${invoice.grandTotal.toFixed(2)}</span>
            </div>

            <div class="solid-divider"></div>
            ${
              invoice.cashReceived
                ? `
              <div class="flex-row">
                <span>Amount Tendered:</span>
                <span>${invoice.cashReceived.toFixed(2)}</span>
              </div>
              <div class="flex-row bold">
                <span>Change Given:</span>
                <span>${(invoice.changeGiven || 0).toFixed(2)}</span>
              </div>
            `
                : ''
            }
            <div class="flex-row">
              <span>Payment:</span>
              <span class="bold">${invoice.paymentMethod.toUpperCase()}</span>
            </div>

            ${
              printBarcode
                ? `
              <div class="barcode">
                <svg width="180" height="36" viewBox="0 0 160 36">
                  <rect x="5" y="2" width="2" height="28" fill="#000"/>
                  <rect x="9" y="2" width="1" height="28" fill="#000"/>
                  <rect x="12" y="2" width="3" height="28" fill="#000"/>
                  <rect x="17" y="2" width="1" height="28" fill="#000"/>
                  <rect x="20" y="2" width="2" height="28" fill="#000"/>
                  <rect x="24" y="2" width="3" height="28" fill="#000"/>
                  <rect x="29" y="2" width="1" height="28" fill="#000"/>
                  <rect x="32" y="2" width="4" height="28" fill="#000"/>
                  <rect x="38" y="2" width="2" height="28" fill="#000"/>
                  <rect x="42" y="2" width="1" height="28" fill="#000"/>
                  <rect x="45" y="2" width="3" height="28" fill="#000"/>
                  <rect x="50" y="2" width="2" height="28" fill="#000"/>
                  <rect x="54" y="2" width="1" height="28" fill="#000"/>
                  <rect x="57" y="2" width="4" height="28" fill="#000"/>
                  <rect x="63" y="2" width="2" height="28" fill="#000"/>
                  <rect x="67" y="2" width="1" height="28" fill="#000"/>
                  <rect x="70" y="2" width="3" height="28" fill="#000"/>
                  <rect x="75" y="2" width="2" height="28" fill="#000"/>
                  <rect x="79" y="2" width="1" height="28" fill="#000"/>
                  <rect x="82" y="2" width="3" height="28" fill="#000"/>
                  <rect x="87" y="2" width="2" height="28" fill="#000"/>
                  <rect x="91" y="2" width="4" height="28" fill="#000"/>
                  <rect x="97" y="2" width="1" height="28" fill="#000"/>
                  <rect x="100" y="2" width="3" height="28" fill="#000"/>
                  <rect x="105" y="2" width="2" height="28" fill="#000"/>
                  <rect x="109" y="2" width="1" height="28" fill="#000"/>
                  <rect x="112" y="2" width="4" height="28" fill="#000"/>
                  <rect x="118" y="2" width="2" height="28" fill="#000"/>
                  <rect x="122" y="2" width="3" height="28" fill="#000"/>
                  <rect x="127" y="2" width="1" height="28" fill="#000"/>
                  <rect x="130" y="2" width="2" height="28" fill="#000"/>
                  <rect x="134" y="2" width="3" height="28" fill="#000"/>
                  <rect x="139" y="2" width="1" height="28" fill="#000"/>
                  <rect x="142" y="2" width="4" height="28" fill="#000"/>
                  <rect x="148" y="2" width="2" height="28" fill="#000"/>
                  <rect x="152" y="2" width="2" height="28" fill="#000"/>
                </svg>
                <div style="font-size: 9px; letter-spacing: 2px;">*${invoice.invoiceNumber}*</div>
              </div>
            `
                : ''
            }

            <div class="center" style="margin-top: 8px; font-size: 9.5px;">
              <div class="bold">Thank You For Your Business!</div>
              <div style="font-style: italic;">Come Again.</div>
              <div style="font-size: 8px; color: #555; margin-top: 4px;">System by WCS POS</div>
            </div>

            <script>
              window.onload = function() {
                window.print();
              };
            </script>
          </body>
        </html>
      `;
    }

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, '_blank');
    if (!printWin) {
      showToast('Pop-up blocked. Please allow pop-ups to open print tab.', 'error');
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07090E]/90 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-5 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div className="w-full max-w-2xl bg-[#0F131C] border border-[#222836] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:bg-white print:max-w-none">
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#121622] border-b border-[#222836] flex flex-wrap items-center justify-between gap-3 print:hidden">
          {/* Left: Checkmark + Bill Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Sales Bill – {displayBillNo}</span>
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                {displayDateTime}
              </p>
            </div>
          </div>

          {/* Right: Format Selector (A4 Sheet & 80mm Thermal) & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#090C12] p-1 rounded-xl border border-[#262D3D]">
              <button
                type="button"
                id="tab-a4-sheet"
                onClick={() => setPrintFormat('a4')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  printFormat === 'a4'
                    ? 'bg-[#059669] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Paper</span>
              </button>

              <button
                type="button"
                id="tab-80mm-thermal"
                onClick={() => setPrintFormat('thermal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  printFormat === 'thermal'
                    ? 'bg-[#059669] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>80mm Thermal</span>
              </button>
            </div>

            <button
              type="button"
              id="btn-close-print-modal"
              onClick={onClose}
              className="p-2 bg-[#1A202C] hover:bg-[#252E3E] text-gray-400 hover:text-white rounded-xl border border-[#2D364A] transition"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Header Toolbar */}
        <div className="px-4 py-2.5 bg-[#0D1017] border-b border-[#1D2330] flex flex-wrap items-center justify-between gap-2.5 print:hidden text-xs">
          {/* Print Barcode Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-gray-200 font-semibold hover:text-white">
            <input
              type="checkbox"
              checked={printBarcode}
              onChange={(e) => setPrintBarcode(e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-emerald-400 font-black tracking-tighter text-sm font-mono">
              ||||
            </span>
            <span>Print Scannable Barcode on Bill</span>
          </label>

          {/* Right quick tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowItemBarcodesModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D2820] hover:bg-[#133A2F] text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-800/60 font-semibold text-[11px] transition shadow-sm"
            >
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>Item Barcodes</span>
            </button>
          </div>
        </div>

        {/* Tip notice banner */}
        <div className="px-4 py-2 bg-[#1A180E] border-b border-amber-900/30 text-amber-300/90 text-[11px] flex items-center gap-2 print:hidden">
          <span>💡</span>
          <span>
            <strong>A4 Printout Mode:</strong> Click{' '}
            <strong className="text-amber-200 underline cursor-pointer" onClick={handlePrintPageStandalone}>
              Print Page
            </strong>{' '}
            or <strong>Print Bill</strong> to print clean A4 paper format without unnecessary sub-details.
          </span>
        </div>

        {/* Document Preview Area */}
        <div className="p-4 sm:p-6 bg-[#090C12] flex justify-center items-start overflow-y-auto max-h-[58vh] print:max-h-none print:overflow-visible print:p-0 print:bg-white">
          {printFormat === 'a4' ? (
            <div className="w-full max-w-[210mm] shadow-2xl rounded-sm">
              <A4InvoicePrint
                invoice={invoice}
                onClose={onClose}
                hideModalWrapper={true}
                showBarcode={printBarcode}
              />
            </div>
          ) : (
            <div className="shadow-2xl rounded-sm">
              <ThermalBillPrint invoice={invoice} showBarcode={printBarcode} />
            </div>
          )}
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[#121622] border-t border-[#222836] flex flex-col gap-3 print:hidden">
          {/* Row 1: Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              id="btn-share-whatsapp-bill"
              onClick={() => setShowWhatsAppModal(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#172B23] hover:bg-[#1E3A2F] text-emerald-300 hover:text-emerald-200 font-bold text-xs rounded-xl border border-emerald-700/60 transition shadow-sm"
              title="Share digital e-receipt on WhatsApp"
            >
              <Send className="w-3.5 h-3.5 text-emerald-400" />
              <span>Share WhatsApp</span>
            </button>

            <button
              type="button"
              id="btn-copy-text"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>

            <button
              type="button"
              id="btn-print-page-tab"
              onClick={handlePrintPageStandalone}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Page</span>
            </button>

            <button
              type="button"
              id="btn-setup-guide"
              onClick={() => setShowSetupGuide(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Printer Guide</span>
            </button>

            <button
              type="button"
              id="btn-download-pdf"
              onClick={handlePrintPageStandalone}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Row 2: Dual Action Buttons (Print & WhatsApp) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <button
              type="button"
              id="btn-quick-whatsapp-share"
              onClick={() => setShowWhatsAppModal(true)}
              className="sm:col-span-4 py-3.5 bg-[#172B23] hover:bg-[#1E3A2F] text-emerald-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-emerald-500/40 shadow-md transition flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Bill</span>
            </button>

            <button
              type="button"
              id="btn-print-bill-primary"
              onClick={handlePrintPageStandalone}
              className="sm:col-span-8 py-3.5 bg-[#059669] hover:bg-[#10B981] text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print A4 Paper Bill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Printer Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#2D364A] max-w-md w-full rounded-2xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="font-black text-base flex items-center gap-2 text-emerald-400">
                <HelpCircle className="w-5 h-5" />
                <span>A4 Paper & Printer Guide</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSetupGuide(false)}
                className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs space-y-2.5 text-gray-300 leading-relaxed">
              <div className="bg-[#1A202C] p-3 rounded-xl border border-[#2B3548] space-y-1">
                <p className="font-bold text-white">Recommended Settings for A4 Paper:</p>
                <p>• <strong>Destination:</strong> Your Standard Printer / Save as PDF</p>
                <p>• <strong>Paper size:</strong> A4 (210 × 297 mm)</p>
                <p>• <strong>Layout:</strong> Portrait</p>
                <p>• <strong>Margins:</strong> Default or Minimum</p>
                <p>• <strong>Headers & Footers:</strong> Unchecked (Off)</p>
              </div>

              <p className="text-[11px] text-gray-400">
                Use the <strong className="text-white">Print Page</strong> button to open a dedicated standalone print tab with clean A4 layout.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSetupGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* Item Barcodes Tag Modal */}
      {showItemBarcodesModal && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#2D364A] max-w-lg w-full rounded-2xl p-5 shadow-2xl text-white space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="font-black text-base flex items-center gap-2 text-emerald-400">
                <Tag className="w-5 h-5" />
                <span>Purchased Item Barcode Tags</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowItemBarcodesModal(false)}
                className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {invoice.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white text-black p-3 rounded-xl border border-gray-300 font-mono flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-black text-sm">{item.name}</p>
                    <p className="text-[11px] text-gray-700">Code: {item.itemCode || 'SKU-' + idx}</p>
                    <p className="text-[11px] text-gray-700">Price: {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="text-center">
                    <svg width="120" height="28" viewBox="0 0 160 36">
                      <rect x="5" y="2" width="2" height="28" fill="#000"/>
                      <rect x="9" y="2" width="2" height="28" fill="#000"/>
                      <rect x="14" y="2" width="4" height="28" fill="#000"/>
                      <rect x="22" y="2" width="2" height="28" fill="#000"/>
                      <rect x="28" y="2" width="3" height="28" fill="#000"/>
                      <rect x="34" y="2" width="1" height="28" fill="#000"/>
                      <rect x="38" y="2" width="3" height="28" fill="#000"/>
                      <rect x="45" y="2" width="2" height="28" fill="#000"/>
                      <rect x="52" y="2" width="4" height="28" fill="#000"/>
                      <rect x="60" y="2" width="2" height="28" fill="#000"/>
                      <rect x="66" y="2" width="3" height="28" fill="#000"/>
                      <rect x="74" y="2" width="2" height="28" fill="#000"/>
                      <rect x="80" y="2" width="4" height="28" fill="#000"/>
                      <rect x="88" y="2" width="2" height="28" fill="#000"/>
                      <rect x="94" y="2" width="3" height="28" fill="#000"/>
                      <rect x="102" y="2" width="2" height="28" fill="#000"/>
                      <rect x="110" y="2" width="3" height="28" fill="#000"/>
                    </svg>
                    <p className="text-[9px] font-bold">*{item.itemCode || 'SKU-' + idx}*</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowItemBarcodesModal(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Bill Share Modal */}
      {showWhatsAppModal && (
        <WhatsAppBillModal
          invoice={invoice}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}
    </div>
  );
};
