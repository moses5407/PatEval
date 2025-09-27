import { create } from 'zustand';
import { ToastType } from '../../components/ui/Toast';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  details?: string;
  onClose?: () => void;
}

interface ToastState {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, details?: string, onClose?: () => void) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (type, message, details, onClose) => set((state) => ({
    toasts: [...state.toasts, {
      id: `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      type,
      message,
      details,
      onClose
    }]
  })),
  removeToast: (id) => set((state) => {
    const toast = state.toasts.find(t => t.id === id);
    if (toast?.onClose) {
      toast.onClose();
    }
    return {
      toasts: state.toasts.filter((toast) => toast.id !== id)
    };
  })
}));