import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ToastMessage } from '../types';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastMessage['type'], duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastMessage['type'] = 'info', duration = 4000) => {
      const id = `toast_${Date.now()}_${Math.random()}`;
      const newToast: ToastMessage = { id, title, message, type, duration };

      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 visible

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border transition-all duration-200 transform translate-y-0 ${
                isSuccess
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : isError
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : isWarning
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-900 border-slate-800 text-white'
              }`}
              role="alert"
            >
              <div className="shrink-0 mr-3 mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-emerald-400" />}
              </div>
              <div className="flex-1 text-sm">
                <h4 className="font-semibold">{toast.title}</h4>
                {toast.message && <p className="mt-1 opacity-90 leading-tight">{toast.message}</p>}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 ml-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
