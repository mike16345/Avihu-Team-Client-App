import AgreementPdfViewerScreen from "@/screens/Agreement/AgreementPdfViewerScreen";
import AgreementQuestionsScreen from "@/screens/Agreement/AgreementQuestionsScreen";
import AgreementSignatureScreen from "@/screens/Agreement/AgreementSignatureScreen";
import { FormProvider } from "@/context/useFormContext";
import { FormPreset } from "@/interfaces/FormPreset";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAgreementApi } from "@/hooks/api/useAgreementApi";
import { useEffect, useMemo, useState } from "react";
import { IAgreement } from "@/interfaces/IFormResponse";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";
import { View } from "react-native";
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { useCurrentAgreementStore } from "@/store/agreementStore";

export type AgreementStackParamList = {
  AgreementPdfViewer: undefined;
  AgreementQuestions: undefined;
  AgreementSignature: undefined;
};

const Stack = createNativeStackNavigator<AgreementStackParamList>();

const AgreementStack = () => {
  const { center, flex1 } = useLayoutStyles();
  const { getCurrentAgreement } = useAgreementApi();
  const [currentAgreement, setCurrentAgreement] = useState<IAgreement | null>(null);
  const { setCurrentAgreement: setCurrentAgreementStore } = useCurrentAgreementStore();

  const formPreset: FormPreset | undefined = useMemo(() => {
    if (!currentAgreement) return;

    return {
      _id: currentAgreement.agreementId,
      name: "Agreement Questions",
      type: "general",
      repeatMonthly: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          _id: "sec1",
          title: "Agreement Questions",
          questions: currentAgreement.questions,
        },
      ],
    };
  }, [currentAgreement]);

  const loadAgreement = async () => {
    try {
      const res = await getCurrentAgreement();

      if (!res) return;

      setCurrentAgreement(res);
      setCurrentAgreementStore(res);
    } catch (error) {
      console.error("Error loading agreement:", error);
    }
  };

  useEffect(() => {
    loadAgreement();
  }, []);

  if (!formPreset)
    return (
      <View style={[center, flex1]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <FormProvider form={formPreset}>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="AgreementPdfViewer"
          component={AgreementPdfViewerScreen}
          options={{
            headerShown: true,
            title: "תקנון והסכם הצטרפות",
          }}
        />
        <Stack.Screen
          name="AgreementQuestions"
          component={AgreementQuestionsScreen}
          options={{
            headerShown: true,
            title: "שאלון רפואי והצהרת בריאות",
            headerBackTitle: "חזור",
          }}
        />
        <Stack.Screen
          name="AgreementSignature"
          component={AgreementSignatureScreen}
          options={{
            headerShown: true,
            title: "חתימה ואישור התנאים",
            headerBackTitle: "חזור",
          }}
        />
      </Stack.Navigator>
    </FormProvider>
  );
};

export default AgreementStack;
