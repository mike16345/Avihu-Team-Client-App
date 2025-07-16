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
        spacing.pdBottomBar,
        { position: "absolute", bottom: 0, left: 0 },
      ]}
    >
      {toasts.map((toast, i) => (
        <Toast key={i} toast={toast} />
      ))}
    </View>
  );
};

export default ToastContainer;
