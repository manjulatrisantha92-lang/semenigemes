import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { generateBarcodeSvgElements } from '../utils/barcodeGenerator';
import {
  Printer,
  Download,
  Barcode,
  Layers,
  Sparkles,
  Sliders,
  Check,
  RotateCcw,
  Tag,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  Plus,
  Trash2,
  PackageCheck,
  Eye,
} from 'lucide-react';

export interface LabelSizePreset {
  id: string;
  name: string;
  width: number; // in mm
  height: number; // in mm
  description: string;
  type: 'micro' | 'compact' | 'standard' | 'large' | 'custom';
}

export const LABEL_SIZE_PRESETS: LabelSizePreset[] = [
  {
    id: '50x25',
    name: '50mm x 25mm (Standard)',
    width: 50,
    height: 25,
    description: 'Standard 2"x1" Jewellery / Retail Label (Dumbbell/Rect)',
    type: 'standard',
  },
  {
    id: '20x10',
    name: '20mm x 10mm (Micro Tag)',
    width: 20,
    height: 10,
    description: 'Micro Tag — Jewelry String / Rat-Tail Tag',
    type: 'micro',
  },
  {
    id: '30x20',
    name: '30mm x 20mm (Compact)',
    width: 30,
    height: 20,
    description: 'Small Product & Jewelry Price Tag',
    type: 'compact',
  },
  {
    id: '38x25',
    name: '38mm x 25mm (Jewellery)',
    width: 38,
    height: 25,
    description: 'Standard Price & Item Jewelry Tag',
    type: 'standard',
  },
  {
    id: '40x30',
    name: '40mm x 30mm (Product Tag)',
    width: 40,
    height: 30,
    description: 'Medium Product & Retail Label',
    type: 'compact',
  },
  {
    id: '50x30',
    name: '50mm x 30mm (Large Retail)',
    width: 50,
    height: 30,
    description: 'Large Retail & Supermarket Shelf Label',
    type: 'large',
  },
  {
    id: 'custom',
    name: 'Custom Size (mm)',
    width: 50,
    height: 25,
    description: 'User-defined width and height dimensions',
    type: 'custom',
  },
];

interface BatchItem {
  product: Product;
  quantity: number;
}

