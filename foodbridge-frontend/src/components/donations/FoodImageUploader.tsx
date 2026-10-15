import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle } from 'lucide-react';

interface FoodImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
}

export const FoodImageUploader: React.FC<FoodImageUploaderProps> = ({ value, onChange, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    // Simulate image upload progress
    setUploading(true);
    setProgress(20);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          // Convert file to base64 Data URL for live preview / storage
          const reader = new FileReader();
          reader.onload = () => {
            onChange(reader.result as string);
          };
          reader.readAsDataURL(file);
          return 100;
        }
        return prev + 25;
      });
    }, 150);
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
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full space-y-2">
      <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-900">
        Food Image
      </label>
      <p className="text-xs text-slate-500">Upload a clear image of the surplus food.</p>

      {/* Image Preview Box if image exists */}
      {value ? (
        <div className="relative rounded-xl border border-slate-300 overflow-hidden bg-slate-50 max-h-56 group shadow-xs">
          <img src={value} alt="Surplus Food Preview" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors shadow-md focus:outline-none"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 bg-white ${
            dragActive
              ? 'border-emerald-600 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-600 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />

          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <UploadCloud className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-900">
              Drag & drop food photo here, or <span className="text-emerald-700 underline">browse</span>
            </p>
            <p className="text-[11px] text-slate-400">Supports JPG, PNG, WEBP up to 5MB</p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="w-full max-w-xs space-y-1 pt-2">
              <div className="flex justify-between text-[10px] font-bold text-slate-600">
                <span>Uploading food image...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Errors */}
      {(uploadError || error) && (
        <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-bold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError || error}</span>
        </div>
      )}
    </div>
  );
};
