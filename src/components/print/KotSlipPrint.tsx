import React from 'react';
import { Invoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { UtensilsCrossed, Clock, Hammer } from 'lucide-react';

interface KotSlipPrintProps {
  invoice: Invoice;
}

export const KotSlipPrint: React.FC<KotSlipPrintProps> = ({ invoice }) => {
  const { settings } = useApp();

  return (
    <div
      id="kot-order-slip"
      className="w-full max-w-[80mm] mx-auto bg-white text-black font-mono text-[11px] leading-relaxed p-4 shadow-xl border border-gray-300 rounded print:shadow-none print:border-none print:p-1 print:max-w-none print:w-[76mm]"
    >
      {/* Header */}
      <div className="text-center pb-2 border-b-2 border-black">
        <h2 className="text-base font-black uppercase tracking-wider">
          *** KOT / WORKSHOP ESTIMATE ***
        </h2>
        <p className="text-[10px] font-bold mt-0.5">{settings.companyName}</p>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-black text-[10px] space-y-0.5">
        <div className="flex justify-between font-bold">
          <span>KOT Token #:</span>
          <span>{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date: {invoice.date}</span>
          <span>Time: {invoice.time || '10:45 AM'}</span>
        </div>
        <div className="flex justify-between">
          <span>Operator: {invoice.issuedByUserName}</span>
          <span>Dept: Order/Counter 01</span>
        </div>
        <div className="flex justify-between font-bold pt-1 border-t border-dotted border-gray-400">
          <span>Customer:</span>
          <span>{invoice.customerName}</span>
        </div>
      </div>

      {/* Items list for workshop / preparation */}
      <div className="py-3 border-b-2 border-black">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-black text-left font-black">
              <th className="pb-1">QTY</th>
              <th className="pb-1 pl-2">ITEM DESCRIPTION / SPECS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="align-top">
                <td className="py-1.5 text-center font-black text-sm">{item.quantity}</td>
                <td className="py-1.5 pl-2">
                  <p className="font-black text-sm">{item.name}</p>
                  <p className="text-[10px] text-gray-700 font-mono">
                    Code: {item.itemCode} | {item.category}
                  </p>
                  {item.grossWeight && (
                    <p className="text-[10px] font-bold">Gross Wt: {item.grossWeight}g</p>
                  )}
                  {item.caratWeight && (
                    <p className="text-[10px] font-bold">Carat: {item.caratWeight}ct</p>
                  )}
                  {item.gemSummary && (
                    <p className="text-[9.5px] italic text-gray-800">Stone: {item.gemSummary}</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div className="py-2 border-b border-black text-[10px]">
          <span className="font-bold">Special Instructions / Notes:</span>
          <p className="italic bg-gray-100 p-1 mt-0.5 rounded text-[9.5px]">{invoice.notes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 text-center text-[9px] font-bold space-y-1">
        <p>*** FOR INTERNAL WORKSHOP / ESTIMATE PURPOSES ONLY ***</p>
        <p>NOT A LEGAL TAX INVOICE</p>
      </div>
    </div>
  );
};
