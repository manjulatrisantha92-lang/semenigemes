import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkshopAdvance } from '../types';
import { Coins, PlusCircle, Search, Calendar, FileText, Building } from 'lucide-react';

export const WorkshopAdvancesPage: React.FC = () => {
  const {
    workshopAdvances,
    workshops,
    orders,
    addWorkshopAdvance,
    formatCurrency,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedOrderId, setSelectedOrderId] = useState(orders[0]?.id || '');
  const [amount, setAmount] = useState<number>(15000);
  const [notes, setNotes] = useState('Advance paid for gold casting & initial setting');

  const activeOrders = orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled');

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId) {
      showToast('Please select a custom order.', 'error');
      return;
    }

    addWorkshopAdvance(selectedOrderId, amount, notes);
    setShowAddModal(false);
    setAmount(15000);
  };

  const filtered = workshopAdvances.filter(
    (adv) =>
      adv.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adv.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAdvancesSum = workshopAdvances.reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            Workshop Advance Payment Vouchers
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trail of advance cash disbursements to artisan goldsmiths and workshop guilds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400">Total Disbursements:</span>
            <p className="text-base font-bold text-amber-400">{formatCurrency(totalAdvancesSum)}</p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            Issue Advance Voucher
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search voucher #, workshop, order #..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Advances Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-700">
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Workshop Studio</th>
                <th className="py-3 px-4">Order Reference</th>
                <th className="py-3 px-4">Notes / Purpose</th>
                <th className="py-3 px-4 text-right">Advance Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No advance vouchers found.
                  </td>
                </tr>
              ) : (
                filtered.map((adv) => (
                  <tr key={adv.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {adv.voucherNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{adv.date}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-100">{adv.workshopName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      Order #{adv.orderNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{adv.notes}</td>
                    <td className="py-3.5 px-4 text-right font-bold text-amber-400 text-sm">
                      {formatCurrency(adv.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Advance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Issue Workshop Advance Voucher
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateAdvance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Select Active Work Order *</label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {activeOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} — {o.itemName} ({o.workshopName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Advance Payment (LKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Notes / Description</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Record Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
