import React from 'react';
import { JewelryCertificate } from '../../types';
import { useApp } from '../../context/AppContext';
import { Printer, X, ShieldCheck, Award, QrCode } from 'lucide-react';

interface A4CertificatePrintProps {
  certificate: JewelryCertificate;
  onClose: () => void;
}

export const A4CertificatePrint: React.FC<A4CertificatePrintProps> = ({ certificate, onClose }) => {
  const { settings } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Action Bar - Hidden when printing */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden bg-slate-900 text-white p-2 rounded-xl shadow-2xl border border-slate-700">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow transition"
        >
          <Printer className="w-4 h-4" />
          Print Certificate (A4)
        </button>

        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white transition"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* A4 Certificate Sheet */}
      <div
        id="a4-certificate-document"
        className="w-full max-w-[210mm] min-h-[297mm] bg-[#fcfbfa] text-slate-900 shadow-2xl rounded-sm p-10 sm:p-14 relative flex flex-col justify-between border-[12px] border-double border-amber-800/80 print:border-[10px] print:shadow-none print:m-0 print:p-10 print:w-[210mm] print:min-h-[297mm]"
      >
        {/* Optional JPG Template Background */}
        {settings.enableCertificateBackground && settings.certificateBackgroundJpgUrl && (
          <div
            className="absolute inset-0 pointer-events-none z-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${settings.certificateBackgroundJpgUrl})`,
              opacity: 0.15,
            }}
          />
        )}

        {/* Certificate Inner Frame */}
        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-amber-700/60 pb-5">
            <div className="flex justify-center items-center gap-3 mb-2">
              <Award className="w-9 h-9 text-amber-700" />
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-wider">
                {settings.companyName.toUpperCase()}
              </h1>
              <Award className="w-9 h-9 text-amber-700" />
            </div>

            <p className="text-xs uppercase tracking-[0.25em] text-amber-900 font-semibold font-serif">
              Gemological Laboratory & Fine Jewelry Certification Division
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              National Gem & Jewellery Authority (NGJA) Certified Appraisal Laboratory | Colombo & Ratnapura, Sri Lanka
            </p>

            <div className="mt-4 inline-block px-6 py-1.5 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 border border-amber-400 text-amber-950 font-serif font-bold text-sm tracking-widest uppercase rounded shadow-inner">
              Certificate of Gemological Authenticity
            </div>
          </div>

          {/* Certificate Reference Bar */}
          <div className="flex justify-between items-center bg-amber-50/80 border border-amber-200 rounded-lg px-4 py-2 text-xs">
            <div>
              <span className="text-slate-600 font-medium">Certificate Ref No:</span>{' '}
              <span className="font-mono font-bold text-amber-900 text-sm ml-1">
                {certificate.certificateNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-600 font-medium">Date of Examination:</span>{' '}
              <span className="font-semibold text-slate-800 ml-1">{certificate.date}</span>
            </div>
            {certificate.invoiceNumber && (
              <div>
                <span className="text-slate-600 font-medium">Invoice Ref:</span>{' '}
                <span className="font-mono font-semibold text-slate-800 ml-1">{certificate.invoiceNumber}</span>
              </div>
            )}
          </div>

          {/* Main Body: Gem Image + Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
            {/* Left: Gemstone / Jewelry Photo */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div className="w-full aspect-square bg-white border-2 border-amber-300 rounded-xl overflow-hidden shadow-md flex items-center justify-center p-2 relative group">
                <img
                  src={certificate.itemImageUrl}
                  alt={certificate.jewelryName}
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                  Sample Magnification 10x
                </div>
              </div>

              {/* Item Code & Barcode */}
              <div className="mt-3 text-center w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs">
                <p className="font-bold text-slate-800">{certificate.jewelryName}</p>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                  Item Code: {certificate.itemCode} | Barcode: {certificate.barcode}
                </p>
              </div>

              {/* QR Verification */}
              <div className="mt-4 flex items-center gap-3 bg-amber-50/50 border border-amber-200 p-2.5 rounded-lg w-full">
                <div className="p-1.5 bg-white border border-slate-300 rounded">
                  <QrCode className="w-8 h-8 text-slate-800" />
                </div>
                <div className="text-[10px] text-slate-600">
                  <p className="font-bold text-slate-900">Digital Registry Verification</p>
                  <p className="font-mono text-amber-900">{certificate.qrVerificationCode}</p>
                  <p className="text-[9px] text-slate-500">Scan to verify gemstone authenticity online</p>
                </div>
              </div>
            </div>

            {/* Right: Gemological Data Table */}
            <div className="md:col-span-7 space-y-3">
              <h2 className="font-serif font-bold text-base text-slate-900 border-b border-amber-300 pb-1 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Gemological & Material Specifications
              </h2>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Species & Variety:</span>
                  <span className="font-bold text-amber-950 font-serif text-sm">{certificate.gemstoneType}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Carat Weight:</span>
                  <span className="font-bold text-slate-900">{certificate.caratWeight} Cts</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Cut & Shape:</span>
                  <span className="font-semibold text-slate-800">{certificate.cutShape}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Color Grade:</span>
                  <span className="font-semibold text-slate-800">{certificate.color}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Clarity Grade:</span>
                  <span className="font-semibold text-slate-800">{certificate.clarity}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Geographic Origin:</span>
                  <span className="font-bold text-emerald-800">{certificate.origin}</span>
                </div>

                {certificate.dimensions && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Dimensions:</span>
                    <span className="font-mono text-slate-800">{certificate.dimensions}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Treatment Status:</span>
                  <span className="font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {certificate.treatment}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Precious Metal:</span>
                  <span className="font-semibold text-slate-800">{certificate.metalPurity}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-600 font-medium">Gross Weight:</span>
                  <span className="font-semibold text-slate-800">{certificate.grossWeight} Grams</span>
                </div>

                {certificate.customerName && (
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Issued To Client:</span>
                    <span className="font-semibold text-slate-800">{certificate.customerName}</span>
                  </div>
                )}
              </div>

              {/* Remarks Box */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 text-[11px] text-slate-700 mt-2">
                <p className="font-bold text-amber-950 mb-0.5">Gemological Observations & Remarks:</p>
                <p className="italic leading-relaxed">{certificate.remarks}</p>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-3 leading-relaxed">
            <p className="font-semibold text-slate-600 uppercase tracking-wider mb-0.5">Laboratory Guarantee & Disclaimer</p>
            <p>{settings.certificateDisclaimer}</p>
          </div>
        </div>

        {/* Official Signatures & Embossed Seal */}
        <div className="relative z-10 pt-8">
          <div className="flex justify-between items-end">
            {/* Seal */}
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full border-2 border-amber-600 bg-amber-100 flex flex-col items-center justify-center text-center p-1 shadow-inner">
                <span className="text-[9px] font-bold text-amber-900 tracking-tighter uppercase">WCS CERTIFIED</span>
                <ShieldCheck className="w-5 h-5 text-amber-800" />
                <span className="text-[8px] font-bold text-amber-800">AUTHENTIC</span>
              </div>
              <div className="text-[10px] text-slate-500">
                <p className="font-semibold text-slate-700">Official Laboratory Seal</p>
                <p>Govt. Registered Gem Trade #PV-00284918</p>
              </div>
            </div>

            {/* Signature */}
            <div className="text-right w-64">
              <div className="font-serif italic text-base text-slate-800 border-b-2 border-slate-400 pb-1 mb-1">
                {certificate.gemologistName}
              </div>
              <p className="text-xs font-bold text-slate-800">{certificate.gemologistName}</p>
              <p className="text-[10px] text-slate-500">{certificate.gemologistTitle}</p>
            </div>
          </div>

          <div className="text-center text-[9px] text-slate-400 pt-4 border-t border-slate-200 mt-4">
            {settings.companyName} | {settings.address}, {settings.city} | Tel: {settings.telephone} | www.wcsgems.lk
          </div>
        </div>
      </div>
    </div>
  );
};
