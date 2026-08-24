import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, Share2, Download } from 'lucide-react';

interface A4InvoicePrintProps {
  invoice: Invoice;
  onClose: () => void;
  hideModalWrapper?: boolean;
  showBarcode?: boolean;
}

export const A4InvoicePrint: React.FC<A4InvoicePrintProps> = ({
  invoice,
  onClose,
  hideModalWrapper = false,
  showBarcode = true,
}) => {
  const { settings, formatCurrency, showToast } = useApp();

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const phone = invoice.customerPhone.replace(/[^0-9]/g, '');
    const itemsSummary = invoice.items
      .map((i) => `• ${i.name} (Qty: ${i.quantity}) - ${formatCurrency(i.totalAmount)}`)
      .join('\n');

    const displayBillNo = invoice.invoiceNumber.startsWith('INV-')
      ? invoice.invoiceNumber.replace('INV-', '0#')
      : invoice.invoiceNumber;

    const message = `*${(settings.companyName || 'WCS RESTAURANT & FOODS').toUpperCase()}*\n*SALES RECEIPT / INVOICE*\n\n📄 *Receipt No:* ${displayBillNo}\n📅 *Date:* ${invoice.date} ${invoice.time || ''}\n👤 *Customer:* ${invoice.customerName || 'Walk-in Customer'}\n\n*Purchased Items:*\n${itemsSummary}\n\n💰 *Total Amount:* ${formatCurrency(invoice.grandTotal)}\n💳 *Payment Method:* ${invoice.paymentMethod}\n${invoice.cashReceived ? `💵 *Amount Tendered:* ${formatCurrency(invoice.cashReceived)}\n🪙 *Change Given:* ${formatCurrency(invoice.changeGiven || 0)}\n` : ''}\nThank you for your business! Come again.\n\n📍 ${settings.address || 'No 184/B, Galle Road'}, ${settings.city || 'Colombo 04'}\n📞 Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}`;

    const encoded = encodeURIComponent(message);
    const targetUrl = phone
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(targetUrl, '_blank');
    showToast('Opening WhatsApp with bill details...', 'info');
  };

  const displayBillNo = invoice.invoiceNumber.startsWith('INV-')
    ? invoice.invoiceNumber.replace('INV-', '0#')
    : invoice.invoiceNumber;

  const displayDateTime = `${invoice.date} ${invoice.time || '09:24 PM'}`;

  const a4Content = (
    <div
      id="a4-invoice-document"
      className="w-full max-w-[210mm] min-h-[297mm] bg-white text-black font-sans shadow-2xl rounded-sm p-10 sm:p-14 relative flex flex-col justify-between print:shadow-none print:m-0 print:p-8 print:w-[210mm] print:min-h-[297mm]"
      style={{
        marginTop: `${settings.invoicePrintMarginTop || 0}px`,
        marginBottom: `${settings.invoicePrintMarginBottom || 0}px`,
      }}
    >
      {/* Top Header - Store Details */}
      <div className="space-y-6">
        <div className="text-center pb-5 border-b-2 border-black space-y-1">
          {settings.logoJpgUrl && (
            <div className="flex justify-center mb-2">
              <img
                src={settings.logoJpgUrl}
                alt="Logo"
                className="h-12 w-12 object-contain filter grayscale"
              />
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans">
            {settings.companyName || 'WCS RESTAURANT & FOODS'}
          </h1>
          <p className="text-sm text-gray-800 font-medium">
            {settings.address || 'No 184/B, Galle Road, Bambalapitiya'}, {settings.city || 'Colombo 04'}
          </p>
          <p className="text-sm text-gray-800 font-medium">
            Tel: {settings.telephone || '011-2589632'} / {settings.whatsappNumber || '077-1234567'}
          </p>
          <p className="text-xs text-gray-900 font-bold uppercase tracking-wider">
            VAT Reg: {settings.taxRegistrationNo || 'VAT-10928374-7000'}
          </p>
        </div>

        {/* Bill Meta Row */}
        <div className="py-2 border-b-2 border-black space-y-1 text-sm">
          <div className="text-xs text-gray-800 font-semibold">{displayDateTime}</div>
          <div className="flex justify-between font-black text-base text-black">
            <span>Sales Receipt {displayBillNo}</span>
            <span>Store: 1</span>
          </div>
        </div>

        {/* Cashier & Customer Info */}
        <div className="py-2 border-b-2 border-black text-sm space-y-1">
          <div>
            <span className="font-bold text-gray-900">Cashier: </span>
            <span className="font-semibold text-black">
              {invoice.issuedByUserName || 'Kasun Weerasinghe (Admin)'}
            </span>
          </div>
          <div>
            <span className="font-bold text-gray-900">Customer: </span>
            <span className="font-semibold text-black">
              {invoice.customerName || 'Walk-in Customer'}{' '}
              {invoice.customerName === 'Walk-in Customer' || !invoice.customerName
                ? '(සාමාන්‍ය පාරිභෝගිකයා)'
                : ''}
            </span>
          </div>
          {invoice.customerPhone && invoice.customerPhone !== '+94 77 000 0000' && (
            <div className="text-xs text-gray-700 font-medium">
              Tel: {invoice.customerPhone}
            </div>
          )}
        </div>

        {/* Item Table: Qty | Item Name | U/Price | Total */}
        <div className="py-2 border-b-2 border-black">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-black text-left font-black">
                <th className="pb-2 text-center w-16">Qty</th>
                <th className="pb-2 text-left">Item Name</th>
                <th className="pb-2 text-right w-36">U/Price</th>
                <th className="pb-2 text-right w-36">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {invoice.items.map((item, idx) => (
                <tr key={idx} className="align-top">
                  <td className="py-2.5 text-center font-bold text-base">{item.quantity}</td>
                  <td className="py-2.5 pr-2">
                    <p className="font-bold text-black text-base">{item.name}</p>
                    {item.discountPercentage > 0 && (
                      <p className="text-xs text-gray-600 italic">
                        Disc: {item.discountPercentage}% (-{formatCurrency(item.discountAmount)})
                      </p>
                    )}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sm font-semibold">
                    {item.unitPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-base">
                    {item.totalAmount.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Totals */}
        <div className="py-3 border-b-2 border-black space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Subtotal:</span>
            <span className="font-mono font-semibold">
              {invoice.subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {invoice.totalDiscount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">Discount:</span>
              <span className="font-mono">
                -{' '}
                {invoice.totalDiscount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          {invoice.taxAmount > 0 && (
            <div className="flex justify-between text-gray-700">
              <span className="font-medium">VAT / Tax ({invoice.taxPercentage}%):</span>
              <span className="font-mono">
                +{' '}
                {invoice.taxAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <div className="flex justify-between text-lg font-black text-black pt-2 border-t-2 border-black">
            <span>RECEIPT TOTAL:</span>
            <span className="font-mono font-black text-xl">
              {invoice.grandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="py-3 border-b-2 border-black space-y-1.5 text-sm">
          {invoice.cashReceived !== undefined && invoice.cashReceived > 0 && (
            <>
              <div className="flex justify-between">
                <span className="font-bold text-gray-900">Amount Tendered:</span>
                <span className="font-mono font-bold">
                  {invoice.cashReceived.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between font-black text-black text-base">
                <span>Change Given:</span>
                <span className="font-mono font-black">
                  {(invoice.changeGiven || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between">
            <span className="font-bold text-gray-900">Payment:</span>
            <span className="font-black uppercase tracking-wider text-black">
              {invoice.paymentMethod}
            </span>
          </div>

          {invoice.paymentRef && (
            <div className="text-xs text-gray-700 pt-0.5">
              Ref: {invoice.paymentRef}
            </div>
          )}
        </div>
      </div>

      {/* Footer Barcode & Thank you */}
      <div className="pt-6 pb-2 text-center space-y-3">
        {showBarcode && (
          <div className="flex flex-col items-center justify-center">
            <svg className="w-64 h-12 my-1" viewBox="0 0 160 36" fill="currentColor">
              <rect x="5" y="2" width="2" height="28" />
              <rect x="9" y="2" width="1" height="28" />
              <rect x="12" y="2" width="3" height="28" />
              <rect x="17" y="2" width="1" height="28" />
              <rect x="20" y="2" width="2" height="28" />
              <rect x="24" y="2" width="3" height="28" />
              <rect x="29" y="2" width="1" height="28" />
              <rect x="32" y="2" width="4" height="28" />
              <rect x="38" y="2" width="2" height="28" />
              <rect x="42" y="2" width="1" height="28" />
              <rect x="45" y="2" width="3" height="28" />
              <rect x="50" y="2" width="2" height="28" />
              <rect x="54" y="2" width="1" height="28" />
              <rect x="57" y="2" width="4" height="28" />
              <rect x="63" y="2" width="2" height="28" />
              <rect x="67" y="2" width="1" height="28" />
              <rect x="70" y="2" width="3" height="28" />
              <rect x="75" y="2" width="2" height="28" />
              <rect x="79" y="2" width="1" height="28" />
              <rect x="82" y="2" width="3" height="28" />
              <rect x="87" y="2" width="2" height="28" />
              <rect x="91" y="2" width="4" height="28" />
              <rect x="97" y="2" width="1" height="28" />
              <rect x="100" y="2" width="3" height="28" />
              <rect x="105" y="2" width="2" height="28" />
              <rect x="109" y="2" width="1" height="28" />
              <rect x="112" y="2" width="4" height="28" />
              <rect x="118" y="2" width="2" height="28" />
              <rect x="122" y="2" width="3" height="28" />
              <rect x="127" y="2" width="1" height="28" />
              <rect x="130" y="2" width="2" height="28" />
              <rect x="134" y="2" width="3" height="28" />
              <rect x="139" y="2" width="1" height="28" />
              <rect x="142" y="2" width="4" height="28" />
              <rect x="148" y="2" width="2" height="28" />
              <rect x="152" y="2" width="2" height="28" />
            </svg>
            <span className="font-mono text-xs tracking-widest text-gray-800 font-bold">
              *{invoice.invoiceNumber}*
            </span>
          </div>
        )}

        <div className="text-sm text-gray-900 leading-snug space-y-0.5 pt-2">
          <p className="font-black text-base">Thank You For Your Business!</p>
          <p className="italic font-medium">Come Again.</p>
          <p className="text-xs text-gray-600 font-mono pt-1">
            System by WCS POS
          </p>
        </div>
      </div>
    </div>
  );

  if (hideModalWrapper) {
    return a4Content;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Controls toolbar - Hidden when printing */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-slate-900/90 text-white p-2 rounded-xl shadow-2xl border border-slate-700">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow transition"
        >
          <Printer className="w-4 h-4" />
          Print A4 Invoice
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="flex items-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow transition text-sm font-medium"
        >
          <Share2 className="w-4 h-4" />
          WhatsApp Invoice
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {a4Content}
    </div>
  );
};
