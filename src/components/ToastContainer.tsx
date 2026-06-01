'use client';

import { useEffect, useState } from 'react';
import { subscribeToToasts, subscribeToToastRemovals, type Toast } from '@/hooks/useToast';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribeAdd = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);
    });

    const unsubscribeRemove = subscribeToToastRemovals((id) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    });

    return () => {
      unsubscribeAdd();
      unsubscribeRemove();
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none max-w-sm">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 border rounded-lg p-4 animate-in fade-in slide-in-from-right-4 pointer-events-auto ${
              colorMap[toast.type]
            }`}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-current hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
