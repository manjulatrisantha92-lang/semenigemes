import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  AlertTriangle,
  FolderPlus,
  Package,
  Layers,
} from 'lucide-react';

interface CategoryManagementModalProps {
  onClose: () => void;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({ onClose }) => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    products,
    showToast,
  } = useApp();

  const [newCatName, setNewCatName] = useState('');
  const [editingCatName, setEditingCatName] = useState<string | null>(null);
  const [editInputValue, setEditInputValue] = useState('');
  const [deletingCatName, setDeletingCatName] = useState<string | null>(null);
  const [reassignCategory, setReassignCategory] = useState<string>('');

  const getProductCount = (catName: string) => {
    return products.filter((p) => p.category === catName).length;
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      showToast('Please enter a category name.', 'error');
      return;
    }
    const success = addCategory(newCatName.trim());
    if (success) {
      setNewCatName('');
    }
  };

  const handleStartEdit = (cat: string) => {
    setEditingCatName(cat);
    setEditInputValue(cat);
  };

  const handleSaveEdit = (oldName: string) => {
    if (!editInputValue.trim()) {
      showToast('Category name cannot be empty.', 'error');
      return;
    }
    const success = updateCategory(oldName, editInputValue.trim());
    if (success) {
      setEditingCatName(null);
      setEditInputValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingCatName(null);
    setEditInputValue('');
  };

  const handleStartDelete = (cat: string) => {
    setDeletingCatName(cat);
    const availableFallbacks = categories.filter((c) => c !== cat);
    setReassignCategory(availableFallbacks[0] || '');
  };

  const handleConfirmDelete = () => {
    if (!deletingCatName) return;
    const success = deleteCategory(deletingCatName, reassignCategory || undefined);
    if (success) {
      setDeletingCatName(null);
      setReassignCategory('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-[#0F131C] text-[#E0E0E0] rounded-2xl shadow-2xl border border-[#232B3C] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#141924] border-b border-[#232B3C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Tags className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Product Category Management</h2>
              <p className="text-xs text-gray-400">
                Add, rename, or remove product categories across the inventory, POS and barcode generators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white bg-[#1A2130] rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Category Form */}
          <form onSubmit={handleAdd} className="bg-[#141924] border border-[#232B3C] p-4 rounded-xl space-y-3">
            <label className="block text-xs font-bold text-gray-200">
              Add New Category
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FolderPlus className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Diamond Pendants, Luxury Watches, Brooches..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#182030] border border-[#2C384E] rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>
          </form>

          {/* Delete Confirmation Alert Bar */}
          {deletingCatName && (
            <div className="bg-rose-950/40 border border-rose-500/40 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1 flex-1 text-xs">
                  <h4 className="font-bold text-rose-300">
                    Delete Category "{deletingCatName}"?
                  </h4>
                  <p className="text-gray-300">
                    There are <strong className="text-white">{getProductCount(deletingCatName)} products</strong> currently assigned to this category.
                  </p>

                  {getProductCount(deletingCatName) > 0 && categories.filter((c) => c !== deletingCatName).length > 0 && (
                    <div className="pt-2">
                      <label className="block text-gray-300 text-[11px] font-bold mb-1">
                        Reassign existing items to:
                      </label>
                      <select
                        value={reassignCategory}
                        onChange={(e) => setReassignCategory(e.target.value)}
                        className="bg-[#182030] border border-rose-500/40 rounded-lg px-2.5 py-1.5 text-xs text-white w-full max-w-xs focus:outline-none"
                      >
                        {categories
                          .filter((c) => c !== deletingCatName)
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-rose-500/20">
                <button
                  type="button"
                  onClick={() => setDeletingCatName(null)}
                  className="px-3 py-1.5 bg-[#1A2130] text-gray-300 hover:text-white rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-md"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold px-1 uppercase tracking-wider">
              <span>Existing Categories ({categories.length})</span>
              <span>Assigned Products</span>
            </div>

            <div className="divide-y divide-[#1C2433] bg-[#141924] border border-[#232B3C] rounded-2xl overflow-hidden">
              {categories.map((cat) => {
                const count = getProductCount(cat);
                const isEditing = editingCatName === cat;

                return (
                  <div
                    key={cat}
                    className="p-3 sm:px-4 flex items-center justify-between gap-3 hover:bg-[#182030]/60 transition"
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editInputValue}
                          onChange={(e) => setEditInputValue(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(cat);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="bg-[#0C1017] border border-amber-500 rounded-lg px-2.5 py-1 text-xs font-bold text-white w-full max-w-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat)}
                          className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg border border-emerald-500/40"
                          title="Save Changes"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-gray-400 rounded-lg"
                          title="Cancel"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5">
                        <Layers className="w-4 h-4 text-amber-400/70" />
                        <span className="font-bold text-xs text-white">{cat}</span>
                      </div>
                    )}

                    {!isEditing && (
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 bg-[#1B2333] border border-[#29354B] rounded-md text-gray-300 flex items-center gap-1">
                          <Package className="w-3 h-3 text-gray-400" />
                          {count} {count === 1 ? 'item' : 'items'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(cat)}
                            className="p-1.5 bg-[#1B2333] hover:bg-[#253045] text-slate-300 hover:text-white rounded-lg transition"
                            title="Rename Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartDelete(cat)}
                            disabled={categories.length <= 1}
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={categories.length <= 1 ? 'Cannot delete last category' : 'Delete Category'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#141924] border-t border-[#232B3C] flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            Changes are immediately synchronized to all inventory pages and filters.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
