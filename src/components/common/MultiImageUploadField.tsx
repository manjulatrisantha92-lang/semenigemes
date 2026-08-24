import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Eye,
  Camera,
  Star,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';

interface MultiImageUploadFieldProps {
  primaryImage: string;
  onPrimaryChange: (url: string) => void;
  additionalImages?: string[];
  onAdditionalChange: (urls: string[]) => void;
  label?: string;
  helperText?: string;
}

const CEYLON_JEWELRY_PRESETS = [
  {
    name: 'Royal Blue Sapphire Ring',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Padparadscha Halo Ring',
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pigeon Blood Ruby Pendant',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Solitaire Diamond Ring',
    url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: '22K Sri Lankan Gold Bangle',
    url: 'https://images.unsplash.com/photo-1611591475152-47354c8d0047?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Natural Ceylon Blue Sapphire Oval',
    url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Emerald Cut Vintage Ring',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bridal Floral Gold Necklace',
    url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&auto=format&fit=crop&q=80',
  },
];

export const MultiImageUploadField: React.FC<MultiImageUploadFieldProps> = ({
  primaryImage,
  onPrimaryChange,
  additionalImages = [],
  onAdditionalChange,
  label = 'Product Image Gallery (Main & Multiple Angle Photos)',
  helperText = 'Upload multiple high-res JPG photos (angles, hallmark, certificate, closeups). The first image is the Primary photo on invoices and barcodes.',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Resize and compress an image file to Base64
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          resolve('');
          return;
        }
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.85));
          } else {
            resolve(result);
          }
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleMultipleFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const base64List: string[] = [];
    for (const file of fileArray) {
      try {
        const b64 = await processImageFile(file);
        if (b64) base64List.push(b64);
      } catch (err) {
        console.error('Error processing image:', err);
      }
    }

    if (base64List.length === 0) return;

    if (!primaryImage) {
      onPrimaryChange(base64List[0]);
      if (base64List.length > 1) {
        onAdditionalChange([...additionalImages, ...base64List.slice(1)]);
      }
    } else {
      onAdditionalChange([...additionalImages, ...base64List]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      handleMultipleFiles(e.clipboardData.files);
    }
  };

  const handleSetPrimary = (index: number) => {
    // Current primary becomes additional, and index from additionals becomes primary
    const targetAdditional = additionalImages[index];
    const newAdditionals = [...additionalImages];
    newAdditionals.splice(index, 1);
    if (primaryImage) {
      newAdditionals.unshift(primaryImage);
    }
    onPrimaryChange(targetAdditional);
    onAdditionalChange(newAdditionals);
  };

  const handleRemovePrimary = () => {
    if (additionalImages.length > 0) {
      const nextPrimary = additionalImages[0];
      onPrimaryChange(nextPrimary);
      onAdditionalChange(additionalImages.slice(1));
    } else {
      onPrimaryChange('');
    }
  };

  const handleRemoveAdditional = (index: number) => {
    const nextList = [...additionalImages];
    nextList.splice(index, 1);
    onAdditionalChange(nextList);
  };

  const allCount = (primaryImage ? 1 : 0) + additionalImages.length;

  return (
    <div className="space-y-3" onPaste={handlePaste} id="multi-image-upload-wrapper">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">{label}</label>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2D3139] text-[#D4AF37] font-mono font-bold">
            {allCount} {allCount === 1 ? 'Photo' : 'Photos'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            {showPresets ? 'Hide Presets' : 'Ceylon Presets'}
          </button>
          <span className="text-gray-600">&bull;</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-gray-400 hover:text-white transition"
          >
            {showUrlInput ? 'Hide URL' : 'Add via URL'}
          </button>
        </div>
      </div>

      {/* Grid of uploaded images: Primary card + Gallery thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {/* Primary Photo Slot */}
        {primaryImage ? (
          <div className="relative group col-span-2 aspect-video sm:aspect-square bg-[#0F1115] border-2 border-[#D4AF37] rounded-xl overflow-hidden shadow-lg">
            <img
              src={primaryImage}
              alt="Primary product photo"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
            />
            <div className="absolute top-2 left-2 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold px-2 py-0.5 rounded shadow flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Primary Cover
            </div>

            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setZoomedImage(primaryImage)}
                className="p-1.5 bg-black/80 text-white rounded-lg hover:bg-black transition"
                title="View Full Size"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-[#D4AF37] text-[#0F1115] rounded-lg hover:bg-yellow-400 transition"
                title="Replace Photo"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemovePrimary}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                title="Remove Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : null}

        {/* Additional Images Thumbnails */}
        {additionalImages.map((imgUrl, idx) => (
          <div
            key={idx}
            className="relative group aspect-square bg-[#0F1115] border border-[#2D3139] hover:border-[#D4AF37]/50 rounded-xl overflow-hidden shadow-md"
          >
            <img
              src={imgUrl}
              alt={`Angle ${idx + 2}`}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute top-1.5 left-1.5 bg-black/70 text-gray-300 text-[9px] font-mono px-1.5 py-0.5 rounded">
              #{idx + 2}
            </div>

            <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
              <button
                type="button"
                onClick={() => handleSetPrimary(idx)}
                className="w-full py-1 bg-[#D4AF37] text-[#0F1115] text-[10px] font-bold rounded flex items-center justify-center gap-1 hover:bg-yellow-400 transition"
                title="Set as Main Primary Cover"
              >
                <Star className="w-3 h-3 fill-current" /> Set Primary
              </button>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setZoomedImage(imgUrl)}
                  className="p-1 bg-black/80 text-white rounded hover:bg-black transition"
                  title="Zoom"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveAdditional(idx)}
                  className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Add More Photos Box (Click / Drag Target) */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 cursor-pointer text-center group transition ${
            dragActive
              ? 'border-[#D4AF37] bg-[#D4AF37]/15'
              : 'border-[#2D3139] bg-[#1A1D23] hover:border-[#D4AF37] hover:bg-[#1f232b]'
          } ${!primaryImage ? 'col-span-2 sm:col-span-3' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleMultipleFiles(e.target.files);
              }
            }}
            className="hidden"
          />
          <div className="w-9 h-9 rounded-full bg-[#0F1115] border border-[#2D3139] flex items-center justify-center text-[#D4AF37] mb-1.5 group-hover:scale-110 transition shadow-inner">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-slate-200 group-hover:text-white">
            {primaryImage ? 'Add More Photos' : 'Upload Product Photos'}
          </span>
          <span className="text-[10px] text-gray-500 mt-0.5">
            Select multiple or drag & drop
          </span>
        </div>
      </div>

      {/* Manual URL Input Bar */}
      {showUrlInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            placeholder="https://example.com/images/item-angle.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-[#0F1115] border border-[#2D3139] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="button"
            onClick={() => {
              if (customUrl.trim()) {
                if (!primaryImage) {
                  onPrimaryChange(customUrl.trim());
                } else {
                  onAdditionalChange([...additionalImages, customUrl.trim()]);
                }
                setCustomUrl('');
                setShowUrlInput(false);
              }
            }}
            className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold text-xs rounded-lg hover:bg-yellow-400 transition"
          >
            Add URL Photo
          </button>
        </div>
      )}

      {/* Preset Gallery */}
      {showPresets && (
        <div className="bg-[#0F1115] border border-[#2D3139] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Select from High-Definition Ceylon Gems & Jewelry Presets
            </span>
            <span className="text-[10px] text-gray-500">Click to add to gallery</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {CEYLON_JEWELRY_PRESETS.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (!primaryImage) {
                    onPrimaryChange(preset.url);
                  } else {
                    onAdditionalChange([...additionalImages, preset.url]);
                  }
                }}
                className="group relative cursor-pointer border border-[#2D3139] rounded-lg overflow-hidden bg-[#1A1D23] hover:border-[#D4AF37] transition"
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-16 object-cover group-hover:scale-105 transition"
                />
                <div className="p-1 bg-[#14171C]">
                  <p className="text-[8px] font-medium text-gray-300 truncate group-hover:text-[#D4AF37]">
                    {preset.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}

      {/* Full Size Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-3xl max-h-[85vh] bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={zoomedImage}
              alt="High resolution zoom"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="flex items-center justify-between px-3 py-2 text-xs text-gray-400 font-mono">
              <span>High Resolution Item Photo</span>
              <button
                type="button"
                onClick={() => setZoomedImage(null)}
                className="text-[#D4AF37] hover:underline"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
