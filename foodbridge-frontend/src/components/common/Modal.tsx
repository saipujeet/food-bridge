import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* High-Contrast Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-slate-950/75 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className={`relative w-full ${maxWidthClasses[maxWidth]} transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all border border-slate-300 p-6 sm:p-8 z-10`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-slate-200">
            <div>
              <h3 id="modal-title" className="text-xl font-extrabold text-slate-900 tracking-tight">
                {title}
              </h3>
              {description && (
                <p className="mt-1.5 text-xs font-medium text-slate-600 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
