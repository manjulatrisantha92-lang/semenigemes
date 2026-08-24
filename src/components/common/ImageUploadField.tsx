import React, { useState, useRef } from 'react';
import {
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  ExternalLink,
  Check,
  Eye,
  Camera,
} from 'lucide-react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  categoryPresets?: 'jewelry' | 'gemstone' | 'design' | 'general';
}

const JEWELRY_PRESETS = [
  {
    name: 'Ceylon Royal Blue Sapphire Ring',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Padparadscha Sapphire Halo Ring',
    url: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Pigeon Blood Ruby Pendant',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Emerald Cut Diamond Ring',
    url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: '22K Sri Lankan Gold Bangle',
    url: 'https://images.unsplash.com/photo-1611591475152-47354c8d0047?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Loose Ceylon Blue Sapphire (Oval)',
    url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=600&auto=format&fit=crop&q=80',
  },
];

const DESIGN_SKETCH_PRESETS = [
  {
    name: 'CAD 3D Halo Ring Sketch',
    url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Vintage Victorian Royal Crown Ring',
    url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Modern Solitaire Diamond Shank',
    url: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=600&auto=format&fit=crop&q=80',
  },
  {
    name: 'Bridal Floral Cluster Necklace Sketch',
    url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
  },
];

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Product / Design Photo (JPG/PNG)',
  helperText = 'Upload a JPG photo from your phone or computer, paste image from clipboard, or pick a curated preset.',
  categoryPresets = 'jewelry',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const [previewZoom, setPreviewZoom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const presets = categoryPresets === 'design' ? DESIGN_SKETCH_PRESETS : JEWELRY_PRESETS;

  // Process file to optimized Base64
  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Optimize/resize large images through a canvas to keep app fast
        const img = new Image();
        img.onload = () => {
          const maxDim = 800;
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
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            onChange(optimizedBase64);
          } else {
            onChange(result);
          }
        };
        img.src = result;
      }
    };
    reader.readAsDataURL(file);
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        e.preventDefault();
        handleFile(file);
      }
    }
  };

  return (
    <div className="space-y-2.5" onPaste={handlePaste}>
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-200">{label}</label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 font-medium"
          >
            <Sparkles className="w-3 h-3" />
            {showPresets ? 'Hide Presets' : 'Ceylon Gem Presets'}
          </button>
          <span className="text-gray-600">&bull;</span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] text-gray-400 hover:text-white transition"
          >
            {showUrlInput ? 'Hide URL' : 'Enter URL'}
          </button>
        </div>
      </div>

      {/* Main Image Upload Box / Preview */}
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        {/* Preview Thumbnail Box */}
        {value ? (
          <div className="relative group w-full sm:w-36 h-36 bg-[#0F1115] border border-[#2D3139] rounded-xl overflow-hidden shrink-0 shadow-lg">
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewZoom(true)}
                className="p-1.5 bg-black/70 text-white rounded-lg hover:bg-black transition"
                title="Zoom Preview"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 bg-[#D4AF37] text-[#0F1115] rounded-lg hover:bg-yellow-400 transition"
                title="Change Image"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                title="Remove Image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute bottom-1 right-1 bg-black/70 backdrop-blur-xs text-[9px] px-1.5 py-0.5 rounded text-emerald-400 font-mono flex items-center gap-1">
              <Check className="w-2.5 h-2.5" /> JPG Ready
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-36 h-36 bg-[#0F1115] border-2 border-dashed border-[#2D3139] hover:border-[#D4AF37] rounded-xl flex flex-col items-center justify-center p-3 cursor-pointer text-center group transition shrink-0"
          >
            <Camera className="w-7 h-7 text-gray-500 group-hover:text-[#D4AF37] mb-1 transition" />
            <span className="text-[11px] font-semibold text-gray-400 group-hover:text-white">
              Choose JPG
            </span>
            <span className="text-[9px] text-gray-600">Photo / File</span>
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`flex-1 w-full min-h-[144px] rounded-xl border-2 border-dashed p-4 flex flex-col justify-center items-center text-center transition cursor-pointer ${
            dragActive
              ? 'border-[#D4AF37] bg-[#D4AF37]/10'
              : 'border-[#2D3139] bg-[#1A1D23] hover:border-gray-500'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-full bg-[#0F1115] border border-[#2D3139] flex items-center justify-center text-[#D4AF37] mb-2 shadow-inner">
            <Upload className="w-5 h-5" />
          </div>

          <p className="text-xs font-semibold text-white">
            Click to upload JPG photo or drag & drop here
          </p>
          <p className="text-[10px] text-gray-400 mt-1 max-w-sm">
            Supports camera shots, scanned certificate photos, and 3D CAD design sketches (JPG, PNG, WebP).
          </p>
          <p className="text-[10px] text-[#D4AF37] mt-1 font-mono">
            Tip: You can also paste directly with Ctrl+V
          </p>
        </div>
      </div>

      {/* Manual URL Input Bar (optional toggle) */}
      {showUrlInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="url"
            placeholder="https://example.com/images/gemstone.jpg"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            className="flex-1 bg-[#0F1115] border border-[#2D3139] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="button"
            onClick={() => {
              if (customUrl.trim()) {
                onChange(customUrl.trim());
                setCustomUrl('');
                setShowUrlInput(false);
              }
            }}
            className="px-3 py-1.5 bg-[#D4AF37] text-[#0F1115] font-bold text-xs rounded-lg hover:bg-yellow-400 transition"
          >
            Apply URL
          </button>
        </div>
      )}

      {/* Preset Gallery */}
      {showPresets && (
        <div className="bg-[#0F1115] border border-[#2D3139] rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">
              Select from High-Definition Ceylon Presets
            </span>
            <span className="text-[10px] text-gray-500">Instant One-Click Load</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {presets.map((preset, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onChange(preset.url);
                  setShowPresets(false);
                }}
                className="group relative cursor-pointer border border-[#2D3139] rounded-lg overflow-hidden bg-[#1A1D23] hover:border-[#D4AF37] transition"
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-16 object-cover group-hover:scale-105 transition"
                />
                <div className="p-1.5 bg-[#14171C]">
                  <p className="text-[9px] font-medium text-gray-300 truncate group-hover:text-[#D4AF37]">
                    {preset.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {helperText && <p className="text-[10px] text-gray-500">{helperText}</p>}

      {/* Zoom Modal */}
      {previewZoom && value && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewZoom(false)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-[#1A1D23] border border-[#2D3139] rounded-2xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewZoom(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/70 text-white rounded-full hover:bg-black transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={value}
              alt="High resolution zoom"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded-xl"
            />
            <p className="text-center text-xs text-gray-400 py-2 font-mono">
              High Resolution Image Preview
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
