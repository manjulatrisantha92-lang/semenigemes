import React from 'react';
import { useApp } from '../../context/AppContext';
import { FileText, CheckCircle2, ShieldCheck, Printer, Download, Share2 } from 'lucide-react';

export interface ReportPrintData {
  type: string;
  title: string;
  dateRange?: string;
  summaryCards?: { label: string; value: string }[];
  headers: string[];
  rows: (string | number)[][];
  totalsRow?: (string | number)[];
  notes?: string;
  orientation?: 'portrait' | 'landscape';
  reportCode?: string;
}

interface A4ReportPrintProps {
  report: ReportPrintData;
  onClose?: () => void;
  hideModalWrapper?: boolean;
  printOrientation?: 'portrait' | 'landscape';
  showBarcode?: boolean;
  showSummaryCards?: boolean;
  showSignatures?: boolean;
}

export const A4ReportPrint: React.FC<A4ReportPrintProps> = ({
  report,
  onClose,
  hideModalWrapper = true,
  printOrientation = 'portrait',
  showBarcode = true,
  showSummaryCards = true,
  showSignatures = true,
}) => {
  const { settings, formatCurrency } = useApp();

  const isLandscape = printOrientation === 'landscape' || report.orientation === 'landscape';
  const generatedTime = new Date().toLocaleString();
  const reportCode = report.reportCode || `REP-${Date.now().toString().slice(-6)}`;

  return (
    <div
      id="a4-report-document"
      className={`bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-11 relative flex flex-col justify-between print:shadow-none print:m-0 print:p-8 ${
        isLandscape
          ? 'w-full max-w-[297mm] min-h-[210mm] print:w-[297mm] print:min-h-[210mm]'
          : 'w-full max-w-[210mm] min-h-[297mm] print:w-[210mm] print:min-h-[297mm]'
      }`}
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="space-y-5">
        {/* Top Company Letterhead Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {settings.logoJpgUrl && (
                <img
                  src={settings.logoJpgUrl}
                  alt="Logo"
                  className="h-10 w-10 object-contain grayscale"
                />
              )}
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">
                {settings.companyName || 'WCS JEWELRY & GEM MANAGEMENT'}
              </h1>
            </div>
            {settings.tagline && (
              <p className="text-xs text-amber-900 font-semibold">{settings.tagline}</p>
            )}
            <p className="text-[11px] text-slate-600">
              {settings.address || 'No 184/B, Galle Road'}, {settings.city || 'Colombo 04'} • Tel:{' '}
              {settings.telephone || '011-2589632'} / {settings.whatsappNumber || '077-1234567'}
            </p>
            <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
              VAT Reg No: {settings.taxRegistrationNo || 'VAT-10928374-7000'}
            </p>
          </div>

          {/* Right Header Metadata */}
          <div className="text-right space-y-1">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded">
              Management Statement
            </div>
            <p className="text-[11px] text-slate-600 font-mono">Doc ID: {reportCode}</p>
            <p className="text-[11px] text-slate-500">Generated: {generatedTime}</p>
          </div>
        </div>

        {/* Report Title & Period Banner */}
        <div className="bg-slate-100 border border-slate-300 rounded-lg p-3.5 flex flex-wrap justify-between items-center gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-800 shrink-0" />
              <span>{report.title}</span>
            </h2>
            {report.dateRange && (
              <p className="text-xs text-slate-600 mt-0.5">
                <span className="font-bold text-slate-800">Reporting Period:</span> {report.dateRange}
              </p>
            )}
          </div>

          {showBarcode && (
            <div className="text-right flex flex-col items-end">
              <svg width="140" height="28" viewBox="0 0 160 30" className="opacity-90">
                <rect x="2" y="2" width="2" height="24" fill="#000"/>
                <rect x="6" y="2" width="1" height="24" fill="#000"/>
                <rect x="9" y="2" width="3" height="24" fill="#000"/>
                <rect x="14" y="2" width="1" height="24" fill="#000"/>
                <rect x="17" y="2" width="2" height="24" fill="#000"/>
                <rect x="21" y="2" width="3" height="24" fill="#000"/>
                <rect x="26" y="2" width="1" height="24" fill="#000"/>
                <rect x="29" y="2" width="4" height="24" fill="#000"/>
                <rect x="35" y="2" width="2" height="24" fill="#000"/>
                <rect x="39" y="2" width="1" height="24" fill="#000"/>
                <rect x="42" y="2" width="3" height="24" fill="#000"/>
                <rect x="47" y="2" width="2" height="24" fill="#000"/>
                <rect x="51" y="2" width="1" height="24" fill="#000"/>
                <rect x="54" y="2" width="4" height="24" fill="#000"/>
                <rect x="60" y="2" width="2" height="24" fill="#000"/>
                <rect x="64" y="2" width="1" height="24" fill="#000"/>
                <rect x="67" y="2" width="3" height="24" fill="#000"/>
                <rect x="72" y="2" width="2" height="24" fill="#000"/>
                <rect x="76" y="2" width="1" height="24" fill="#000"/>
                <rect x="79" y="2" width="3" height="24" fill="#000"/>
                <rect x="84" y="2" width="2" height="24" fill="#000"/>
                <rect x="88" y="2" width="4" height="24" fill="#000"/>
                <rect x="94" y="2" width="1" height="24" fill="#000"/>
                <rect x="97" y="2" width="3" height="24" fill="#000"/>
                <rect x="102" y="2" width="2" height="24" fill="#000"/>
                <rect x="106" y="2" width="1" height="24" fill="#000"/>
                <rect x="109" y="2" width="4" height="24" fill="#000"/>
                <rect x="115" y="2" width="2" height="24" fill="#000"/>
                <rect x="119" y="2" width="3" height="24" fill="#000"/>
                <rect x="124" y="2" width="1" height="24" fill="#000"/>
                <rect x="127" y="2" width="2" height="24" fill="#000"/>
                <rect x="131" y="2" width="3" height="24" fill="#000"/>
                <rect x="136" y="2" width="1" height="24" fill="#000"/>
                <rect x="139" y="2" width="4" height="24" fill="#000"/>
                <rect x="145" y="2" width="2" height="24" fill="#000"/>
                <rect x="149" y="2" width="2" height="24" fill="#000"/>
              </svg>
              <span className="text-[9px] font-mono font-bold tracking-widest text-slate-700">
                *{reportCode}*
              </span>
            </div>
          )}
        </div>

        {/* Key Metrics Summary Cards */}
        {showSummaryCards && report.summaryCards && report.summaryCards.length > 0 && (
          <div
            className={`grid gap-2.5 ${
              report.summaryCards.length <= 2
                ? 'grid-cols-2'
                : report.summaryCards.length === 3
                ? 'grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {report.summaryCards.map((card, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-center shadow-xs"
              >
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-wider">
                  {card.label}
                </p>
                <p className="text-sm font-black text-slate-900 mt-0.5 font-mono">{card.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Data Table */}
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-black text-[11px] uppercase tracking-wider">
                {report.headers.map((header, idx) => (
                  <th key={idx} className="py-2.5 px-3 border-r border-slate-800 last:border-r-0">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {report.rows.length === 0 ? (
                <tr>
                  <td colSpan={report.headers.length} className="py-8 text-center text-slate-500 font-medium">
                    No matching records found for this reporting period.
                  </td>
                </tr>
              ) : (
                report.rows.map((row, rIdx) => (
                  <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/75'}>
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className="py-2 px-3 text-slate-850 border-r border-slate-100 last:border-r-0 whitespace-pre-line text-[11.5px]"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}

              {/* Totals Row */}
              {report.totalsRow && (
                <tr className="bg-slate-200/90 font-black text-slate-950 border-t-2 border-slate-400 text-xs">
                  {report.totalsRow.map((totalCell, tIdx) => (
                    <td
                      key={tIdx}
                      className="py-2.5 px-3 border-r border-slate-300 last:border-r-0 whitespace-pre-line"
                    >
                      {totalCell}
                    </td>
                  ))}
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes & Audit Remarks */}
        {report.notes && (
          <div className="text-xs text-slate-700 bg-amber-50/70 border border-amber-300/80 p-3 rounded-lg leading-relaxed">
            <span className="font-bold text-amber-950 not-italic">Notes & Audit Remarks: </span>
            {report.notes}
          </div>
        )}
      </div>

      {/* Official Signatures & Footer */}
      {showSignatures && (
        <div className="pt-6 border-t-2 border-slate-300 mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-6 text-center text-xs text-slate-700">
            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                Prepared By (Accountant / Clerk)
              </div>
              <p className="text-[10px] text-slate-500">Signature / Date</p>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                Verified By (Workshop Manager)
              </div>
              <p className="text-[10px] text-slate-500">Signature / Verification Stamp</p>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-1 mb-1 font-bold text-slate-900">
                Authorized Executive Director
              </div>
              <p className="text-[10px] text-slate-500">Official Company Seal & Approval</p>
            </div>
          </div>

          <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
            <p>Confidential Financial & Operational Management Report • WCS ERP System</p>
            <p>Page 1 of 1 • System Printed</p>
          </div>
        </div>
      )}
    </div>
  );
};