export const BarcodeGeneratorPage: React.FC = () => {
  const { products, settings, formatCurrency, showToast } = useApp();

  // Mode Selection: 'single' | 'batch'
  const [mode, setMode] = useState<'single' | 'batch'>('single');

  // Selected Product for Single Mode
  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );

  // Batch Items Queue
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);

  // Columns & Gap Settings
  const [columns, setColumns] = useState<number>(1); // 1, 2, 3, 4, 5
  const [colGap, setColGap] = useState<number>(4.0); // mm (default 4mm ★)
  const [rowGap, setRowGap] = useState<number>(4.0); // mm (default 4mm)
  const [outerMargin, setOuterMargin] = useState<number>(3.0); // mm (default 3mm)

  // Label Size Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('50x25');
  const [customWidth, setCustomWidth] = useState<number>(50);
  const [customHeight, setCustomHeight] = useState<number>(25);

  // Single Mode Copies
  const [copiesCount, setCopiesCount] = useState<number>(2);

  // Visible Fields on Sticker Checkboxes
  const [visibleFields, setVisibleFields] = useState({
    storeName: true,
    productName: true,
    sellingPrice: true,
    barcodeText: true,
    expiryDate: true,
    customBadge: false,
  });

  const [customBadgeText, setCustomBadgeText] = useState<string>('22K Gold');
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  // Selected product object
  const activeProduct = useApp().products.find((p) => p.id === selectedProductId) || products[0] || {
    id: 'demo-1',
    itemCode: 'RICE-SAM-5K',
    barcode: '4792011001012',
    name: 'Keells Super Samba Rice 5kg',
    category: 'Rings',
    description: '',
    imageUrl: '',
    metalPurity: '22K Sri Lankan Gold (916)',
    grossWeight: 5.0,
    netGoldWeight: 5.0,
    gemstoneDetails: [],
    totalCaratWeight: 0,
    costPrice: 950,
    sellingPrice: 1250,
    stockQuantity: 45,
    minStockAlert: 10,
    workshopStatus: 'in_stock',
    createdAt: '',
    updatedAt: '',
  };

  // Dimensions of current label
  const currentDimensions = useMemo(() => {
    const preset = LABEL_SIZE_PRESETS.find((p) => p.id === selectedPresetId);
    if (preset && preset.id !== 'custom') {
      return { width: preset.width, height: preset.height };
    }
    return { width: customWidth, height: customHeight };
  }, [selectedPresetId, customWidth, customHeight]);

  // Total labels to print
  const totalLabelsList = useMemo(() => {
    if (mode === 'single') {
      return Array.from({ length: Math.max(1, copiesCount) }).map(() => activeProduct);
    }
    const list: Product[] = [];
    batchItems.forEach((b) => {
      for (let i = 0; i < b.quantity; i++) {
        list.push(b.product);
      }
    });
    return list.length > 0 ? list : [activeProduct];
  }, [mode, copiesCount, activeProduct, batchItems]);

  // Load Low Stock Batch
  const handleLoadLowStock = () => {
    const lowStock = products.filter((p) => p.stockQuantity <= p.minStockAlert);
    if (lowStock.length === 0) {
      showToast('No low stock items found. All products are well stocked!', 'info');
      return;
    }
    const newBatch: BatchItem[] = lowStock.map((p) => ({
      product: p,
      quantity: Math.max(2, p.minStockAlert * 2 - p.stockQuantity),
    }));
    setBatchItems(newBatch);
    setMode('batch');
    showToast(`Loaded ${lowStock.length} low-stock products into label queue!`, 'success');
  };

  // Load Category into Batch
  const handleLoadCategory = (category: string) => {
    if (!category) return;
    const catProducts = products.filter((p) => p.category === category);
    if (catProducts.length === 0) {
      showToast(`No products found in category "${category}"`, 'info');
      return;
    }
    const newBatch: BatchItem[] = catProducts.map((p) => ({
      product: p,
      quantity: 2,
    }));
    setBatchItems((prev) => [...prev, ...newBatch]);
    setMode('batch');
    showToast(`Added ${catProducts.length} items from ${category} to label queue!`, 'success');
  };

  // Add Current Product to Batch
  const handleAddCurrentToBatch = () => {
    setBatchItems((prev) => {
      const exists = prev.find((item) => item.product.id === activeProduct.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === activeProduct.id
            ? { ...item, quantity: item.quantity + copiesCount }
            : item
        );
      }
      return [...prev, { product: activeProduct, quantity: copiesCount }];
    });
    showToast(`Added ${copiesCount} copies of ${activeProduct.name} to batch queue!`, 'success');
  };

  // Standalone Clean Print View (Matches Screenshot 3)
  const handlePrintLabels = () => {
    const { width, height } = currentDimensions;
    const items = totalLabelsList;

    // Calculate sheet/roll width for CSS
    const totalRowWidth =
      columns === 1
        ? width + outerMargin * 2
        : columns * width + (columns - 1) * colGap + outerMargin * 2;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Labels - ${items.length} Tags (${width}x${height}mm)</title>
          <style>
            @page {
              size: ${totalRowWidth}mm auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
              background: #fff;
              color: #000;
              padding: ${outerMargin}mm;
              display: flex;
              flex-wrap: wrap;
              gap: ${rowGap}mm ${colGap}mm;
              width: ${totalRowWidth}mm;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .label-card {
              width: ${width}mm;
              height: ${height}mm;
              padding: 1.5mm 2mm;
              background: #fff;
              border: 0.2mm solid #e2e8f0;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              overflow: hidden;
              page-break-inside: avoid;
              break-inside: avoid;
              text-align: center;
            }
            @media print {
              .label-card {
                border: none;
              }
            }
            .store-name {
              font-size: ${height <= 15 ? '6px' : height <= 22 ? '7.5px' : '9px'};
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.2px;
              line-height: 1.1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .product-name {
              font-size: ${height <= 15 ? '6.5px' : height <= 22 ? '8.5px' : '10.5px'};
              font-weight: 700;
              line-height: 1.15;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .price-tag {
              font-size: ${height <= 15 ? '7px' : height <= 22 ? '9.5px' : '12px'};
              font-weight: 900;
              line-height: 1.1;
              color: #000;
            }
            .barcode-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              margin: 0.5mm 0;
            }
            .barcode-svg {
              width: 90%;
              max-height: ${height <= 15 ? '8px' : height <= 22 ? '14px' : '18px'};
            }
            .barcode-text {
              font-family: "Courier New", Courier, monospace;
              font-size: ${height <= 15 ? '5.5px' : '7.5px'};
              letter-spacing: 0.5px;
              font-weight: bold;
              line-height: 1;
              margin-top: 0.5mm;
            }
            .footer-row {
              display: flex;
              justify-content: space-between;
              font-size: ${height <= 15 ? '5px' : '6.5px'};
              font-family: monospace;
              font-weight: 600;
              color: #333;
              border-top: 0.15mm solid #ddd;
              padding-top: 0.3mm;
            }
            .custom-badge {
              display: inline-block;
              font-size: 6.5px;
              font-weight: 800;
              background: #000;
              color: #fff;
              padding: 0.5px 3px;
              border-radius: 1.5px;
              text-transform: uppercase;
            }
          </style>
        </head>
        <body>
          ${items
            .map((item) => {
              const code = item.barcode || '4792011001012';
              const sku = item.itemCode || 'SKU-001';
              const barcodeData = generateBarcodeSvgElements(code, 24, 1.4);
              const barcodeRects = barcodeData.elements
                .map(
                  (el) =>
                    `<rect x="${el.x}" y="0" width="${el.width}" height="${el.height}" fill="#000" />`
                )
                .join('');

              return `
                <div class="label-card">
                  ${
                    visibleFields.storeName
                      ? `<div class="store-name">${settings.companyName || 'WCS SUPERMARKET & RETAIL POS'}</div>`
                      : ''
                  }
                  ${
                    visibleFields.productName
                      ? `<div class="product-name">${item.name}</div>`
                      : ''
                  }
                  ${
                    visibleFields.sellingPrice
                      ? `<div class="price-tag">Rs. ${item.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`
                      : ''
                  }
                  ${
                    visibleFields.customBadge
                      ? `<div><span class="custom-badge">${customBadgeText || item.metalPurity.split(' ')[0]}</span></div>`
                      : ''
                  }

                  <div class="barcode-container">
                    <svg class="barcode-svg" viewBox="0 0 ${barcodeData.totalWidth} 24" preserveAspectRatio="none">
                      ${barcodeRects}
                    </svg>
                    ${
                      visibleFields.barcodeText
                        ? `<div class="barcode-text">${code}</div>`
                        : ''
                    }
                  </div>

                  <div class="footer-row">
                    <span>SKU: ${sku}</span>
                    ${
                      visibleFields.expiryDate
                        ? `<span>EXP: 2027-01-30</span>`
                        : `<span>STOCK: ${item.stockQuantity}</span>`
                    }
                  </div>
                </div>
              `;
            })
            .join('')}

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWin = window.open(url, '_blank');
    if (!printWin) {
      showToast('Pop-up was blocked. Please allow popups to open print tab.', 'error');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen text-[#E0E0E0]">
      {/* Top Header Bar matching Screenshot 1 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#202738]">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <span className="text-emerald-400 font-mono font-black text-2xl tracking-tighter">
              ||||
            </span>
            <span>Thermal Barcode & Label Generator</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Multi-column thermal roll printing with exact 4mm column spacing & bill item barcode generation
          </p>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            id="btn-download-barcode-pdf"
            onClick={handlePrintLabels}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#182030] hover:bg-[#222C42] text-gray-200 hover:text-white rounded-xl border border-[#2B364E] text-xs font-bold transition shadow-sm"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download PDF</span>
          </button>

          <button
            type="button"
            id="btn-print-labels-primary"
            onClick={handlePrintLabels}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#059669] hover:bg-[#10B981] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print Labels ({totalLabelsList.length})</span>
          </button>
        </div>
      </div>

      {/* Mode Switcher Bar matching Screenshot 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F131C] p-2 rounded-2xl border border-[#222836]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              mode === 'single'
                ? 'bg-[#059669] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#1A202C]'
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Single Product Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              mode === 'batch'
                ? 'bg-[#059669] text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-[#1A202C]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Batch & Bill Items Mode ({batchItems.length} items)</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadLowStock}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>Low Stock Batch</span>
          </button>

          <select
            onChange={(e) => {
              if (e.target.value) {
                handleLoadCategory(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[#171D2B] border border-[#2B3548] text-gray-300 hover:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>
              + Add Category...
            </option>
            <option value="Rings">Rings</option>
            <option value="Necklaces & Pendants">Necklaces & Pendants</option>
            <option value="Earrings">Earrings</option>
            <option value="Bangles & Bracelets">Bangles & Bracelets</option>
            <option value="Chains">Chains</option>
            <option value="Loose Gemstones">Loose Gemstones</option>
            <option value="Bridal Sets">Bridal Sets</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Left Controls (40%) & Right Live Preview (60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Column & 4mm Gap Settings */}
          <div className="bg-[#0F131C] border border-[#222836] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-200 flex items-center gap-2">
                <span className="text-emerald-400">☵</span>
                <span>COLUMN & 4MM GAP SETTINGS</span>
              </h2>
              <span className="text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg">
                {columns} Col • {colGap}mm Gap
              </span>
            </div>

            {/* Sticker Columns across Sheet / Roll */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 block">
                Sticker Columns across Sheet / Roll
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[1, 2, 3, 4, 5].map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColumns(col)}
                    className={`py-2 text-xs font-bold rounded-xl transition border ${
                      columns === col
                        ? 'bg-[#059669] text-white border-emerald-500 shadow-md'
                        : 'bg-[#151A26] hover:bg-[#1E2536] text-gray-400 hover:text-white border-[#273044]'
                    }`}
                  >
                    {col} Col{col > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400">
                {columns === 1
                  ? 'Single continuous roll tape (1 across)'
                  : `${columns} columns across ribbon / sticker roll`}
              </p>
            </div>

            {/* Column-to-Column Gap (Horizontal Spacing) */}
            <div className="space-y-2 pt-2 border-t border-[#1C2333]">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-300">
                  Column-to-Column Gap (Horizontal spacing)
                </label>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {colGap.toFixed(1)} mm
                </span>
              </div>

              {/* Gap preset buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[2, 3, 4, 5, 6].map((gapVal) => (
                  <button
                    key={gapVal}
                    type="button"
                    onClick={() => setColGap(gapVal)}
                    className={`py-1.5 text-xs font-bold rounded-xl transition border ${
                      colGap === gapVal
                        ? 'bg-[#059669] text-white border-emerald-500'
                        : 'bg-[#151A26] hover:bg-[#1E2536] text-gray-400 hover:text-white border-[#273044]'
                    }`}
                  >
                    {gapVal}mm {gapVal === 4 ? '★' : ''}
                  </button>
                ))}
              </div>

              {/* Range slider & direct input */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="12"
                  step="0.5"
                  value={colGap}
                  onChange={(e) => setColGap(parseFloat(e.target.value))}
                  className="flex-1 accent-emerald-500 cursor-pointer"
                />
                <div className="flex items-center gap-1 bg-[#171D2B] border border-[#2B3548] rounded-xl px-2.5 py-1">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={colGap}
                    onChange={(e) => setColGap(parseFloat(e.target.value) || 0)}
                    className="w-10 bg-transparent text-center text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400">mm</span>
                </div>
              </div>
            </div>

            {/* Row Gap & Outer Margin */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#1C2333]">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  Row Gap (Vertical)
                </label>
                <div className="flex items-center bg-[#171D2B] border border-[#2B3548] rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={rowGap}
                    onChange={(e) => setRowGap(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">mm</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-300">
                  Outer Margin
                </label>
                <div className="flex items-center bg-[#171D2B] border border-[#2B3548] rounded-xl px-3 py-2">
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={outerMargin}
                    onChange={(e) => setOuterMargin(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">mm</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Sticker Size & Source */}
          <div className="bg-[#0F131C] border border-[#222836] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-200 flex items-center gap-2">
                <span className="text-emerald-400">⊞</span>
                <span>STICKER SIZE & SOURCE</span>
              </h2>
              <span className="text-[11px] font-mono text-gray-400">
                {currentDimensions.width} × {currentDimensions.height} mm
              </span>
            </div>

            {/* Preset Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">
                Sticker Preset / Label Size
              </label>
              <select
                id="select-label-preset"
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-[#171D2B] border border-[#2B3548] rounded-xl px-3.5 py-2.5 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {LABEL_SIZE_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} — {preset.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Dimensions if custom is chosen */}
            {selectedPresetId === 'custom' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#151A26] rounded-xl border border-[#252E42]">
                <div>
                  <label className="text-[11px] font-bold text-gray-400">Width (mm)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full bg-[#0D1017] border border-gray-700 rounded-lg p-2 text-xs font-bold text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400">Height (mm)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full bg-[#0D1017] border border-gray-700 rounded-lg p-2 text-xs font-bold text-white mt-1"
                  />
                </div>
              </div>
            )}

            {/* Select Product to Print */}
            {mode === 'single' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">
                  Select Product to Print
                </label>
                <select
                  id="select-product-to-print"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full bg-[#171D2B] border border-[#2B3548] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer truncate"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — SKU: {p.itemCode} ({formatCurrency(p.sellingPrice)}) [Stock: {p.stockQuantity}]
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-300">
                    Batch Items Queue ({batchItems.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => setBatchItems([])}
                    className="text-[11px] text-rose-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 bg-[#141924] p-2 rounded-xl border border-[#252E42]">
                  {batchItems.length === 0 ? (
                    <p className="text-xs text-gray-500 text-center py-4">
                      No items in batch. Use "+ Add Category" or "Low Stock Batch" above.
                    </p>
                  ) : (
                    batchItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-[#19202E] p-2 rounded-lg text-xs"
                      >
                        <div className="truncate flex-1 pr-2">
                          <p className="font-bold text-white truncate">{item.product.name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            {item.product.itemCode} • {formatCurrency(item.product.sellingPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = parseInt(e.target.value) || 1;
                              setBatchItems((prev) =>
                                prev.map((it, i) =>
                                  i === idx ? { ...it, quantity: qty } : it
                                )
                              );
                            }}
                            className="w-12 bg-[#0E121B] border border-gray-700 rounded p-1 text-center font-bold text-amber-400"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setBatchItems((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-gray-500 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Number of Sticker Copies */}
            {mode === 'single' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-300">
                  Number of Sticker Copies
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#171D2B] border border-[#2B3548] rounded-xl px-3 py-2 w-24">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={copiesCount}
                      onChange={(e) => setCopiesCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none text-center"
                    />
                  </div>

                  <div className="flex-1 grid grid-cols-6 gap-1">
                    {[2, 6, 12, 24, 48, 100].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCopiesCount(num)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          copiesCount === num
                            ? 'bg-[#059669] text-white border-emerald-500'
                            : 'bg-[#151A26] hover:bg-[#1E2536] text-gray-400 hover:text-white border-[#273044]'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleAddCurrentToBatch}
                    className="w-full py-2 bg-[#1B2333] hover:bg-[#253046] text-gray-300 hover:text-white rounded-xl text-xs font-bold border border-[#2D384F] transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Add this to Multi-Product Batch Queue</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Visible Fields on Sticker Checkboxes */}
          <div className="bg-[#0F131C] border border-[#222836] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1E2536] pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-gray-200 flex items-center gap-2">
                <span className="text-emerald-400">☑</span>
                <span>VISIBLE FIELDS ON STICKER</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.storeName}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, storeName: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Store Name</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.productName}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, productName: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Product Name</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.sellingPrice}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, sellingPrice: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Selling Price</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.barcodeText}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, barcodeText: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Barcode Text</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.expiryDate}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, expiryDate: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Expiry Date / SKU</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-gray-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={visibleFields.customBadge}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, customBadge: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-gray-700 bg-gray-900 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="font-semibold">Custom Badge</span>
              </label>
            </div>

            {visibleFields.customBadge && (
              <div className="pt-2">
                <input
                  type="text"
                  value={customBadgeText}
                  onChange={(e) => setCustomBadgeText(e.target.value)}
                  placeholder="Badge text (e.g. 22K Gold, NEW)"
                  className="w-full bg-[#151A26] border border-[#273044] rounded-xl px-3 py-1.5 text-xs text-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Multi-Column Layout Preview matching Screenshot 1 */}
        <div className="lg:col-span-7 bg-[#0F131C] border border-[#222836] rounded-2xl overflow-hidden shadow-2xl flex flex-col">
          {/* Header of Live Preview */}
          <div className="px-5 py-3.5 bg-[#121622] border-b border-[#222836] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-white">
                LIVE MULTI-COLUMN LAYOUT ({columns} COLUMNS ACROSS • {colGap}MM GAP)
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-mono">
                {totalLabelsList.length} Labels ({currentDimensions.width}×{currentDimensions.height}mm)
              </span>

              {/* Zoom pill */}
              <div className="flex items-center gap-1 bg-[#0A0D14] border border-[#252D3D] px-2 py-1 rounded-lg text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="text-gray-400 hover:text-white"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="text-gray-300 px-1">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(175, z + 15))}
                  className="text-gray-400 hover:text-white"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="p-6 sm:p-10 bg-[#07090E] min-h-[600px] flex items-center justify-center overflow-auto">
            {/* White Printable Roll / Sheet Canvas */}
            <div
              className="bg-white rounded-md shadow-2xl p-4 transition-all duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
              }}
            >
              {/* Multi-column grid */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  gap: `${rowGap * 3.78}px ${colGap * 3.78}px`,
                  padding: `${outerMargin * 3.78}px`,
                }}
              >
                {totalLabelsList.map((item, idx) => {
                  const barcodeData = generateBarcodeSvgElements(
                    item.barcode || '4792011001012',
                    24,
                    1.4
                  );

                  return (
                    <div
                      key={idx}
                      className="bg-white text-black border border-gray-300 rounded-sm flex flex-col justify-between p-2 shadow-sm font-sans select-none overflow-hidden"
                      style={{
                        width: `${currentDimensions.width * 3.78}px`, // mm to px approximation
                        height: `${currentDimensions.height * 3.78}px`,
                        minWidth: `${currentDimensions.width * 3.78}px`,
                        minHeight: `${currentDimensions.height * 3.78}px`,
                      }}
                    >
                      {/* Store Name */}
                      {visibleFields.storeName && (
                        <div className="text-[9px] font-black uppercase text-center tracking-tight text-gray-900 truncate">
                          {settings.companyName || 'WCS SUPERMARKET & RETAIL POS'}
                        </div>
                      )}

                      {/* Product Name */}
                      {visibleFields.productName && (
                        <div className="text-[10px] font-bold text-center text-black leading-tight truncate px-1">
                          {item.name}
                        </div>
                      )}

                      {/* Selling Price */}
                      {visibleFields.sellingPrice && (
                        <div className="text-[12px] font-black text-center text-black leading-none font-mono">
                          Rs. {item.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      )}

                      {/* Custom Badge if active */}
                      {visibleFields.customBadge && (
                        <div className="text-center">
                          <span className="text-[7px] font-extrabold bg-black text-white px-1.5 py-0.5 rounded uppercase">
                            {customBadgeText || item.metalPurity.split(' ')[0]}
                          </span>
                        </div>
                      )}

                      {/* Barcode SVG */}
                      <div className="flex flex-col items-center justify-center my-0.5">
                        <svg
                          className="w-4/5 h-4"
                          viewBox={`0 0 ${barcodeData.totalWidth} 24`}
                          preserveAspectRatio="none"
                        >
                          {barcodeData.elements.map((el, i) => (
                            <rect
                              key={i}
                              x={el.x}
                              y="0"
                              width={el.width}
                              height={el.height}
                              fill="#000"
                            />
                          ))}
                        </svg>
                        {visibleFields.barcodeText && (
                          <span className="font-mono text-[8px] font-bold tracking-widest text-black mt-0.5">
                            {item.barcode || '4792011001012'}
                          </span>
                        )}
                      </div>

                      {/* Footer Info (SKU & Expiry/Stock) */}
                      <div className="flex justify-between items-center text-[7.5px] font-mono font-semibold text-gray-700 border-t border-gray-300 pt-0.5">
                        <span>SKU: {item.itemCode}</span>
                        {visibleFields.expiryDate && (
                          <span>EXP: 2027-01-30</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
