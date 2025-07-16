import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/toast/Toast";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import { useAsyncWrapper } from "@/hooks/useAsyncWrapper";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { getExerciseMethodByName } = useExerciseMethodApi();

  const { loading, run, visible } = useAsyncWrapper();

  const call = () => run(() => getExerciseMethodByName("גקסונים"), "retrieved");

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <PrimaryButton
        mode="dark"
        children="success"
        block
        icon="like"
        onPress={() =>
          triggerSuccessToast({
            message: "היקפים נשמרו בהצלחה",
            title: "הועלה בהצלחה",
          })
        }
      />
      <PrimaryButton
        mode="light"
        children="error"
        block
        icon="like"
        onPress={() => triggerErrorToast({ message: "הסיסמה אינה תואמת", title: "שגיאה" })}
      />

      <View style={[{ height: 600 }, colors.backgroundError]}></View>

      <AsyncWrapper visible={visible}>
        <PrimaryButton
          mode="light"
          children="async"
          block
          icon="like"
          loading={loading}
          onPress={call}
        />
      </AsyncWrapper>

      <ToastContainer />
    </View>
  );
};

export default Sandbox;
