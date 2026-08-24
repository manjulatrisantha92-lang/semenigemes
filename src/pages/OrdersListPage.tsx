import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CustomOrder, OrderStatus } from '../types';
import {
  Hammer,
  Clock,
  CheckCircle2,
  XCircle,
  Coins,
  Search,
  Calendar,
  AlertTriangle,
  Receipt,
  Printer,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface OrdersListPageProps {
  filterStatusGroup: 'pending' | 'completed' | 'cancelled';
}

export const OrdersListPage: React.FC<OrdersListPageProps> = ({ filterStatusGroup }) => {
  const {
    orders,
    updateOrderStatus,
    addWorkshopAdvance,
    markOrderCompleted,
    workshops,
    formatCurrency,
    showToast,
    setCurrentPage,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('All');

  // Advance Payment Modal
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [activeOrderForAdvance, setActiveOrderForAdvance] = useState<CustomOrder | null>(null);
  const [advanceAmount, setAdvanceAmount] = useState<number>(10000);
  const [advanceNotes, setAdvanceNotes] = useState('');

  // Complete Order Modal
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [activeOrderForComplete, setActiveOrderForComplete] = useState<CustomOrder | null>(null);
  const [finalGoldWeight, setFinalGoldWeight] = useState<number>(0);
  const [finalMakingCharges, setFinalMakingCharges] = useState<number>(0);

  // Cancel Order Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [activeOrderForCancel, setActiveOrderForCancel] = useState<CustomOrder | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Customer changed design specifications');

  // Filter orders according to group
  const filteredOrders = orders.filter((o) => {
    let matchesGroup = true;
    if (filterStatusGroup === 'pending') {
      matchesGroup =
        o.status === 'Pending' ||
        o.status === 'Sent to Workshop' ||
        o.status === 'In Progress' ||
        o.status === 'Ready for Quality Check';
    } else if (filterStatusGroup === 'completed') {
      matchesGroup = o.status === 'Completed' || o.status === 'Delivered';
    } else if (filterStatusGroup === 'cancelled') {
      matchesGroup = o.status === 'Cancelled';
    }

    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.workshopName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWorkshop =
      selectedWorkshopFilter === 'All' || o.workshopId === selectedWorkshopFilter;

    return matchesGroup && matchesSearch && matchesWorkshop;
  });

  const handleRecordAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForAdvance) return;

    addWorkshopAdvance(
      activeOrderForAdvance.id,
      advanceAmount,
      advanceNotes || `Advance voucher for ${activeOrderForAdvance.itemName}`
    );
    setShowAdvanceModal(false);
    setActiveOrderForAdvance(null);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForComplete) return;

    markOrderCompleted(activeOrderForComplete.id, finalGoldWeight, finalMakingCharges);
    setShowCompleteModal(false);
    setActiveOrderForComplete(null);
  };

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrderForCancel) return;

    updateOrderStatus(activeOrderForCancel.id, 'Cancelled');
    showToast(`Order #${activeOrderForCancel.orderNumber} marked as Cancelled. Gold recovery audit logged.`, 'warning');
    setShowCancelModal(false);
    setActiveOrderForCancel(null);
  };

  const groupTitles = {
    pending: {
      title: 'Pending & Active Workshop Orders',
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      desc: 'Track custom jewelry orders currently in progress at artisan workshops.',
    },
    completed: {
      title: 'Completed Workshop Orders',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      desc: 'Finished custom jewelry pieces ready for final customer delivery or showroom stock.',
    },
    cancelled: {
      title: 'Cancelled Workshop Orders',
      icon: <XCircle className="w-5 h-5 text-red-400" />,
      desc: 'Order cancellations and metal recovery audits.',
    },
  };

  const currentGroupInfo = groupTitles[filterStatusGroup];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            {currentGroupInfo.icon}
            {currentGroupInfo.title}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{currentGroupInfo.desc}</p>
        </div>

        <button
          onClick={() => setCurrentPage('create_order')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
        >
          <Hammer className="w-4 h-4" />
          Create New Order
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order #, customer, item, workshop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <select
            value={selectedWorkshopFilter}
            onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
          >
            <option value="All">All Workshops ({workshops.length})</option>
            {workshops.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.city})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            No {filterStatusGroup} custom orders found.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 shadow-xl space-y-4 transition"
            >
              {/* Order Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={order.designImageUrl}
                    alt={order.itemName}
                    className="w-14 h-14 rounded-xl object-cover border border-amber-500/30 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {order.orderNumber}
                    </span>
                    <h3 className="font-serif font-bold text-white text-base mt-1 line-clamp-1">
                      {order.itemName}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Client: <span className="text-slate-200 font-semibold">{order.customerName}</span> ({order.customerPhone})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.status === 'Completed' || order.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : order.status === 'Cancelled'
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {order.status}
                  </span>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Due: {order.requiredDeliveryDate}</p>
                </div>
              </div>

              {/* Order Specifications Body */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-800/60 rounded-xl p-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Workshop</span>
                  <span className="font-semibold text-slate-200 truncate block">{order.workshopName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Metal Allocated</span>
                  <span className="font-semibold text-slate-200">{order.allocatedMetalWeight}g ({order.metalPurity.split(' ')[0]})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Client Agreed</span>
                  <span className="font-bold text-amber-400">{formatCurrency(order.agreedPriceToCustomer)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Customer Paid</span>
                  <span className="font-bold text-emerald-400">{formatCurrency(order.customerAdvancePaid)}</span>
                </div>
              </div>

              {/* Stones & Instructions */}
              <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 space-y-1">
                <p>
                  <strong className="text-amber-400">Gems:</strong> {order.gemstonesProvided}
                </p>
                {order.craftingInstructions && (
                  <p>
                    <strong className="text-slate-400">Notes:</strong> {order.craftingInstructions}
                  </p>
                )}
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                  <span>Workshop Advance Paid: <strong className="text-white">{formatCurrency(order.workshopAdvancePaid)}</strong></span>
                  <span>Balance Due From Client: <strong className="text-amber-300">{formatCurrency(order.customerBalanceDue)}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Status Dropdown */}
                {order.status !== 'Cancelled' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Update Stage:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
                    >
                      <option value="Sent to Workshop">Sent to Workshop</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Ready for Quality Check">Quality Check</option>
                      <option value="Completed">Completed</option>
                      <option value="Delivered">Delivered to Client</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  {/* Advance Button */}
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setActiveOrderForAdvance(order);
                        setShowAdvanceModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 font-semibold"
                      title="Pay Workshop Advance"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      Advance
                    </button>
                  )}

                  {/* Mark Complete Button */}
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setActiveOrderForComplete(order);
                        setFinalGoldWeight(order.allocatedMetalWeight);
                        setFinalMakingCharges(order.estimatedMakingCharges);
                        setShowCompleteModal(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-slate-950 rounded-lg font-semibold transition"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Complete
                    </button>
                  )}

                  {/* Cancel Button */}
                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setActiveOrderForCancel(order);
                        setShowCancelModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg"
                      title="Cancel Order"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Pay Workshop Advance */}
      {showAdvanceModal && activeOrderForAdvance && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                Pay Workshop Advance Voucher
              </h3>
              <button onClick={() => setShowAdvanceModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRecordAdvance} className="space-y-3 text-xs">
              <div className="bg-slate-800 p-2.5 rounded-lg space-y-0.5 text-slate-300">
                <p className="font-semibold text-white">{activeOrderForAdvance.itemName} (#{activeOrderForAdvance.orderNumber})</p>
                <p>Workshop: <span className="text-amber-400 font-medium">{activeOrderForAdvance.workshopName}</span></p>
                <p>Prior Advances Paid: <span className="font-bold text-white">{formatCurrency(activeOrderForAdvance.workshopAdvancePaid)}</span></p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Advance Payment Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-amber-400 text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Voucher Notes / Cheque Ref</label>
                <input
                  type="text"
                  placeholder="e.g. Cash advance paid for setting master artisan"
                  value={advanceNotes}
                  onChange={(e) => setAdvanceNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanceModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg"
                >
                  Issue Advance Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Mark Order Completed */}
      {showCompleteModal && activeOrderForComplete && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Receive Finished Custom Jewelry
              </h3>
              <button onClick={() => setShowCompleteModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-3 text-xs">
              <div className="bg-slate-800 p-2.5 rounded-lg space-y-0.5 text-slate-300">
                <p className="font-semibold text-white">{activeOrderForComplete.itemName}</p>
                <p>Allocated Gold: {activeOrderForComplete.allocatedMetalWeight}g ({activeOrderForComplete.metalPurity})</p>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Final Finished Gross Weight (g) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={finalGoldWeight}
                  onChange={(e) => setFinalGoldWeight(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Final Workshop Making Charges (LKR) *</label>
                <input
                  type="number"
                  required
                  value={finalMakingCharges}
                  onChange={(e) => setFinalMakingCharges(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-amber-400"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-lg"
                >
                  Confirm Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cancel Order */}
      {showCancelModal && activeOrderForCancel && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancel Work Order #{activeOrderForCancel.orderNumber}
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
              <p className="text-slate-300">
                Are you sure you want to cancel order for <strong>{activeOrderForCancel.itemName}</strong>?
                The {activeOrderForCancel.allocatedMetalWeight}g allocated gold must be audited and returned to vault.
              </p>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Cancellation Reason *</label>
                <input
                  type="text"
                  required
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="w-1/2 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-semibold text-slate-300"
                >
                  Keep Active
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg"
                >
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
