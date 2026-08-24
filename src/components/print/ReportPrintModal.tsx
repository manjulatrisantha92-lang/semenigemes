import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { A4ReportPrint, ReportPrintData } from './A4ReportPrint';
import { exportToCsv } from '../../utils/reportUtils';
import {
  Printer,
  X,
  Copy,
  ExternalLink,
  HelpCircle,
  Download,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  Columns,
  Sparkles,
  Sliders,
} from 'lucide-react';

interface ReportPrintModalProps {
  report: ReportPrintData;
  onClose: () => void;
}

export const ReportPrintModal: React.FC<ReportPrintModalProps> = ({ report, onClose }) => {
  const { settings, showToast } = useApp();

  // Print Settings State
  const [printOrientation, setPrintOrientation] = useState<'portrait' | 'landscape'>(
    report.orientation || (report.headers.length > 7 ? 'landscape' : 'portrait')
  );
  const [showBarcode, setShowBarcode] = useState<boolean>(true);
  const [showSummaryCards, setShowSummaryCards] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);
  const [showSetupGuide, setShowSetupGuide] = useState<boolean>(false);

  const displayDateTime = new Date().toLocaleString();
  const reportCode = report.reportCode || `REP-${Date.now().toString().slice(-6)}`;

  // Copy Plain Text Report Summary to Clipboard
  const handleCopyText = async () => {
    const divider = '================================================================================';
    const subDivider = '--------------------------------------------------------------------------------';
    
    const lines: string[] = [
      (settings.companyName || 'WCS JEWELRY & GEM MANAGEMENT').toUpperCase(),
      `${settings.address || 'No 184/B, Galle Road'}, ${settings.city || 'Colombo 04'}`,
      `Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}`,
      `VAT Reg: ${settings.taxRegistrationNo || 'VAT-10928374-7000'}`,
      divider,
      `REPORT: ${report.title.toUpperCase()}`,
      `Period: ${report.dateRange || 'All Records'} | Generated: ${displayDateTime} | Doc ID: ${reportCode}`,
      divider,
    ];

    // Summary Cards
    if (showSummaryCards && report.summaryCards && report.summaryCards.length > 0) {
      lines.push('SUMMARY KEY FIGURES:');
      report.summaryCards.forEach((c) => {
        lines.push(`• ${c.label}: ${c.value}`);
      });
      lines.push(subDivider);
    }

    // Headers
    lines.push(report.headers.join(' | '));
    lines.push(subDivider);

    // Rows
    report.rows.forEach((row) => {
      const formattedRow = row.map((cell) => String(cell).replace(/\n/g, ' '));
      lines.push(formattedRow.join(' | '));
    });

    // Totals Row
    if (report.totalsRow) {
      lines.push(divider);
      lines.push(`TOTALS: ${report.totalsRow.join(' | ')}`);
    }

    // Notes
    if (report.notes) {
      lines.push(subDivider);
      lines.push(`NOTES: ${report.notes}`);
    }

    lines.push(divider);
    lines.push('Generated via WCS Management System • Confidential');

    const textToCopy = lines.join('\n');
    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('Report text copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy text. Permission denied.', 'error');
    }
  };

  // Direct CSV Export from Print Modal
  const handleExportCsv = () => {
    const filename = report.title.replace(/[^a-zA-Z0-9_-]/g, '_');
    const sanitizedRows = report.rows.map((row) =>
      row.map((cell) => String(cell).replace(/\n/g, ' - '))
    );
    exportToCsv(filename, report.headers, sanitizedRows);
    showToast('Report CSV downloaded successfully!', 'success');
  };

  // Open Standalone Print Tab for Crystal Clear A4 Paper Printing
  const handlePrintPageStandalone = () => {
    const isLandscape = printOrientation === 'landscape';

    // Summary Cards HTML
    const summaryCardsHtml =
      showSummaryCards && report.summaryCards && report.summaryCards.length > 0
        ? `
          <div class="summary-grid ${report.summaryCards.length <= 2 ? 'grid-2' : report.summaryCards.length === 3 ? 'grid-3' : 'grid-4'}">
            ${report.summaryCards
              .map(
                (c) => `
              <div class="summary-card">
                <div class="summary-label">${c.label}</div>
                <div class="summary-val">${c.value}</div>
              </div>
            `
              )
              .join('')}
          </div>
        `
        : '';

    // Table Headers HTML
    const headersHtml = report.headers
      .map((h) => `<th>${h}</th>`)
      .join('');

    // Table Rows HTML
    const rowsHtml =
      report.rows.length === 0
        ? `<tr><td colspan="${report.headers.length}" style="text-align: center; padding: 20px; color: #666;">No matching records found for this period.</td></tr>`
        : report.rows
            .map(
              (r, idx) => `
            <tr class="${idx % 2 === 0 ? 'even' : 'odd'}">
              ${r.map((cell) => `<td>${String(cell).replace(/\n/g, '<br/>')}</td>`).join('')}
            </tr>
          `
            )
            .join('');

    // Totals Row HTML
    const totalsRowHtml = report.totalsRow
      ? `
        <tr class="totals-row">
          ${report.totalsRow.map((tCell) => `<td>${tCell}</td>`).join('')}
        </tr>
      `
      : '';

    // Barcode SVG HTML
    const barcodeHtml = showBarcode
      ? `
        <div class="barcode-box">
          <svg width="150" height="26" viewBox="0 0 160 30">
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
          <div style="font-size: 8.5px; font-family: monospace; font-weight: bold; letter-spacing: 1px;">*${reportCode}*</div>
        </div>
      `
      : '';

    // Signatures HTML
    const signaturesHtml = showSignatures
      ? `
        <div class="signatures-grid">
          <div class="sig-col">
            <div class="sig-line">Prepared By (Accountant / Clerk)</div>
            <div class="sig-sub">Signature & Date</div>
          </div>
          <div class="sig-col">
            <div class="sig-line">Verified By (Workshop Manager)</div>
            <div class="sig-sub">Verification Stamp</div>
          </div>
          <div class="sig-col">
            <div class="sig-line">Authorized Executive Director</div>
            <div class="sig-sub">Official Seal & Approval</div>
          </div>
        </div>
      `
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${report.title} - A4 Report</title>
          <style>
            @page {
              size: A4 ${isLandscape ? 'landscape' : 'portrait'};
              margin: 12mm 15mm;
            }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: ${isLandscape ? '11px' : '12px'};
              line-height: 1.35;
              color: #111;
              background: #fff;
              width: 100%;
              max-width: ${isLandscape ? '270mm' : '190mm'};
              margin: 0 auto;
            }
            .bold { font-weight: bold; }
            .header-flex { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 12px; }
            .company-name { font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
            .company-sub { font-size: 11px; color: #444; }
            .meta-right { text-align: right; font-size: 11px; }
            .badge { display: inline-block; background: #000; color: #fff; font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 3px; text-transform: uppercase; margin-bottom: 4px; }
            
            .report-title-banner { background: #f3f4f6; border: 1px solid #d1d5db; padding: 8px 12px; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
            .report-title { font-size: 15px; font-weight: 900; color: #000; }
            .report-period { font-size: 11px; color: #4b5563; margin-top: 2px; }
            
            .summary-grid { display: grid; gap: 8px; margin-bottom: 12px; }
            .grid-2 { grid-template-columns: repeat(2, 1fr); }
            .grid-3 { grid-template-columns: repeat(3, 1fr); }
            .grid-4 { grid-template-columns: repeat(4, 1fr); }
            .summary-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 6px 10px; border-radius: 4px; text-align: center; }
            .summary-label { font-size: 9px; font-weight: 800; color: #6b7280; text-transform: uppercase; }
            .summary-val { font-size: 13px; font-weight: 900; color: #000; font-family: "Courier New", Courier, monospace; margin-top: 2px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: ${isLandscape ? '10.5px' : '11.5px'}; }
            th { background: #111827; color: #fff; text-align: left; padding: 6px 8px; font-weight: 900; text-transform: uppercase; font-size: 10px; border: 1px solid #111827; }
            td { padding: 5px 8px; border: 1px solid #e5e7eb; vertical-align: top; }
            tr.odd td { background: #f9fafb; }
            tr.even td { background: #ffffff; }
            tr.totals-row td { background: #e5e7eb; font-weight: 900; color: #000; border-top: 2px solid #374151; font-size: 11.5px; }
            
            .notes-box { background: #fffbeb; border: 1px solid #fde68a; padding: 8px 10px; border-radius: 4px; font-size: 11px; color: #78350f; margin-bottom: 16px; }
            
            .signatures-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid #d1d5db; page-break-inside: avoid; }
            .sig-line { border-bottom: 1px solid #6b7280; padding-bottom: 4px; font-weight: bold; font-size: 11px; }
            .sig-sub { font-size: 9.5px; color: #6b7280; margin-top: 3px; text-transform: uppercase; }
            
            .footer-info { display: flex; justify-content: space-between; font-size: 9.5px; color: #9ca3af; margin-top: 15px; border-top: 1px solid #f3f4f6; padding-top: 6px; }
            .barcode-box { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header-flex">
            <div>
              <div class="company-name">${settings.companyName || 'WCS JEWELRY & GEM MANAGEMENT'}</div>
              <div class="company-sub">${settings.address || 'No 184/B, Galle Road'}, ${settings.city || 'Colombo 04'}</div>
              <div class="company-sub">Tel: ${settings.telephone || '011-2589632'} / ${settings.whatsappNumber || '077-1234567'}</div>
              <div class="bold" style="font-size: 10.5px; margin-top: 2px;">VAT Reg: ${settings.taxRegistrationNo || 'VAT-10928374-7000'}</div>
            </div>
            <div class="meta-right">
              <div class="badge">Official Management Report</div>
              <div><strong>Doc ID:</strong> ${reportCode}</div>
              <div><strong>Generated:</strong> ${displayDateTime}</div>
            </div>
          </div>

          <div class="report-title-banner">
            <div>
              <div class="report-title">${report.title}</div>
              ${report.dateRange ? `<div class="report-period"><strong>Reporting Period:</strong> ${report.dateRange}</div>` : ''}
            </div>
            ${barcodeHtml}
          </div>

          ${summaryCardsHtml}

          <table>
            <thead>
              <tr>
                ${headersHtml}
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
              ${totalsRowHtml}
            </tbody>
          </table>

          ${
            report.notes
              ? `<div class="notes-box"><strong>Notes & Audit Remarks:</strong> ${report.notes}</div>`
              : ''
          }

          ${signaturesHtml}

          <div class="footer-info">
            <span>Confidential Financial & Operational Management Report • WCS POS System</span>
            <span>Printed Document • Official Record</span>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, '_blank');
    if (!printWin) {
      showToast('Pop-up blocked. Falling back to direct print...', 'info');
      window.print();
    }
  };

  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#07090E]/90 backdrop-blur-md flex flex-col items-center justify-start p-2 sm:p-5 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Modal Container */}
      <div
        className={`w-full bg-[#0F131C] border border-[#222836] rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto print:border-none print:shadow-none print:bg-white print:max-w-none ${
          printOrientation === 'landscape' ? 'max-w-5xl' : 'max-w-3xl'
        }`}
      >
        {/* Header Bar */}
        <div className="p-3.5 sm:p-4 bg-[#121622] border-b border-[#222836] flex flex-wrap items-center justify-between gap-3 print:hidden">
          {/* Left: Checkmark + Report Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-sm shadow-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>{report.title}</span>
              </h2>
              <p className="text-[11px] text-gray-400 font-medium">
                Doc ID: {reportCode} • {report.dateRange || displayDateTime}
              </p>
            </div>
          </div>

          {/* Right: Orientation Selector (A4 Portrait & A4 Landscape) & Close */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#090C12] p-1 rounded-xl border border-[#262D3D]">
              <button
                type="button"
                id="btn-orient-portrait"
                onClick={() => setPrintOrientation('portrait')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  printOrientation === 'portrait'
                    ? 'bg-[#059669] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>A4 Portrait</span>
              </button>

              <button
                type="button"
                id="btn-orient-landscape"
                onClick={() => setPrintOrientation('landscape')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  printOrientation === 'landscape'
                    ? 'bg-[#059669] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>A4 Landscape</span>
              </button>
            </div>

            <button
              type="button"
              id="btn-close-report-modal"
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
          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-4 text-gray-300 font-semibold">
            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={showBarcode}
                onChange={(e) => setShowBarcode(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-emerald-400 font-black tracking-tighter text-sm font-mono">
                ||||
              </span>
              <span>Scannable Barcode</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={showSummaryCards}
                onChange={(e) => setShowSummaryCards(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Summary Cards</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={showSignatures}
                onChange={(e) => setShowSignatures(e.target.checked)}
                className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
              <span>Signatures & Stamp</span>
            </label>
          </div>

          {/* Right Quick Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D2820] hover:bg-[#133A2F] text-emerald-300 hover:text-emerald-200 rounded-lg border border-emerald-800/60 font-semibold text-[11px] transition shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tip Notice Banner */}
        <div className="px-4 py-2 bg-[#1A180E] border-b border-amber-900/30 text-amber-300/90 text-[11px] flex items-center gap-2 print:hidden">
          <span>💡</span>
          <span>
            <strong>A4 Report Printout Mode:</strong> Click{' '}
            <strong
              className="text-amber-200 underline cursor-pointer hover:text-white"
              onClick={handlePrintPageStandalone}
            >
              Print Page
            </strong>{' '}
            or <strong>Print A4 Paper Report</strong> to print clean A4 statement format without unnecessary application frames.
          </span>
        </div>

        {/* Document Preview Area */}
        <div className="p-4 sm:p-6 bg-[#090C12] flex justify-center items-start overflow-y-auto max-h-[58vh] print:max-h-none print:overflow-visible print:p-0 print:bg-white">
          <div
            className={`w-full shadow-2xl rounded-sm transition-all ${
              printOrientation === 'landscape' ? 'max-w-[297mm]' : 'max-w-[210mm]'
            }`}
          >
            <A4ReportPrint
              report={report}
              onClose={onClose}
              hideModalWrapper={true}
              printOrientation={printOrientation}
              showBarcode={showBarcode}
              showSummaryCards={showSummaryCards}
              showSignatures={showSignatures}
            />
          </div>
        </div>

        {/* Bottom Actions Toolbar */}
        <div className="p-3.5 sm:p-4 bg-[#121622] border-t border-[#222836] flex flex-col gap-3 print:hidden">
          {/* Row 1: Action buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              id="btn-copy-report-text"
              onClick={handleCopyText}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Text</span>
            </button>

            <button
              type="button"
              id="btn-print-report-page-tab"
              onClick={handlePrintPageStandalone}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>Print Page</span>
            </button>

            <button
              type="button"
              id="btn-report-setup-guide"
              onClick={() => setShowSetupGuide(true)}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Printer Guide</span>
            </button>

            <button
              type="button"
              id="btn-download-report-pdf"
              onClick={handlePrintPageStandalone}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-[#1B2130] hover:bg-[#252E42] text-gray-200 hover:text-white font-bold text-xs rounded-xl border border-[#2D364A] transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Row 2: Big Green Print Report button */}
          <button
            type="button"
            id="btn-print-report-primary"
            onClick={handlePrintPageStandalone}
            className="w-full py-3.5 bg-[#059669] hover:bg-[#10B981] text-slate-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.99]"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print A4 Paper Report</span>
          </button>
        </div>
      </div>

      {/* Printer Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#2D364A] max-w-md w-full rounded-2xl p-5 shadow-2xl text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="font-black text-base flex items-center gap-2 text-emerald-400">
                <HelpCircle className="w-5 h-5" />
                <span>A4 Report Paper & Printer Guide</span>
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
                <p className="font-bold text-white">Recommended Settings for A4 Reports:</p>
                <p>
                  • <strong>Destination:</strong> Your Standard Laser/Inkjet Printer or Save as PDF
                </p>
                <p>
                  • <strong>Paper Size:</strong> A4 (210 × 297 mm)
                </p>
                <p>
                  • <strong>Layout:</strong> {printOrientation === 'landscape' ? 'Landscape' : 'Portrait'}
                </p>
                <p>
                  • <strong>Margins:</strong> Default or Minimum (12–15 mm)
                </p>
                <p>
                  • <strong>Headers & Footers:</strong> Unchecked (Off)
                </p>
                <p>
                  • <strong>Background Graphics:</strong> Checked (On)
                </p>
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
    </div>
  );
};
