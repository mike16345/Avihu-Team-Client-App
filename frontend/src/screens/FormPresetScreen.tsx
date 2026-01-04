import { useEffect } from "react";
import { RouteProp } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { RootStackParamList, StackNavigatorProps } from "@/types/navigatorTypes";
import useFormPresetById from "@/hooks/queries/useFormPresetById";
import Loader from "@/components/ui/loaders/Loader";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import { useFormStore } from "@/store/formStore";
import DynamicForm from "@/components/forms/DynamicForm";

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
      <SafeAreaView style={[layout.flex1, colors.background]}>
        <Loader />
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
    <SafeAreaView style={[layout.flex1, colors.background]}>
      <DynamicForm form={data} />
    </SafeAreaView>
  );
};

export default FormPresetScreen;
