import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Image as ImageIcon, Upload, Save, Building, Award, Receipt, Sparkles } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [form, setForm] = useState(settings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
  };

  // Helper for file to Base64 image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'companyLogoUrl' | 'invoiceBackgroundTemplateUrl' | 'certificateBackgroundTemplateUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, [field]: result }));
      showToast(`Uploaded ${field === 'companyLogoUrl' ? 'Logo' : 'Template'} successfully!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Settings className="w-4 h-4" />
          <span>System Configuration</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-white">Business Settings & JPG Templates</h2>
        <p className="text-xs text-slate-400">
          Upload custom software JPG logos, invoice paper background templates, and certificate borders for A4 printing.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Section 1: Business Identity */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Building className="w-4 h-4 text-amber-400" />
            Company Identity & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company Trade Name *</label>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Business Reg No (BRN)</label>
              <input
                type="text"
                value={form.businessRegNumber}
                onChange={(e) => setForm({ ...form, businessRegNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">VAT / Tax ID</label>
              <input
                type="text"
                value={form.vatNumber}
                onChange={(e) => setForm({ ...form, vatNumber: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Telephone / Hotline</label>
              <input
                type="text"
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Website URL</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Physical Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
            />
          </div>
        </div>

        {/* Section 2: Logo & JPG Template Uploads */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            Software Header JPG Logo & A4 Print Templates
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Software Logo */}
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-bold text-slate-200 block">1. Company Logo (JPG/PNG)</span>
                <div className="h-28 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden p-2">
                  {form.companyLogoUrl ? (
                    <img src={form.companyLogoUrl} alt="Logo" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-500">No logo uploaded</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block cursor-pointer py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-center font-semibold rounded-lg transition">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload JPG Logo
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileUpload(e, 'companyLogoUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 2. Invoice Background JPG */}
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-bold text-slate-200 block">2. Invoice Background Template</span>
                <div className="h-28 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden p-2">
                  {form.invoiceBackgroundTemplateUrl ? (
                    <img src={form.invoiceBackgroundTemplateUrl} alt="Invoice Template" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-500">Default Luxury Paper</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block cursor-pointer py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-center font-semibold rounded-lg transition">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload Invoice JPG
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileUpload(e, 'invoiceBackgroundTemplateUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* 3. Certificate Background JPG */}
            <div className="bg-slate-800/60 rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="font-bold text-slate-200 block">3. Certificate Border Template</span>
                <div className="h-28 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden p-2">
                  {form.certificateBackgroundTemplateUrl ? (
                    <img src={form.certificateBackgroundTemplateUrl} alt="Cert Template" className="max-h-full object-contain" />
                  ) : (
                    <span className="text-slate-500">Official Gold Filigree</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block cursor-pointer py-2 px-3 bg-slate-700 hover:bg-slate-600 text-slate-200 text-center font-semibold rounded-lg transition">
                  <Upload className="w-3.5 h-3.5 inline mr-1" />
                  Upload Certificate JPG
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={(e) => handleFileUpload(e, 'certificateBackgroundTemplateUrl')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Gemologist & Cert Defaults */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2">
            <Award className="w-4 h-4 text-amber-400" />
            Gemological Credentials & Numbering Formats
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Chief Gemologist Name</label>
              <input
                type="text"
                value={form.defaultGemologistName}
                onChange={(e) => setForm({ ...form, defaultGemologistName: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Gemologist Qualifications & Title</label>
              <input
                type="text"
                value={form.defaultGemologistTitle}
                onChange={(e) => setForm({ ...form, defaultGemologistTitle: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Invoice Code Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => setForm({ ...form, invoicePrefix: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Certificate Code Prefix</label>
              <input
                type="text"
                value={form.certificatePrefix}
                onChange={(e) => setForm({ ...form, certificatePrefix: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Order Code Prefix</label>
              <input
                type="text"
                value={form.orderPrefix}
                onChange={(e) => setForm({ ...form, orderPrefix: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save System Settings & Templates
        </button>
      </form>
    </div>
  );
};
