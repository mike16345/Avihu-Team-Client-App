import React from "react";
import Animated, { LinearTransition, FadeOutLeft } from "react-native-reanimated";
import { INotification, useNotificationStore } from "@/store/notificationStore";
import ReminderContainer from "./ReminderContainer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import FormReminderContainer from "./FormReminderContainer";

interface NotificationProps {
  notification: INotification;
  onNavigate: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onNavigate }) => {
  const { removeNotification } = useNotificationStore();

  const isFormType = notification.type === "monthlyForm" || notification.type === "generalForm";

  const handleRemove = () => {
    removeNotification(notification.id);
  };

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(180)}
      exiting={FadeOutLeft.duration(120)}
    >
      <ConditionalRender condition={!isFormType}>
        <ReminderContainer
          type={notification.type as "weighIn" | "measurement"}
          handleDismiss={handleRemove}
          onNavigate={onNavigate}
        />
      </ConditionalRender>

      <ConditionalRender condition={isFormType}>
        <FormReminderContainer
          notification={notification}
          handleDismiss={handleRemove}
          onNavigate={onNavigate}
        />
      </ConditionalRender>
    </Animated.View>
  );
};

export default Notification;
