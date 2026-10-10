"use client";

import { useCallback, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";

interface PhotoUploadDialogProps {
  onUpload: (base64: string) => void;
  onClose: () => void;
  currentAvatarSrc?: string | null;
}

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface SelectedFile {
  base64: string;
  name: string;
  sizeLabel: string;
}

export default function PhotoUploadDialog({ onUpload, onClose, currentAvatarSrc }: PhotoUploadDialogProps) {
  const [selected, setSelected] = useState<SelectedFile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
    setError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only PNG, JPG, and WEBP images are supported.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Max size is 5 MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelected({
        base64: reader.result as string,
        name: file.name,
        sizeLabel: file.size < 1024 * 1024
          ? `${Math.round(file.size / 1024)} KB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleConfirm = () => {
    if (selected) { onUpload(selected.base64); onClose(); }
  };

  // The preview shown in the current-photo row
  const previewSrc = selected?.base64 ?? currentAvatarSrc ?? null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/60 backdrop-blur-sm"
    >
      <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-6 border border-outline-variant/40 shadow-xl flex flex-col gap-4 relative">

        {/* ── Header ── */}
        <div className="flex items-start justify-between pb-3 border-b border-outline-variant/30">
          <div>
            <h2 id="modal-title" className="text-xl font-bold text-on-surface">Upload Profile Photo</h2>
            <p className="text-sm text-on-surface-variant">Choose a photo to represent your account</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        {/* ── Drop Zone ── */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group
            ${dragging
              ? "border-primary bg-primary-fixed/30"
              : "border-primary/40 bg-primary-fixed/20 hover:border-primary hover:bg-primary-fixed/30"
            }`}
        >
          <div className="w-12 h-12 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
            <Icon name="cloud_upload" className="text-primary text-[28px]" />
          </div>
          <p className="text-sm font-semibold text-on-surface mb-1">
            Drag and drop your image here, or{" "}
            <span className="text-primary underline font-bold">browse files</span>
          </p>
          <p className="text-[11px] text-outline">Supports PNG, JPG, WEBP up to 5MB (minimum 400×400px recommended)</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) processFile(file);
              e.target.value = "";
            }}
          />
        </div>

        {error && (
          <p className="text-sm text-error flex items-center gap-1.5">
            <Icon name="error_outline" className="text-error text-[18px]" />
            {error}
          </p>
        )}

        {/* ── Current / Selected photo row ── */}
        {previewSrc && (
          <div className="bg-surface-container-low rounded-xl p-3 border border-outline-variant/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shadow-sm ring-2 ring-surface-container-lowest shrink-0">
                <img src={previewSrc} alt="Selected photo preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold text-on-surface">
                  {selected ? selected.name : "Current Photo"}
                </span>
                <span className="text-[11px] text-outline">
                  {selected ? selected.sizeLabel : ""}
                </span>
              </div>
            </div>
            {selected && (
              <button
                type="button"
                onClick={() => setSelected(null)}
                title="Remove selected photo"
                className="p-1.5 text-error hover:bg-error-container/30 rounded-lg transition-colors"
              >
                <Icon name="delete" className="text-error text-[20px]" />
              </button>
            )}
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-1 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-lg transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!selected}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-6 py-2 bg-primary text-white text-sm font-semibold rounded-lg shadow hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name="check" className="text-white text-[18px]" />
            Upload &amp; Save Photo
          </button>
        </div>

      </div>
    </div>
  );
}
