import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Customer } from '../types';
import {
  Contact,
  PlusCircle,
  Search,
  Phone,
  MapPin,
  Share2,
  Receipt,
  UserCheck,
  Award,
} from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const { customers, addCustomer, invoices, orders, formatCurrency, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nic, setNic] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Colombo');
  const [customerType, setCustomerType] = useState<'Retail' | 'Wholesale' | 'VIP'>('Retail');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      showToast('Name and phone number are required.', 'error');
      return;
    }

    addCustomer({
      name: name.trim(),
      contactNumber: phone.trim(),
      whatsappNumber: phone.trim(),
      nicPassport: nic.trim(),
      address: address.trim() || 'Colombo',
      city: city.trim() || 'Colombo',
      customerType,
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setNic('');
    setAddress('');
  };

  const handleOpenWhatsAppChat = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = `Hello ${customerName}, thank you for choosing WCS Gems & Jewelry! How may we assist with your gemstone or bespoke jewelry inquiries today?`;
    const targetUrl = cleanPhone
      ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(targetUrl, '_blank');
  };

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactNumber.includes(searchTerm) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customerType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Contact className="w-5 h-5 text-amber-400" />
            Customer Directory & Client Relationship Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage clientele contacts, WhatsApp messaging, and purchase histories.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          Add New Client
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search client name, phone number, city, NIC..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((client) => {
          const clientInvoices = invoices.filter((i) => i.customerId === client.id);
          const totalSpent = clientInvoices.reduce((sum, i) => sum + i.grandTotal, 0);
          const clientOrders = orders.filter((o) => o.customerId === client.id);

          return (
            <div
              key={client.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-white text-base">{client.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {client.address}, {client.city}
                    </p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      client.customerType === 'VIP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300'
                    }`}
                  >
                    {client.customerType}
                  </span>
                </div>

                <div className="bg-slate-800/60 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phone / WhatsApp:</span>
                    <span className="font-mono text-slate-200">{client.contactNumber}</span>
                  </div>
                  {client.nicPassport && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">NIC / Passport:</span>
                      <span className="font-mono text-slate-300">{client.nicPassport}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Purchases Count:</span>
                    <span className="font-bold text-white">{clientInvoices.length} Invoices</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Custom Orders:</span>
                    <span className="text-slate-200 font-semibold">{clientOrders.length} Work Orders</span>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/50 rounded-lg border border-slate-800 flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Lifetime Revenue:</span>
                  <span className="text-amber-400">{formatCurrency(totalSpent)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                <button
                  onClick={() => handleOpenWhatsAppChat(client.contactNumber, client.name)}
                  className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Message on WhatsApp
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Contact className="w-5 h-5 text-amber-400" />
                Register New Client
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dilhani Jayasinghe"
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
                  placeholder="+94 77 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">NIC / Passport Number</label>
                <input
                  type="text"
                  placeholder="e.g. 198894020194"
                  value={nic}
                  onChange={(e) => setNic(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Client Segment</label>
                  <select
                    value={customerType}
                    onChange={(e) => setCustomerType(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Retail">Retail</option>
                    <option value="VIP">VIP</option>
                    <option value="Wholesale">Wholesale</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Address</label>
                <input
                  type="text"
                  placeholder="e.g. 102 Alfred Place, Colombo 03"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
