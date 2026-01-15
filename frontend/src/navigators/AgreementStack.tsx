import React from "react";
import AgreementPdfViewerScreen from "@/screens/Agreement/AgreementPdfViewerScreen";
import AgreementQuestionsScreen from "@/screens/Agreement/AgreementQuestionsScreen";
import AgreementSignatureScreen from "@/screens/Agreement/AgreementSignatureScreen";
import { FormProvider } from "@/context/useFormContext";
import { mockAgreement } from "@/mock/agreement";
import { FormPreset } from "@/interfaces/FormPreset";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type AgreementStackParamList = {
  AgreementPdfViewer: undefined;
  AgreementQuestions: undefined;
  AgreementSignature: undefined;
};

const Stack = createNativeStackNavigator<AgreementStackParamList>();

const AgreementStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="AgreementPdfViewer"
        component={AgreementPdfViewerScreen}
        options={{ headerShown: false, presentation: "formSheet" }}
      />
      <Stack.Screen
        name="AgreementQuestions"
        component={AgreementQuestionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgreementSignature"
        component={AgreementSignatureScreen}
        options={{ headerShown: false, presentation: "formSheet" }}
      />
    </Stack.Navigator>
  );
};

const AgreementFlow = () => {
  // Adapt mock data to FormPreset interface
  const formPreset: FormPreset = {
    _id: mockAgreement.agreementId,
    name: "Agreement Questions",
    type: "general",
    showOn: "agreement",
    repeatMonthly: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        _id: "sec1",
        title: "Agreement Questions",
        questions: mockAgreement.questions,
      },
    ],
  };

  return (
    <FormProvider form={formPreset}>
      <AgreementStack />
    </FormProvider>
  );
};

export default AgreementFlow;

// TODO: Integrate this navigator into the main App's navigation flow (e.g. in RootNavigator.tsx)
// For example:
// <Stack.Screen name="AgreementFlow" component={AgreementFlow} options={{ headerShown: false }} />
