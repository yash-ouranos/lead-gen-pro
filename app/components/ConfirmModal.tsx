"use client";

import { WarningAltFilled } from "@carbon/icons-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDanger = true,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-md shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-border animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex gap-4">
            <div className={`mt-0.5 ${isDanger ? 'text-red-500' : 'text-primary'}`}>
              <WarningAltFilled size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-border text-foreground hover:bg-muted transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-primary-foreground transition-colors shadow-sm text-sm font-medium ${
              isDanger 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-primary hover:bg-primary/90"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
