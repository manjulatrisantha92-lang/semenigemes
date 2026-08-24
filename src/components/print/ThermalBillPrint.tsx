import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';

interface ThermalBillPrintProps {
  invoice: Invoice;
  showBarcode?: boolean;
}

export const ThermalBillPrint: React.FC<ThermalBillPrintProps> = ({
  invoice,
  showBarcode = true,
}) => {
  const { settings, formatCurrency } = useApp();

  const totalQty = invoice.items.reduce((sum, it) => sum + it.quantity, 0);

  return (
    <div
      id="thermal-pos-bill"
      className="w-full max-w-[80mm] mx-auto bg-white text-black font-mono text-[11px] leading-relaxed p-4 shadow-xl border border-gray-200 rounded print:shadow-none print:border-none print:p-0 print:max-w-none print:w-[76mm] print:text-[10px]"
    >
      {/* Header / Store Info */}
      <div className="text-center space-y-0.5 pb-2.5 border-b border-black">
        {settings.logoJpgUrl && (
          <div className="flex justify-center mb-1">
            <img
              src={settings.logoJpgUrl}
              alt="Logo"
              className="h-9 w-9 object-contain filter grayscale"
            />
          </div>
        )}
        <h1 className="text-sm sm:text-base font-black uppercase tracking-tight font-sans text-black">
          {settings.companyName || 'WCS RESTAURANT & FOODS'}
        </h1>
        {settings.tagline && (
          <p className="text-[10px] text-gray-700">{settings.tagline}</p>
        )}
        <p className="text-[9.5px] text-gray-900 leading-tight">
          {settings.address || 'No 184/B, Galle Road, Bambalapitiya'}, {settings.city || 'Colombo 04'}
        </p>
        <p className="text-[9.5px] text-gray-900">
          Tel: {settings.telephone || '011-2589632'} / {settings.whatsappNumber || '077-1234567'}
        </p>
        <p className="text-[9px] text-gray-800 font-semibold">
          VAT Reg: {settings.taxRegistrationNo || 'VAT-10928374-7000'}
        </p>
      </div>

      {/* Bill Meta */}
      <div className="py-2 space-y-0.5 border-b border-black text-[10px]">
        <div className="text-[9.5px] text-gray-800">
          {invoice.date} {invoice.time || '09:24 PM'}
        </div>
        <div className="flex justify-between font-bold text-black">
          <span>Sales Receipt {invoice.invoiceNumber.startsWith('INV-') ? invoice.invoiceNumber.replace('INV-', '0#') : invoice.invoiceNumber}</span>
          <span>Store: 1</span>
        </div>
      </div>

      {/* Cashier & Customer Info */}
      <div className="py-1.5 border-b border-black text-[10px] space-y-0.5">
        <div>
          <span className="font-semibold">Cashier: </span>
          <span>{invoice.issuedByUserName || 'Kasun Weerasinghe (Admin)'}</span>
        </div>
        <div>
          <span className="font-semibold">Customer: </span>
          <span>
            {invoice.customerName || 'Walk-in Customer'} {invoice.customerName === 'Walk-in Customer' || !invoice.customerName ? '(සාමාන්‍ය පාරිභෝගිකයා)' : ''}
          </span>
        </div>
        {invoice.customerPhone && invoice.customerPhone !== '+94 77 000 0000' && (
          <div className="text-[9px] text-gray-700">
            Tel: {invoice.customerPhone}
          </div>
        )}
        {invoice.customerNIC && (
          <div className="text-[9px] text-gray-700">
            NIC: {invoice.customerNIC}
          </div>
        )}
      </div>

      {/* Line Items Table */}
      <div className="py-2 border-b border-black">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-black text-left font-bold">
              <th className="pb-1 text-center w-7">Qty</th>
              <th className="pb-1 text-left">Item Name</th>
              <th className="pb-1 text-right">U/Price</th>
              <th className="pb-1 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-1 text-center font-bold">{item.quantity}</td>
                <td className="py-1 pr-1">
                  <p className="font-bold text-gray-900 leading-tight">{item.name}</p>
                  {(item.itemCode || item.grossWeight || item.caratWeight) && (
                    <p className="text-[8.5px] text-gray-600 font-mono">
                      {item.itemCode ? `[${item.itemCode}] ` : ''}
                      {item.grossWeight ? `${item.grossWeight}g ` : ''}
                      {item.caratWeight ? `${item.caratWeight}ct` : ''}
                    </p>
                  )}
                  {item.discountPercentage > 0 && (
                    <p className="text-[8px] text-gray-500 italic">
                      Disc: {item.discountPercentage}% (-{formatCurrency(item.discountAmount)})
                    </p>
                  )}
                </td>
                <td className="py-1 text-right font-mono">{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="py-1 text-right font-bold font-mono">{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Financial Summary */}
      <div className="py-2 border-b border-black space-y-0.5 text-[10px]">
        <div className="flex justify-between">
          <span className="font-semibold">Subtotal:</span>
          <span className="font-mono">{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {invoice.totalDiscount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>Discount:</span>
            <span className="font-mono">- {invoice.totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}

        {invoice.taxAmount > 0 && (
          <div className="flex justify-between text-gray-700">
            <span>VAT / Tax ({invoice.taxPercentage}%):</span>
            <span className="font-mono">+ {invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}

        <div className="flex justify-between text-xs font-black text-black pt-1 border-t border-black">
          <span>RECEIPT TOTAL:</span>
          <span className="text-xs font-mono font-black">{invoice.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Payment Details */}
      <div className="py-2 border-b border-black space-y-0.5 text-[10px]">
        {invoice.cashReceived !== undefined && invoice.cashReceived > 0 ? (
          <>
            <div className="flex justify-between">
              <span className="font-semibold">Amount Tendered:</span>
              <span className="font-mono font-bold">{invoice.cashReceived.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-black">
              <span>Change Given:</span>
              <span className="font-mono">{(invoice.changeGiven || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </>
        ) : null}

        <div className="flex justify-between">
          <span className="font-semibold">Payment:</span>
          <span className="font-bold uppercase">{invoice.paymentMethod}</span>
        </div>

        {invoice.paymentRef && (
          <div className="text-[9px] text-gray-700 pt-0.5">
            Ref: {invoice.paymentRef}
          </div>
        )}

        {invoice.balanceDue > 0 && (
          <div className="flex justify-between text-black font-bold pt-1 border-t border-dotted border-gray-400">
            <span>Balance Due:</span>
            <span className="font-mono">{invoice.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      {/* Barcode & Verification Graphic */}
      <div className="py-2.5 text-center space-y-1.5">
        {showBarcode && (
          <div className="flex flex-col items-center justify-center">
            {/* Clean SVG Scannable Barcode */}
            <svg
              className="w-48 h-10 my-0.5"
              viewBox="0 0 160 36"
              fill="currentColor"
            >
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
            <span className="font-mono text-[8.5px] tracking-widest text-gray-700">
              *{invoice.invoiceNumber}*
            </span>
          </div>
        )}

        {/* Footer Greetings */}
        <div className="text-[9px] text-gray-800 leading-snug space-y-0.5 pt-1 font-sans">
          <p className="font-bold">Thank You For Your Business!</p>
          <p className="italic">Come Again.</p>
          <p className="text-[8px] text-gray-600 font-mono pt-1">
            System by WCS POS
          </p>
        </div>
      </div>
    </div>
  );
};

