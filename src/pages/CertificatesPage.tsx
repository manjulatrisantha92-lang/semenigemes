import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { JewelryCertificate, GemstoneType, MetalPurity } from '../types';
import {
  Award,
  PlusCircle,
  Search,
  Printer,
  Trash2,
  ShieldCheck,
  QrCode,
  Sparkles,
  FileCheck2,
  Image as ImageIcon,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const {
    certificates,
    createCertificate,
    deleteCertificate,
    setActivePrintCertificate,
    products,
    customers,
    invoices,
    settings,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Certificate Form State
  const [certNo, setCertNo] = useState(
    `${settings.certificatePrefix}${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [certDate, setCertDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [jewelryName, setJewelryName] = useState('');
  const [metalPurity, setMetalPurity] = useState<MetalPurity>('18K White Gold (750)');
  const [grossWeight, setGrossWeight] = useState<number>(6.5);
  const [netGoldWeight, setNetGoldWeight] = useState<number>(5.8);
  const [gemstoneType, setGemstoneType] = useState<GemstoneType>('Blue Sapphire');
  const [caratWeight, setCaratWeight] = useState<number>(3.12);
  const [cutShape, setCutShape] = useState('Oval Mixed Cut');
  const [color, setColor] = useState('Royal Blue (Vivid)');
  const [clarity, setClarity] = useState('VVS (Eye Clean)');
  const [origin, setOrigin] = useState('Ratnapura, Sri Lanka (Ceylon)');
  const [dimensions, setDimensions] = useState('9.2 x 7.4 x 5.3 mm');
  const [treatment, setTreatment] = useState('Unheated (100% Natural Corundum)');
  const [remarks, setRemarks] = useState(
    'Natural untreated Ceylon sapphire displaying characteristic silk inclusions under microscopic examination. No indications of thermal treatment.'
  );
  const [itemImageUrl, setItemImageUrl] = useState(
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80'
  );
  const [gemologistName, setGemologistName] = useState(settings.defaultGemologistName);
  const [gemologistTitle, setGemologistTitle] = useState(settings.defaultGemologistTitle);
  const [useTemplateBackground, setUseTemplateBackground] = useState(false);

  // Quick populate from inventory product
  const handleSelectProductPreset = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (!prod) return;

    setItemCode(prod.itemCode);
    setBarcode(prod.barcode);
    setJewelryName(prod.name);
    setMetalPurity(prod.metalPurity);
    setGrossWeight(prod.grossWeight);
    setNetGoldWeight(prod.netGoldWeight);
    setItemImageUrl(prod.imageUrl);

    if (prod.gemstoneDetails.length > 0) {
      const g = prod.gemstoneDetails[0];
      setGemstoneType(g.gemType);
      setCaratWeight(g.caratWeight);
      setCutShape(g.cutShape);
      setColor(g.color);
      setClarity(g.clarity);
      setOrigin(g.origin);
      setTreatment(g.treatment || 'Unheated (Natural)');
      if (g.dimensions) setDimensions(g.dimensions);
    }
  };

  const handleCreateCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jewelryName.trim() || !gemstoneType) {
      showToast('Please fill in jewelry title and gemstone type.', 'error');
      return;
    }

    const newCert = createCertificate({
      certificateNumber: certNo,
      date: certDate,
      customerName: customerName.trim() || 'Valued Client',
      invoiceNumber: invoiceNumber.trim() || undefined,
      itemCode: itemCode.trim() || 'WCS-GEM-01',
      barcode: barcode.trim() || '89420000000',
      jewelryName: jewelryName.trim(),
      metalPurity,
      grossWeight,
      netGoldWeight,
      gemstoneType,
      caratWeight,
      cutShape,
      color,
      clarity,
      origin,
      dimensions: dimensions.trim() || undefined,
      treatment,
      remarks,
      itemImageUrl,
      gemologistName,
      gemologistTitle,
      qrVerificationCode: `VERIFY-${certNo}`,
      useTemplateBackground,
    });

    setShowCreateModal(false);
    setActivePrintCertificate(newCert);
  };

  const filteredCertificates = certificates.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.certificateNumber.toLowerCase().includes(term) ||
      c.customerName.toLowerCase().includes(term) ||
      c.gemstoneType.toLowerCase().includes(term) ||
      c.jewelryName.toLowerCase().includes(term) ||
      c.itemCode.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            Jewelry & Gemstone Authenticity Certificates
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Issue and print official gemological certificates for sold or loose Ceylon gems and custom fine jewelry.
          </p>
        </div>

        <button
          onClick={() => {
            setCertNo(`${settings.certificatePrefix}${Math.floor(1000 + Math.random() * 9000)}`);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          Generate New Certificate
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search certificate #, client, gemstone, code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Certificate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCertificates.map((cert) => (
          <div
            key={cert.id}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 shadow-xl flex flex-col justify-between transition group"
          >
            <div className="space-y-3">
              {/* Image & Cert Header */}
              <div className="flex items-center gap-3">
                <img
                  src={cert.itemImageUrl}
                  alt={cert.jewelryName}
                  className="w-16 h-16 rounded-xl object-cover border border-amber-500/30 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-mono font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {cert.certificateNumber}
                  </div>
                  <h3 className="font-serif font-bold text-white text-sm line-clamp-1">
                    {cert.jewelryName}
                  </h3>
                  <p className="text-[11px] text-slate-400">{cert.date}</p>
                </div>
              </div>

              {/* Gemstone specs snapshot */}
              <div className="bg-slate-800/60 rounded-xl p-3 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gemstone:</span>
                  <span className="font-bold text-amber-300">{cert.gemstoneType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Carat Weight:</span>
                  <span className="font-semibold text-white">{cert.caratWeight} Cts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Cut & Shape:</span>
                  <span className="text-slate-200">{cert.cutShape}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin:</span>
                  <span className="text-emerald-400 font-medium">{cert.origin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client:</span>
                  <span className="text-slate-200">{cert.customerName}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => setActivePrintCertificate(cert)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold rounded-lg transition"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Certificate A4
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete certificate #${cert.certificateNumber}?`)) {
                    deleteCertificate(cert.id);
                  }
                }}
                className="p-1.5 text-slate-500 hover:text-red-400 transition"
                title="Delete Certificate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Generate Certificate Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-2xl w-full shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                Issue Gemological Certificate of Authenticity
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Quick Populate from Stock Preset */}
            <div className="bg-slate-800/60 p-3 rounded-xl space-y-1">
              <label className="block text-[11px] font-semibold text-amber-400 uppercase">
                Autofill from Inventory Product (Optional)
              </label>
              <select
                onChange={(e) => handleSelectProductPreset(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="">-- Choose Stock Product to Autofill Specs --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.itemCode}) — {p.category}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleCreateCertificate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Certificate Number *</label>
                  <input
                    type="text"
                    required
                    value={certNo}
                    onChange={(e) => setCertNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Examination Date *</label>
                  <input
                    type="date"
                    required
                    value={certDate}
                    onChange={(e) => setCertDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Client Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Kasun Bandara"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Jewelry / Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ceylon Royal Blue Sapphire Halo Ring (18K Gold)"
                  value={jewelryName}
                  onChange={(e) => setJewelryName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Gemstone Variety *</label>
                  <select
                    value={gemstoneType}
                    onChange={(e) => setGemstoneType(e.target.value as GemstoneType)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {[
                      'Blue Sapphire',
                      'Yellow Sapphire',
                      'Pink Sapphire',
                      'Padparadscha',
                      'Ruby',
                      'Emerald',
                      'Diamond',
                      'Ceylon Alexandrite',
                      'Cat\'s Eye (Chrysoberyl)',
                      'Spinel',
                      'Tsavorite Garnet',
                      'Aquamarine',
                      'Tourmaline',
                      'Moonstone',
                    ].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Carat Weight (Cts) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={caratWeight}
                    onChange={(e) => setCaratWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Cut & Shape *</label>
                  <input
                    type="text"
                    required
                    value={cutShape}
                    onChange={(e) => setCutShape(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Color Grade</label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Clarity Grade</label>
                  <input
                    type="text"
                    value={clarity}
                    onChange={(e) => setClarity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Origin / Mine</label>
                  <input
                    type="text"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Treatment Status</label>
                  <input
                    type="text"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Precious Metal</label>
                  <input
                    type="text"
                    value={metalPurity}
                    onChange={(e) => setMetalPurity(e.target.value as MetalPurity)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Gross Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Jewelry / Gemstone Photo URL (JPG/PNG)</label>
                <input
                  type="text"
                  value={itemImageUrl}
                  onChange={(e) => setItemImageUrl(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Gemologist Remarks</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  Generate & Preview Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
