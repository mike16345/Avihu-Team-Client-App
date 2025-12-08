import { IToast } from "@/interfaces/toast";
import { generateUniqueId } from "@/utils/utils";
import { create } from "zustand";

interface IToastStore {
  toasts: IToast[];
  modalToasts: IToast[];
  showToast: (toast: Omit<IToast, "id">) => string;
  showModalToast: (toast: Omit<IToast, "id">) => string;
  removeToast: (id: string, duration?: number, isModalToast?: boolean) => void;
}

export const useToastStore = create<IToastStore>((set, get) => ({
  modalToasts: [],
  toasts: [],
  showModalToast: (toast) => {
    const id = generateUniqueId();
    const currentToasts = get().modalToasts;
    const newToasts = [...currentToasts, { ...toast, id }];

    set({ modalToasts: newToasts });
    get().removeToast(id, toast.duration, true);

    return id;
  },
  showToast: (toast) => {
    const id = generateUniqueId();
    const currentToasts = get().toasts;
    const newToasts = [...currentToasts, { ...toast, id }];

    set({ toasts: newToasts });
    get().removeToast(id, toast.duration, false);

    return id;
  },
  removeToast: (id, duration = 5000, isModalToast) => {
    if (isModalToast) {
      return setTimeout(() => {
        set((state) => ({
          modalToasts: state.modalToasts.filter((toast) => toast.id !== id),
        }));
      }, duration);
    }

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, duration);
  },
}));
