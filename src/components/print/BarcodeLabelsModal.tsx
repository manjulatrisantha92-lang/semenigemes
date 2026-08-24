import React, { useState } from 'react';
import { Product } from '../../types';
import { useApp } from '../../context/AppContext';
import { generateBarcodeSvgElements } from '../../utils/barcodeGenerator';
import { LABEL_SIZE_PRESETS } from '../../pages/BarcodeGeneratorPage';
import { Printer, X, Tag, Download, Sliders, Check, Eye } from 'lucide-react';

interface BarcodeLabelsModalProps {
  product: Product;
  onClose: () => void;
}

export const BarcodeLabelsModal: React.FC<BarcodeLabelsModalProps> = ({ product, onClose }) => {
  const { settings, formatCurrency, setCurrentPage } = useApp();

  const [tagCount, setTagCount] = useState<number>(2);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('50x25');
  const [columns, setColumns] = useState<number>(1);
  const [colGap, setColGap] = useState<number>(4.0); // 4mm default
  const [rowGap, setRowGap] = useState<number>(4.0);
  const [outerMargin, setOuterMargin] = useState<number>(3.0);

  const [visibleFields, setVisibleFields] = useState({
    storeName: true,
    productName: true,
    sellingPrice: true,
    barcodeText: true,
    expiryDate: true,
  });

  const preset = LABEL_SIZE_PRESETS.find((p) => p.id === selectedPresetId) || LABEL_SIZE_PRESETS[0];
  const width = preset.width;
  const height = preset.height;

  const handlePrint = () => {
    const totalRowWidth =
      columns === 1
        ? width + outerMargin * 2
        : columns * width + (columns - 1) * colGap + outerMargin * 2;

    const items = Array.from({ length: Math.max(1, tagCount) }).map(() => product);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${product.name} - ${tagCount} Barcode Labels (${width}x${height}mm)</title>
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
          </style>
        </head>
        <body>
          ${items
            .map(() => {
              const code = product.barcode || '4792011001012';
              const sku = product.itemCode || 'SKU-001';
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
                      ? `<div class="product-name">${product.name}</div>`
                      : ''
                  }
                  ${
                    visibleFields.sellingPrice
                      ? `<div class="price-tag">Rs. ${product.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>`
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
                        : `<span>STOCK: ${product.stockQuantity}</span>`
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
    window.open(url, '_blank');
  };

  const barcodeData = generateBarcodeSvgElements(product.barcode || '4792011001012', 24, 1.4);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-center p-4">
      <div className="bg-[#0F131C] text-[#E0E0E0] rounded-2xl shadow-2xl border border-[#232B3C] w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#141924] border-b border-[#232B3C] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-mono font-black text-xl tracking-tighter">
              ||||
            </span>
            <div>
              <h2 className="text-base font-black text-white">
                Thermal Barcode & Label Generator
              </h2>
              <p className="text-xs text-gray-400">
                Custom label printing for {product.name} ({width}×{height}mm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                setCurrentPage('barcode_generator');
              }}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-3 py-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/30"
            >
              Open Full Studio ↗
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white bg-[#1A2130] rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Label Size Preset
              </label>
              <select
                value={selectedPresetId}
                onChange={(e) => setSelectedPresetId(e.target.value)}
                className="w-full bg-[#182030] border border-[#2C384E] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {LABEL_SIZE_PRESETS.filter((p) => p.id !== 'custom').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Column & Gap */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Columns Across
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {[1, 2, 3].map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setColumns(col)}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        columns === col
                          ? 'bg-[#059669] text-white border-emerald-500'
                          : 'bg-[#182030] text-gray-400 border-[#2C384E]'
                      }`}
                    >
                      {col} Col
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">
                  Gap Spacing
                </label>
                <div className="flex items-center bg-[#182030] border border-[#2C384E] rounded-xl px-3 py-1.5">
                  <input
                    type="number"
                    value={colGap}
                    onChange={(e) => setColGap(parseFloat(e.target.value) || 0)}
                    className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">mm</span>
                </div>
              </div>
            </div>

            {/* Number of Copies */}
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Number of Copies
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={tagCount}
                  onChange={(e) => setTagCount(parseInt(e.target.value) || 1)}
                  className="w-20 bg-[#182030] border border-[#2C384E] rounded-xl px-3 py-2 text-center text-xs font-bold text-emerald-400 focus:outline-none"
                />
                <div className="grid grid-cols-5 gap-1 flex-1">
                  {[2, 6, 12, 24, 48].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setTagCount(c)}
                      className={`py-1.5 text-xs font-bold rounded-lg border ${
                        tagCount === c
                          ? 'bg-[#059669] text-white border-emerald-500'
                          : 'bg-[#182030] text-gray-400 border-[#2C384E]'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Checkbox fields */}
            <div className="p-3 bg-[#141924] rounded-xl border border-[#232B3C] grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={visibleFields.storeName}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, storeName: e.target.checked })
                  }
                  className="accent-emerald-500"
                />
                <span>Store Name</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={visibleFields.productName}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, productName: e.target.checked })
                  }
                  className="accent-emerald-500"
                />
                <span>Product Name</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={visibleFields.sellingPrice}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, sellingPrice: e.target.checked })
                  }
                  className="accent-emerald-500"
                />
                <span>Selling Price</span>
              </label>
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={visibleFields.barcodeText}
                  onChange={(e) =>
                    setVisibleFields({ ...visibleFields, barcodeText: e.target.checked })
                  }
                  className="accent-emerald-500"
                />
                <span>Barcode Text</span>
              </label>
            </div>
          </div>

          {/* Right Live Preview Canvas */}
          <div className="bg-[#080B10] p-4 rounded-xl border border-[#232B3C] flex flex-col items-center justify-center min-h-[250px]">
            <div className="text-[10px] text-gray-400 font-mono mb-2 uppercase tracking-wider">
              {tagCount} Labels • {columns} Col • {width}×{height}mm
            </div>

            {/* Sticker Preview */}
            <div
              className="bg-white text-black border border-gray-300 rounded-sm flex flex-col justify-between p-2 shadow-2xl font-sans"
              style={{
                width: `${width * 3.78}px`,
                height: `${height * 3.78}px`,
                maxWidth: '100%',
              }}
            >
              {visibleFields.storeName && (
                <div className="text-[8px] font-black uppercase text-center text-gray-900 truncate">
                  {settings.companyName || 'WCS SUPERMARKET & RETAIL POS'}
                </div>
              )}
              {visibleFields.productName && (
                <div className="text-[9px] font-bold text-center text-black truncate px-1">
                  {product.name}
                </div>
              )}
              {visibleFields.sellingPrice && (
                <div className="text-[11px] font-black text-center text-black font-mono">
                  {formatCurrency(product.sellingPrice)}
                </div>
              )}
              <div className="flex flex-col items-center justify-center my-0.5">
                <svg
                  className="w-4/5 h-3.5"
                  viewBox={`0 0 ${barcodeData.totalWidth} 24`}
                  preserveAspectRatio="none"
                >
                  {barcodeData.elements.map((el, i) => (
                    <rect key={i} x={el.x} y="0" width={el.width} height={el.height} fill="#000" />
                  ))}
                </svg>
                {visibleFields.barcodeText && (
                  <span className="font-mono text-[7px] font-bold tracking-widest text-black mt-0.5">
                    {product.barcode || '4792011001012'}
                  </span>
                )}
              </div>
              <div className="flex justify-between items-center text-[7px] font-mono font-semibold text-gray-700 border-t border-gray-300 pt-0.5">
                <span>SKU: {product.itemCode}</span>
                <span>EXP: 2027-01-30</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-[#141924] border-t border-[#232B3C] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1A2130] text-gray-300 hover:text-white rounded-xl text-xs font-bold transition"
          >
            Close
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#059669] hover:bg-[#10B981] text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/25 transition"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print {tagCount} Labels ({width}×{height}mm)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
