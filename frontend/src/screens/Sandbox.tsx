import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useToast } from "@/hooks/useToast";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import AsyncWrapper from "@/components/ui/AsyncWrapper";
import useExerciseMethodApi from "@/hooks/api/useExerciseMethodsApi";
import { useState } from "react";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { getExerciseMethodByName } = useExerciseMethodApi();

  const [loading, setLoading] = useState(false);

  const get = async () => {
    setLoading(true);
    try {
      await getExerciseMethodByName("אימון פוקוס על כוח שיא (Max Effort)");
    } catch (error) {
      throw error; //throwing error is important for internal try catch to work in asyncWrapper
    } finally {
      setLoading(false);
    }
  };

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

      {/*AsyncWrapper can accept any child. if its button the button must be passed the disabled prop. i didnt find many ways to do this automatically in the component that werent verbose and ugly */}
      <AsyncWrapper messages={{ success: { message: "yayayayay" } }} onPress={get}>
        <PrimaryButton mode="light" children="async" block icon="like" loading={loading} disabled />
      </AsyncWrapper>

      <ToastContainer />
    </View>
  );
};

export default Sandbox;
