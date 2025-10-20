import React from "react";
import Animated, { LinearTransition, FadeOutLeft } from "react-native-reanimated";
import { INotification, useNotificationStore } from "@/store/notificationStore";
import ReminderContainer from "./ReminderContainer";

interface NotificationProps {
  notification: INotification;
  onNavigate: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onNavigate }) => {
  const { removeNotification } = useNotificationStore();

  const handleRemove = () => {
    removeNotification(notification.id);
  };

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      exiting={FadeOutLeft.duration(120)}
    >
      <ReminderContainer
        type={notification.type}
        handleDismiss={handleRemove}
        onNavigate={onNavigate}
      />
    </Animated.View>
  );
};

export default Notification;
