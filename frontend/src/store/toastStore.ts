import { IToast } from "@/interfaces/toast";
import { generateUniqueId } from "@/utils/utils";
import { create } from "zustand";

interface IToastStore {
  toasts: IToast[];
  showToast: (toast: Omit<IToast, "id">) => void;
  removeToast: (id: string, duration?: number) => void;
}

export const useToastStore = create<IToastStore>((set, get) => ({
  toasts: [],
  showToast: (toast) => {
    const id = generateUniqueId();

    const currentToasts = get().toasts;
    const newToasts = [...currentToasts, { ...toast, id }];

    set({ toasts: newToasts });

    get().removeToast(id, toast.duration);
  },
  removeToast: (id, duration = 5000) => {
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, duration);
  },
}));
