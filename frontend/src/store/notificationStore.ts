import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  clearNotifications: () => void;
}

export const useNotificationStore = create<INotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      addNotification: (notification: INotification) => {
        set((state) => {
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) return state; // skip duplicates

          return {
            notifications: [notification, ...state.notifications],
          };
        });
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));

        lightHaptic();
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },
    }),
    {
      name: "notification-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notifications: state.notifications }),
    }
  )
);
