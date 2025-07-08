"use client";
import { useState, ChangeEvent } from "react";

export default function ImageUploader({
  onImageSelected,
  onClear,
  onValidate,
  selectedFile,
  isProcessing,
}: {
  onImageSelected: (file: File) => void;
  onClear: () => void;
  onValidate: () => void;
  selectedFile: File | null;
  isProcessing: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onImageSelected(file);
  }

  if (!selectedFile && preview) setPreview(null);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-xs">
      <label className="cursor-pointer border-2 border-dashed border-[#FF9900] bg-white rounded-2xl px-8 py-6 w-full hover:bg-[#fff7e5] transition">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {preview ? (
          <img src={preview} alt="Preview" className="w-full rounded-xl shadow" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#FF9900]">
            <span className="text-lg font-semibold">Click or drag to upload image</span>
          </div>
        )}
      </label>

      {/* Action Buttons */}
      {selectedFile && (
        <div className="flex gap-4 mt-2 w-full">
          <button
            className="flex-1 flex items-center justify-center gap-1 bg-[#FF9900] text-white font-bold rounded-xl py-2 shadow hover:bg-[#e08700] transition"
            onClick={onValidate}
            disabled={isProcessing}
          >
            <span>
              <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
                <circle cx="9" cy="9" r="9" fill="white" fillOpacity="0.2"/>
                <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            {isProcessing ? "Processing..." : "Validate"}
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-1 bg-white border border-[#FF9900] text-[#FF9900] font-bold rounded-xl py-2 shadow hover:bg-[#fff7e5] transition"
            onClick={onClear}
            disabled={isProcessing}
          >
            <span>
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
                <path d="M4 4l8 8M12 4l-8 8" stroke="#FF9900" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span>
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}