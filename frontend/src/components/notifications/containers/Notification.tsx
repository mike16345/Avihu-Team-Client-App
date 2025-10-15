import Animated, { SlideOutLeft } from "react-native-reanimated";
import { INotification, useNotificationStore } from "@/store/notificationStore";
import React, { useMemo } from "react";
import ReminderContainer from "./ReminderContainer";

interface NotificationProps {
  notification: INotification;
}

const Notification: React.FC<NotificationProps> = ({ notification }) => {
  const { removeNotification } = useNotificationStore();

  const handleRemove = () => {
    removeNotification(notification.id);
  };

  const NotificationContainer = useMemo(() => {
    switch (notification.type) {
      /* In the future all notification types will be added in switch case */

      default:
        return <ReminderContainer type={notification.type} handleDismiss={handleRemove} />;
    }
  }, [notification]);

  return (
    <Animated.View
      exiting={SlideOutLeft.springify()}
      style={{
        backgroundColor: "#1e1e1e",
        padding: 14,
        borderRadius: 12,
        marginVertical: 6,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
      }}
    >
      {NotificationContainer}
    </Animated.View>
  );
};

export default Notification;
