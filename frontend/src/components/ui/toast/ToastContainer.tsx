import { View } from "react-native";
import { useToastStore } from "@/store/toastStore";
import Toast from "./Toast";
import useStyles from "@/styles/useGlobalStyles";

const ToastContainer = () => {
  const { toasts } = useToastStore();
  const { layout, spacing } = useStyles();

  return (
    <View
      style={[
        layout.widthFull,
        layout.flexColumn,
        layout.justifyEnd,
        spacing.gapDefault,
        { position: "absolute", bottom: 0, left: 0, paddingBottom: 100 },
      ]}
    >
      {toasts.slice(-3).map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </View>
  );
};

export default ToastContainer;
