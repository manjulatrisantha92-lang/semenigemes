import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Database, Download, Upload, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const BackupRestorePage: React.FC = () => {
  const {
    products,
    invoices,
    certificates,
    orders,
    workshops,
    workshopEmployees,
    workshopAdvances,
    purchases,
    customers,
    users,
    settings,
    resetToFactoryDemo,
    showToast,
  } = useApp();

  const [restoreJson, setRestoreJson] = useState('');

  const handleDownloadBackup = () => {
    const backupData = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      company: settings.companyName,
      database: {
        products,
        invoices,
        certificates,
        orders,
        workshops,
        workshopEmployees,
        workshopAdvances,
        purchases,
        customers,
        users,
        settings,
      },
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wcs_inventory_invoice_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Database backup downloaded successfully!', 'success');
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed.database) {
          localStorage.setItem('wcs_inventory_products', JSON.stringify(parsed.database.products || []));
          localStorage.setItem('wcs_inventory_invoices', JSON.stringify(parsed.database.invoices || []));
          localStorage.setItem('wcs_inventory_certificates', JSON.stringify(parsed.database.certificates || []));
          localStorage.setItem('wcs_inventory_orders', JSON.stringify(parsed.database.orders || []));
          localStorage.setItem('wcs_inventory_workshops', JSON.stringify(parsed.database.workshops || []));
          localStorage.setItem('wcs_inventory_settings', JSON.stringify(parsed.database.settings || settings));
          showToast('Database restored! Reloading application...', 'success');
          setTimeout(() => window.location.reload(), 1200);
        } else {
          showToast('Invalid backup file format.', 'error');
        }
      } catch (err) {
        showToast('Failed to parse backup JSON file.', 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleFactoryReset = () => {
    if (confirm('Are you sure you want to reset all data back to Sri Lankan jewelry demo records? This will clear recent custom changes.')) {
      resetToFactoryDemo();
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Database className="w-4 h-4" />
          <span>Data Maintenance</span>
        </div>
        <h2 className="text-xl font-serif font-bold text-white">Database Backup & Disaster Recovery</h2>
        <p className="text-xs text-slate-400">
          Export full system snapshots, import historical backups, or reset demo database safely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Export Backup Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Download className="w-5 h-5" />
              <h3>Download Complete JSON Snapshot</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export all {products.length} inventory gemstones, {invoices.length} invoices, {certificates.length} certificates, {orders.length} work orders, and accounting ledgers into a portable JSON backup file.
            </p>
          </div>

          <button
            onClick={handleDownloadBackup}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download Database JSON (.json)
          </button>
        </div>

        {/* Restore Backup Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
              <Upload className="w-5 h-5" />
              <h3>Restore From File</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a previously downloaded `.json` database snapshot to instantly restore system state, client registry, and inventory catalogs.
            </p>
          </div>

          <label className="w-full cursor-pointer py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2">
            <Upload className="w-4 h-4 text-blue-400" />
            Select JSON File to Restore
            <input
              type="file"
              accept="application/json"
              onChange={handleFileRestore}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Factory Reset Safety Box */}
      <div className="bg-slate-900 border border-red-500/20 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertTriangle className="w-4 h-4" />
            <span>Reset Demo Records</span>
          </div>
          <p className="text-xs text-slate-400">
            Re-populate system with fresh Sri Lankan high-jewelry items, certificates, and workshop guilds.
          </p>
        </div>

        <button
          onClick={handleFactoryReset}
          className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white text-xs font-bold rounded-xl border border-red-500/30 transition flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          Factory Demo Reset
        </button>
      </div>
    </div>
  );
};
