import React from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { INotification, useNotificationStore } from "@/store/notificationStore";
import ReminderContainer from "./ReminderContainer";

interface NotificationProps {
  notification: INotification;
  onNavigate: () => void;
}

const Notification: React.FC<NotificationProps> = ({ notification, onNavigate }) => {
  const { removeNotification } = useNotificationStore();

  // Shared values for manual animation
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  // Called when user presses dismiss
  const handleRemove = () => {
    // Animate out manually
    translateX.value = withTiming(-300, { duration: 250 }); // slide left
    opacity.value = withTiming(0, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(removeNotification)(notification.id); // remove from store after animation
      }
    });
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[animatedStyle, { width: "100%" }]}>
      <ReminderContainer
        type={notification.type}
        handleDismiss={handleRemove}
        onNavigate={onNavigate}
      />
    </Animated.View>
  );
};

export default Notification;
