import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Workshop } from '../types';
import {
  Hammer,
  PlusCircle,
  Search,
  MapPin,
  Phone,
  Coins,
  Sparkles,
  Users,
  Building,
  CheckCircle,
} from 'lucide-react';

export const WorkshopsDirectoryPage: React.FC = () => {
  const {
    workshops,
    addWorkshop,
    orders,
    formatCurrency,
    showToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ratnapura');
  const [specialty, setSpecialty] = useState('Sapphire & Gemstone Precision Setting');
  const [dailyRate, setDailyRate] = useState<number>(4500);

  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contactPerson.trim() || !phone.trim()) {
      showToast('Name, contact person, and phone are required.', 'error');
      return;
    }

    addWorkshop({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      contactNumber: phone.trim(),
      address: address.trim() || 'Goldsmiths Street',
      city: city.trim() || 'Ratnapura',
      specialty: specialty.trim(),
      standardMakingRatePerGram: dailyRate,
      activeOrdersCount: 0,
      totalPaidMakingCharges: 0,
    });

    setShowAddModal(false);
    setName('');
    setContactPerson('');
    setPhone('');
    setAddress('');
  };

  const filteredWorkshops = workshops.filter((w) => {
    const term = searchTerm.toLowerCase();
    return (
      w.name.toLowerCase().includes(term) ||
      w.city.toLowerCase().includes(term) ||
      w.contactPerson.toLowerCase().includes(term) ||
      w.specialty.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Hammer className="w-5 h-5 text-amber-400" />
            Artisan Workshop Guilds & Casting Studios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Directory of partner goldsmith workshops, gemstone cutters, and micro-pave masters across Sri Lanka.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add Workshop Guild
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search workshop name, city, master goldsmith, specialty..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Workshop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredWorkshops.map((w) => {
          const activeOrdersForWorkshop = orders.filter(
            (o) => o.workshopId === w.id && (o.status === 'Sent to Workshop' || o.status === 'In Progress')
          );
          const totalAdvancesPaid = orders
            .filter((o) => o.workshopId === w.id)
            .reduce((sum, o) => sum + (o.workshopAdvancePaid || 0), 0);

          return (
            <div
              key={w.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                      <Building className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-white text-base">{w.name}</h3>
                      <p className="text-xs text-amber-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {w.city}, Sri Lanka
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                    {activeOrdersForWorkshop.length} Active
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Master Craftsman:</span>
                    <span className="font-semibold text-slate-200">{w.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone / WhatsApp:</span>
                    <span className="text-slate-200 font-mono">{w.contactNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Specialty:</span>
                    <span className="text-amber-300 font-medium">{w.specialty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Standard Rate/g:</span>
                    <span className="text-slate-200 font-bold">{formatCurrency(w.standardMakingRatePerGram || 3500)}</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 text-[11px] flex justify-between text-slate-300">
                  <span>Total Advances Paid:</span>
                  <span className="font-bold text-amber-400">{formatCurrency(totalAdvancesPaid)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Workshop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Hammer className="w-5 h-5 text-amber-400" />
                Add New Workshop Guild
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Workshop Studio Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ratnapura Gems Guild"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Master Goldsmith / Contact Person *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Ananda Perera"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Contact / WhatsApp Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+94 77 234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ratnapura"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Rate per Gram (LKR)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Craft Specialty</label>
                <input
                  type="text"
                  placeholder="e.g. Micro Pave, Hand Engraving, Platinum Casting"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
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
                  Save Workshop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
