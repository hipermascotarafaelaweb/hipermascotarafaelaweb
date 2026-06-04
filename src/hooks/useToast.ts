import { useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

const toastListeners: Set<(toast: Toast) => void> = new Set();
const removeListeners: Set<(id: string) => void> = new Set();
let toastId = 0;

export function useToast() {
  const show = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    const id = `toast-${++toastId}`;
    const toast: Toast = { id, message, type, duration };

    toastListeners.forEach((listener) => listener(toast));

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  return {
    show,
    success: (message: string, duration?: number) => show(message, 'success', duration),
    error: (message: string, duration?: number) => show(message, 'error', duration),
    warning: (message: string, duration?: number) => show(message, 'warning', duration),
    info: (message: string, duration?: number) => show(message, 'info', duration),
  };
}

export function subscribeToToasts(listener: (toast: Toast) => void) {
  toastListeners.add(listener);
  return () => {
    toastListeners.delete(listener);
  };
}

export function subscribeToToastRemovals(listener: (id: string) => void) {
  removeListeners.add(listener);
  return () => {
    removeListeners.delete(listener);
  };
}

function removeToast(id: string) {
  removeListeners.forEach((listener) => listener(id));
}
