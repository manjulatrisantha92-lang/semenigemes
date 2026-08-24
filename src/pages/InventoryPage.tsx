import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Product,
  ProductCategory,
  MetalPurity,
  GemstoneType,
  GemstoneDetail,
} from '../types';
import {
  Gem,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Barcode,
  Sparkles,
  Download,
  Printer,
  Scale,
  DollarSign,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Layers,
  Camera,
  Tags,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MultiImageUploadField } from '../components/common/MultiImageUploadField';
import { CategoryManagementModal } from '../components/categories/CategoryManagementModal';

export const InventoryPage: React.FC = () => {
  const {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    workshops,
    settings,
    formatCurrency,
    showToast,
    setActivePrintBarcodeProduct,
    setCurrentPage,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkshopStatus, setSelectedWorkshopStatus] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [viewingGalleryProduct, setViewingGalleryProduct] = useState<Product | null>(null);
  const [galleryActiveIndex, setGalleryActiveIndex] = useState(0);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Rings');
  const [itemCode, setItemCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [metalPurity, setMetalPurity] = useState<MetalPurity>('18K Yellow Gold (750)');
  const [grossWeight, setGrossWeight] = useState<number>(5.5);
  const [netGoldWeight, setNetGoldWeight] = useState<number>(4.8);
  const [makingCharges, setMakingCharges] = useState<number>(18000);
  const [costPrice, setCostPrice] = useState<number>(140000);
  const [sellingPrice, setSellingPrice] = useState<number>(220000);
  const [stockQuantity, setStockQuantity] = useState<number>(1);
  const [minStockAlert, setMinStockAlert] = useState<number>(1);
  const [workshopStatus, setWorkshopStatus] = useState<'In Workshop' | 'Completed' | 'Pending' | 'Ready for Sale'>('Ready for Sale');
  const [assignedWorkshopId, setAssignedWorkshopId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);

  // Gem details in product
  const [hasGemstone, setHasGemstone] = useState(true);
  const [gemType, setGemType] = useState<GemstoneType>('Blue Sapphire');
  const [gemCarat, setGemCarat] = useState<number>(2.1);
  const [gemCut, setGemCut] = useState('Oval Mixed Cut');
  const [gemColor, setGemColor] = useState('Royal Blue');
  const [gemClarity, setGemClarity] = useState('VVS');
  const [gemOrigin, setGemOrigin] = useState('Ratnapura, Sri Lanka');

  const allCategoryFilterOptions = ['All', ...categories];

  // Auto Generate Item Code / Barcode
  const handleGenerateCodes = () => {
    const randomCode = `WCS-${category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const randomBarcode = `894${Math.floor(10000000 + Math.random() * 90000000)}`;
    setItemCode(randomCode);
    setBarcode(randomBarcode);
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setName('');
    setCategory('Rings');
    handleGenerateCodes();
    setMetalPurity('18K Yellow Gold (750)');
    setGrossWeight(5.5);
    setNetGoldWeight(4.8);
    setMakingCharges(18000);
    setCostPrice(140000);
    setSellingPrice(220000);
    setStockQuantity(1);
    setMinStockAlert(1);
    setWorkshopStatus('Ready for Sale');
    setAssignedWorkshopId('');
    setImageUrl('https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80');
    setAdditionalImages([]);
    setHasGemstone(true);
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setName(p.name);
    setCategory(p.category);
    setItemCode(p.itemCode);
    setBarcode(p.barcode);
    setMetalPurity(p.metalPurity);
    setGrossWeight(p.grossWeight);
    setNetGoldWeight(p.netGoldWeight);
    setMakingCharges((p as any).makingCharges || 15000);
    setCostPrice(p.costPrice);
    setSellingPrice(p.sellingPrice);
    setStockQuantity(p.stockQuantity);
    setMinStockAlert(p.minStockAlert);
    setWorkshopStatus(p.workshopStatus);
    setAssignedWorkshopId((p as any).assignedWorkshopId || '');
    setImageUrl(p.imageUrl);
    setAdditionalImages(p.additionalImages || []);

    if (p.gemstoneDetails.length > 0) {
      setHasGemstone(true);
      const g = p.gemstoneDetails[0];
      setGemType(g.gemType);
      setGemCarat(g.caratWeight);
      setGemCut(g.cutShape);
      setGemColor(g.color);
      setGemClarity(g.clarity);
      setGemOrigin(g.origin);
    } else {
      setHasGemstone(false);
    }
    setShowModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !itemCode.trim()) {
      showToast('Name and item code are required.', 'error');
      return;
    }

    const gemstoneDetails: GemstoneDetail[] = hasGemstone
      ? [
          {
            gemType,
            caratWeight: gemCarat,
            cutShape: gemCut,
            color: gemColor,
            clarity: gemClarity,
            origin: gemOrigin,
          },
        ]
      : [];

    const totalCaratWeight = hasGemstone ? gemCarat : undefined;

    if (editingProductId) {
      updateProduct(editingProductId, {
        name: name.trim(),
        category,
        itemCode: itemCode.trim(),
        barcode: barcode.trim(),
        metalPurity,
        grossWeight,
        netGoldWeight,
        makingCharges,
        gemstoneDetails,
        totalCaratWeight,
        costPrice,
        sellingPrice,
        stockQuantity,
        minStockAlert,
        workshopStatus,
        assignedWorkshopId: assignedWorkshopId || undefined,
        imageUrl,
        additionalImages,
      });
      showToast(`Updated item "${name.trim()}" successfully!`, 'success');
    } else {
      addProduct({
        name: name.trim(),
        category,
        itemCode: itemCode.trim(),
        barcode: barcode.trim(),
        metalPurity,
        grossWeight,
        netGoldWeight,
        makingCharges,
        gemstoneDetails,
        totalCaratWeight,
        costPrice,
        sellingPrice,
        stockQuantity,
        minStockAlert,
        workshopStatus,
        assignedWorkshopId: assignedWorkshopId || undefined,
        imageUrl,
        additionalImages,
      });
      showToast(`Added new item "${name.trim()}" to catalog!`, 'success');
    }

    setShowModal(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode.includes(searchTerm) ||
      p.metalPurity.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesWorkshop =
      selectedWorkshopStatus === 'All' || p.workshopStatus === selectedWorkshopStatus;
    const matchesLowStock = !showLowStockOnly || p.stockQuantity <= p.minStockAlert;

    return matchesSearch && matchesCategory && matchesWorkshop && matchesLowStock;
  });

  const exportCSV = () => {
    const headers = [
      'Item Code',
      'Barcode',
      'Name',
      'Category',
      'Purity',
      'Gross Wt (g)',
      'Carat Wt',
      'Cost Price (LKR)',
      'Selling Price (LKR)',
      'Stock Qty',
      'Workshop Status',
    ];
    const rows = filteredProducts.map((p) => [
      p.itemCode,
      p.barcode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.metalPurity,
      p.grossWeight,
      p.totalCaratWeight || 0,
      p.costPrice,
      p.sellingPrice,
      p.stockQuantity,
      p.workshopStatus,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WCS_Inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported inventory catalog as CSV.', 'success');
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Gem className="w-5 h-5 text-amber-400" />
            Jewelry & Gemstone Inventory Management
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain gold jewelry, unmounted Ceylon gems, gross weights, making charges & workshop status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs font-bold rounded-xl border border-amber-500/30 transition shadow-sm"
          >
            <Tags className="w-4 h-4 text-amber-400" />
            Manage Categories
          </button>

          <button
            onClick={() => setCurrentPage('barcode_generator')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-xs font-bold rounded-xl border border-emerald-500/30 transition shadow-sm"
          >
            <Barcode className="w-4 h-4 text-emerald-400" />
            Barcode Generator (Thermal)
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold rounded-xl shadow-lg transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add Jewelry / Gemstone
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {allCategoryFilterOptions.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowCategoryModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition flex items-center gap-1 shrink-0"
            title="Add, rename, or delete categories"
          >
            <Tags className="w-3 h-3 text-amber-400" />
            <span>+ Edit Categories</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, barcode, code, gold..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <select
              value={selectedWorkshopStatus}
              onChange={(e) => setSelectedWorkshopStatus(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-amber-500"
            >
              <option value="All">All Workshop Statuses</option>
              <option value="Ready for Sale">Ready for Sale</option>
              <option value="In Workshop">In Workshop</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 w-full">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
                className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" />
                Show Low Stock Only
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Inventory Products Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-800/80 text-slate-300 uppercase text-[11px] font-semibold border-b border-slate-700">
                <th className="py-3 px-3">Product</th>
                <th className="py-3 px-3">Category & Purity</th>
                <th className="py-3 px-3">Gemstone Specs</th>
                <th className="py-3 px-3 text-right">Weight</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Selling Price</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-500">
                    No jewelry or gemstone items found matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="relative cursor-pointer group shrink-0"
                          onClick={() => {
                            setViewingGalleryProduct(prod);
                            setGalleryActiveIndex(0);
                          }}
                          title="Click to view full image gallery"
                        >
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-11 h-11 rounded-lg object-cover border border-amber-500/30 group-hover:border-amber-400 transition"
                          />
                          {prod.additionalImages && prod.additionalImages.length > 0 && (
                            <span className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-[#0F1115] text-[9px] font-black px-1 rounded-full shadow">
                              +{prod.additionalImages.length}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-100">{prod.name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="text-amber-400">{prod.itemCode}</span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Barcode className="w-3 h-3 text-slate-500" />
                              {prod.barcode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-200">{prod.category}</p>
                      <p className="text-[11px] text-amber-400/90">{prod.metalPurity}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {prod.gemstoneDetails.length > 0 ? (
                        <div>
                          <span className="font-medium text-amber-300">
                            {prod.totalCaratWeight}ct {prod.gemstoneDetails[0].gemType}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {prod.gemstoneDetails[0].cutShape} • {prod.gemstoneDetails[0].origin}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500">Plain Precious Metal</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-semibold text-slate-200">{prod.grossWeight} g</p>
                      {prod.netGoldWeight && (
                        <p className="text-[10px] text-slate-400">Net: {prod.netGoldWeight}g</p>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      {formatCurrency(prod.costPrice)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-amber-400 text-sm">
                      {formatCurrency(prod.sellingPrice)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          prod.stockQuantity <= prod.minStockAlert
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}
                      >
                        {prod.stockQuantity}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          prod.workshopStatus === 'Ready for Sale'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : prod.workshopStatus === 'In Workshop'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {prod.workshopStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        onClick={() => setActivePrintBarcodeProduct(prod)}
                        className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 rounded-lg transition border border-emerald-500/20"
                        title="Print Barcode & Labels"
                      >
                        <Barcode className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => openEditModal(prod)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${prod.name}?`)) {
                            deleteProduct(prod.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-3xl w-full shadow-2xl text-slate-100 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Gem className="w-5 h-5 text-amber-400" />
                {editingProductId ? 'Edit Jewelry / Gemstone Item' : 'Add New Jewelry / Gemstone to Inventory'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-slate-300 mb-1 font-semibold">Jewelry / Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ceylon Royal Blue Sapphire Ring"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Item Code *</label>
                  <input
                    type="text"
                    required
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Barcode *</label>
                  <input
                    type="text"
                    required
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleGenerateCodes}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-semibold rounded-lg border border-slate-700"
                  >
                    Auto Generate Codes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Precious Metal *</label>
                  <select
                    value={metalPurity}
                    onChange={(e) => setMetalPurity(e.target.value as MetalPurity)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    {[
                      '22K Yellow Gold (916)',
                      '18K Yellow Gold (750)',
                      '18K White Gold (750)',
                      '18K Rose Gold (750)',
                      '14K Gold (585)',
                      '9K Gold (375)',
                      'Platinum 950',
                      'Sterling Silver 925',
                      'Loose Gemstone (Unmounted)',
                    ].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Gross Weight (Grams) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={grossWeight}
                    onChange={(e) => setGrossWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Net Gold Weight (Grams)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={netGoldWeight}
                    onChange={(e) => setNetGoldWeight(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Gemstone sub specs toggle */}
              <div className="p-3 bg-slate-800/60 rounded-xl space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-400">
                  <input
                    type="checkbox"
                    checked={hasGemstone}
                    onChange={(e) => setHasGemstone(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500"
                  />
                  <span>Includes Natural Gemstone(s)</span>
                </label>

                {hasGemstone && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-700">
                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Gemstone Variety</label>
                      <select
                        value={gemType}
                        onChange={(e) => setGemType(e.target.value as GemstoneType)}
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
                      <label className="block text-slate-300 mb-1 font-medium">Carat Weight (Cts)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={gemCarat}
                        onChange={(e) => setGemCarat(Number(e.target.value))}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 mb-1 font-medium">Cut & Shape</label>
                      <input
                        type="text"
                        value={gemCut}
                        onChange={(e) => setGemCut(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Financial & Stock Details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Cost Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={costPrice}
                    onChange={(e) => setCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Selling Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Min Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Workshop Status</label>
                  <select
                    value={workshopStatus}
                    onChange={(e) => setWorkshopStatus(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="Ready for Sale">Ready for Sale</option>
                    <option value="In Workshop">In Workshop</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Assigned Workshop (Optional)</label>
                  <select
                    value={assignedWorkshopId}
                    onChange={(e) => setAssignedWorkshopId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">-- None / In-house Stock --</option>
                    {workshops.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-1">
                <MultiImageUploadField
                  primaryImageUrl={imageUrl}
                  onPrimaryImageChange={setImageUrl}
                  additionalImages={additionalImages}
                  onAdditionalImagesChange={setAdditionalImages}
                  categoryPresets={category === 'Loose Gemstones' ? 'gemstone' : 'jewelry'}
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-lg"
                >
                  {editingProductId ? 'Update Product Details' : 'Save to Inventory Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal onClose={() => setShowCategoryModal(false)} />
      )}

      {/* Product Image Gallery Preview Modal */}
      {viewingGalleryProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setViewingGalleryProduct(null)}
        >
          <div
            className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl max-w-3xl w-full p-5 text-white shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#2D3139] pb-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#D4AF37]" />
                  {viewingGalleryProduct.name} &bull; Image Gallery
                </h3>
                <p className="text-xs text-gray-400 font-mono">
                  Item Code: {viewingGalleryProduct.itemCode} | Category: {viewingGalleryProduct.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingGalleryProduct(null)}
                className="p-1.5 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Image Display */}
            {(() => {
              const allPhotos = [
                viewingGalleryProduct.imageUrl,
                ...(viewingGalleryProduct.additionalImages || []),
              ].filter(Boolean);

              const currentImg = allPhotos[galleryActiveIndex] || viewingGalleryProduct.imageUrl;

              return (
                <div className="space-y-3">
                  <div className="relative bg-[#0F1115] rounded-xl overflow-hidden flex items-center justify-center min-h-[340px] max-h-[460px] border border-[#2D3139]">
                    <img
                      src={currentImg}
                      alt={viewingGalleryProduct.name}
                      className="max-h-[440px] w-auto object-contain mx-auto"
                    />

                    {allPhotos.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryActiveIndex((prev) =>
                              prev === 0 ? allPhotos.length - 1 : prev - 1
                            )
                          }
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGalleryActiveIndex((prev) =>
                              prev === allPhotos.length - 1 ? 0 : prev + 1
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black text-white rounded-full transition"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row */}
                  {allPhotos.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {allPhotos.map((photo, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setGalleryActiveIndex(idx)}
                          className={`relative rounded-lg overflow-hidden border-2 transition shrink-0 ${
                            galleryActiveIndex === idx
                              ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-105'
                              : 'border-[#2D3139] opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={photo}
                            alt="thumbnail"
                            className="w-16 h-16 object-cover"
                          />
                          {idx === 0 && (
                            <span className="absolute top-0 left-0 bg-[#D4AF37] text-[#0F1115] text-[8px] font-bold px-1 rounded-br">
                              Main
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
