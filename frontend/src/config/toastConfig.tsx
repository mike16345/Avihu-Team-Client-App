import * as Haptic from "expo-haptics";
import { ErrorToast, SuccessToast, ToastProps } from "react-native-toast-message";

export const toastConfig = {
  success: (props: ToastProps) => {
    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Success);
    return <SuccessToast {...props} />;
  },
  error: (props: ToastProps) => {
    Haptic.notificationAsync(Haptic.NotificationFeedbackType.Error);
    return <ErrorToast {...props} />;
  },
};
