import { IToast } from "@/interfaces/toast";
import { create } from "zustand";

interface IToastStore {
  toasts: IToast[];
  showToast: (toast: IToast) => void;
  removeToast: (index: number, duration?: number) => void;
}

export const useToastStore = create<IToastStore>((set, get) => ({
  toasts: [],
  showToast: (toast: IToast) => {
    const currentToasts = get().toasts;
    const newToasts = [...currentToasts, toast];

    set({ toasts: newToasts });

    get().removeToast(newToasts.length - 1, toast.duration);
  },
  removeToast: (index: number, duration = 5000) => {
    setTimeout(() => {
      const currentToasts = get().toasts;

      set({ toasts: currentToasts.filter((_, i) => i !== index) });
    }, duration);
  },
}));
