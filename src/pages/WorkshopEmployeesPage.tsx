import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { WorkshopEmployee } from '../types';
import { Users2, PlusCircle, Search, Coins, Sparkles, CheckCircle2, DollarSign } from 'lucide-react';

export const WorkshopEmployeesPage: React.FC = () => {
  const {
    workshopEmployees,
    addWorkshopEmployee,
    recordEmployeeWagePayment,
    workshops,
    formatCurrency,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showWageModal, setShowWageModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<WorkshopEmployee | null>(null);

  // New Employee Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roleTitle, setRoleTitle] = useState('Master Goldsmith & Stone Setter');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState(workshops[0]?.id || '');
  const [dailyRate, setDailyRate] = useState<number>(4500);

  // Wage Payment Form
  const [wageAmount, setWageAmount] = useState<number>(27000);
  const [daysWorked, setDaysWorked] = useState<number>(6);
  const [wageNotes, setWageNotes] = useState('Weekly wage voucher payment');

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Name and phone are required.', 'error');
      return;
    }

    const ws = workshops.find((w) => w.id === selectedWorkshopId);

    addWorkshopEmployee({
      name: name.trim(),
      contactNumber: phone.trim(),
      workshopId: ws?.id || 'w-1',
      workshopName: ws?.name || 'In-House Studio',
      roleTitle: roleTitle.trim(),
      dailyWageRate: dailyRate,
      status: 'active',
      totalEarnedWages: 0,
      totalAdvancesDeducted: 0,
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
  };

  const handlePayWage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    recordEmployeeWagePayment(selectedEmployee.id, wageAmount, wageNotes);
    setShowWageModal(false);
    setSelectedEmployee(null);
  };

  const filtered = workshopEmployees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.roleTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Users2 className="w-5 h-5 text-amber-400" />
            Craftsmen, Artisans & Wage Payments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Roster of skilled Sri Lankan gemstone setters, goldsmiths, and daily wage payment vouchers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Artisan / Goldsmith
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search artisan name, craft specialty, workshop..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Roster Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-700">
                <th className="py-3 px-4">Artisan Name</th>
                <th className="py-3 px-4">Specialty & Craft</th>
                <th className="py-3 px-4">Assigned Workshop</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4 text-right">Daily Wage Rate</th>
                <th className="py-3 px-4 text-right">Total Wages Paid</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-100">{emp.name}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase">
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-amber-300 font-medium">{emp.roleTitle}</td>
                  <td className="py-3.5 px-4 text-slate-300">{emp.workshopName}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{emp.contactNumber}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-slate-200">
                    {formatCurrency(emp.dailyWageRate)}/day
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-400">
                    {formatCurrency(emp.totalEarnedWages)}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setWageAmount(emp.dailyWageRate * 6);
                        setShowWageModal(true);
                      }}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 text-xs font-bold rounded-lg transition inline-flex items-center gap-1"
                    >
                      <Coins className="w-3 h-3" />
                      Pay Wage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users2 className="w-5 h-5 text-amber-400" />
                Add New Artisan
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Artisan Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Kumara Dissanayake"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact / WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Role / Craft Specialty *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Goldsmith & Stone Setter"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Assigned Workshop Studio *</label>
                <select
                  value={selectedWorkshopId}
                  onChange={(e) => setSelectedWorkshopId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  {workshops.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({w.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Daily Wage Rate (LKR) *</label>
                <input
                  type="number"
                  required
                  value={dailyRate}
                  onChange={(e) => setDailyRate(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
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
                  Save Artisan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Wage Modal */}
      {showWageModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Issue Wage Payment Voucher
              </h3>
              <button onClick={() => setShowWageModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePayWage} className="space-y-3 text-xs">
              <div className="bg-slate-800 p-2.5 rounded-lg text-slate-300 space-y-0.5">
                <p className="font-bold text-white">{selectedEmployee.name}</p>
                <p>Role: {selectedEmployee.roleTitle} ({selectedEmployee.workshopName})</p>
                <p>Standard Daily Rate: {formatCurrency(selectedEmployee.dailyWageRate)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Days Worked</label>
                  <input
                    type="number"
                    value={daysWorked}
                    onChange={(e) => {
                      const d = Number(e.target.value);
                      setDaysWorked(d);
                      setWageAmount(d * selectedEmployee.dailyWageRate);
                    }}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Total Wage (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={wageAmount}
                    onChange={(e) => setWageAmount(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-amber-400 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Payment Notes / Voucher Ref</label>
                <input
                  type="text"
                  value={wageNotes}
                  onChange={(e) => setWageNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowWageModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg"
                >
                  Record Wage Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
