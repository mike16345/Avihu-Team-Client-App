import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightHaptic } from "@/utils/haptics";
import { Platform } from "react-native";
import { generateUniqueId } from "@/utils/utils";
import { NOTIFICATION_TITLE, NotificationBodies } from "@/constants/notifications";
import { getNextEightAM, getNextEightAMOnSunday } from "@/utils/notification";

export interface INotification {
  id: string;
  title: string | null;
  body: string | null;
  data: any;
  type: "weighIn" | "measurement";
  triggerTime: Date;
  status: "pending" | "delivered";
}

interface INotificationStore {
  notifications: INotification[];
  getPendingNotifications: () => INotification[];
  getDeliveredNotifications: () => INotification[];
  addNotification: (notification: INotification) => void;
  addWeighInNotification: (id?: string) => void;
  addMeasurementNotification: (id?: string) => void;
  addNotificationsIfNecessary: () => void;
  removeNotification: (id: string) => void;
  updateNotificationStatus: (id: string) => void;
  updateNotificationsPastTriggerTime: () => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<INotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],

      getPendingNotifications: () => get().notifications.filter((n) => n.status === "pending"),

      getDeliveredNotifications: () => get().notifications.filter((n) => n.status === "delivered"),

      updateNotificationsPastTriggerTime: () => {
        set((state) => {
          const now = Date.now();

          return {
            notifications: state.notifications.map((n) => {
              const triggerTimeInMilliseconds = new Date(n.triggerTime).getTime();
              const isPassedTriggerTime = now >= triggerTimeInMilliseconds;

              if (Platform.OS == "ios" && isPassedTriggerTime && n.status == "pending") {
                const isMeasurementNotification = n.type == "measurement";

                const triggerTime = isMeasurementNotification
                  ? getNextEightAMOnSunday()
                  : getNextEightAM();

                queueMicrotask(() => {
                  get().addNotification({
                    id: generateUniqueId(),
                    title: NOTIFICATION_TITLE,
                    status: "pending",
                    type: n.type,
                    body: isMeasurementNotification
                      ? NotificationBodies.WEEKLY_MEASUERMENT_REMINDER
                      : NotificationBodies.DAILY_WEIGH_IN_REMINDER,
                    data: {},
                    triggerTime,
                  });
                });
              }

              return isPassedTriggerTime ? { ...n, status: "delivered" } : n;
            }),
          };
        });
      },

      addWeighInNotification: (id) => {
        const triggerTime = getNextEightAM();
        const data = { id: id || generateUniqueId() };
        const pendingNotifications = get().getPendingNotifications();

        if (
          pendingNotifications.find(
            (n) =>
              n.type == "weighIn" && new Date(n.triggerTime).getTime() === triggerTime.getTime()
          )
        )
          return;

        get().addNotification({
          id: data.id,
          status: "pending",
          title: NOTIFICATION_TITLE,
          body: NotificationBodies.DAILY_WEIGH_IN_REMINDER,
          type: "weighIn",
          data,
          triggerTime,
        });
      },

      addMeasurementNotification: (id) => {
        const triggerTime = getNextEightAMOnSunday();
        const data = { id: id || generateUniqueId() };
        const pendingNotifications = get().getPendingNotifications();

        if (
          pendingNotifications.find(
            (n) =>
              n.type == "measurement" && new Date(n.triggerTime).getTime() === triggerTime.getTime()
          )
        )
          return;

        get().addNotification({
          id: data.id,
          status: "pending",
          title: NOTIFICATION_TITLE,
          body: NotificationBodies.WEEKLY_MEASUERMENT_REMINDER,
          type: "measurement",
          data,
          triggerTime,
        });
      },

      addNotificationsIfNecessary: () => {
        if (Platform.OS == "android") return;

        get().addWeighInNotification();
        get().addMeasurementNotification();
      },

      addNotification: (notification: INotification) => {
        set((state) => {
          const exists = state.notifications.some((n) => n.id === notification.id);
          if (exists) return state; // skip duplicates

          return {
            notifications: [notification, ...state.notifications],
          };
        });
      },

      updateNotificationStatus: (id: string) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, status: "delivered" } : n
          ),
        }));
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
