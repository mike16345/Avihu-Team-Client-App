import { useEffect } from "react";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { RootStackParamList, StackNavigatorProps } from "@/types/navigatorTypes";
import useFormPresetById from "@/hooks/queries/FormPreset/useFormPresetById";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import { useFormStore } from "@/store/formStore";
import DynamicForm from "@/components/forms/dynamicForm/DynamicForm";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";

type FormPresetRouteProp = RouteProp<RootStackParamList, "FormPreset">;

type FormPresetScreenProps = StackNavigatorProps<RootStackParamList, "FormPreset"> & {
  route: FormPresetRouteProp;
};

const FormPresetScreen = ({ route }: FormPresetScreenProps) => {
  const { formId } = route.params;

  const { layout, spacing, colors } = useStyles();
  const setActiveFormId = useFormStore((state) => state.setActiveFormId);
  const { data, isLoading, isError, refetch } = useFormPresetById(formId);

  useEffect(() => {
    setActiveFormId(formId);
    return () => setActiveFormId(null);
  }, [formId, setActiveFormId]);

  if (isLoading) {
    return (
      <SafeAreaView style={[layout.flex1, layout.center, colors.background]}>
        <SpinningIcon mode="light" />
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={[layout.flex1, colors.background, spacing.pdHorizontalLg]}>
        <View style={[layout.flex1, layout.center, spacing.gapLg]}>
          <Text fontVariant="bold" fontSize={18} style={colors.textPrimary}>
            לא הצלחנו לטעון את השאלון
          </Text>
          <PrimaryButton onPress={() => refetch()} block>
            נסה שוב
          </PrimaryButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[layout.flex1, colors.background]}>
      <DynamicForm form={data} />
    </View>
  );
};

export default FormPresetScreen;
