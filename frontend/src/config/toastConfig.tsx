import { errorNotificationHaptic, successNotificationHaptic } from "@/utils/haptics";
import { ErrorToast, SuccessToast, ToastProps } from "react-native-toast-message";

export const toastConfig = {
  success: (props: ToastProps) => {
    successNotificationHaptic()
    return <SuccessToast {...props} />;
  },
  error: (props: ToastProps) => {
    errorNotificationHaptic()
    return <ErrorToast {...props} />;
  },
};
