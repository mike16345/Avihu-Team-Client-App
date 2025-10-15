import { create } from "zustand";
import { lightHaptic } from "@/utils/haptics";

export interface INotification {
  id: string;
  title: string | null;
  body: string | null;
  data: any;
  type: "weighIn" | "measurement";
}

interface INotificationStore {
  notifications: INotification[];
  addNotification: (notification: INotification) => void;
  removeNotification: (id: string) => void;
}

export const useNotificationStore = create<INotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification: INotification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));

    lightHaptic();
  },
}));
