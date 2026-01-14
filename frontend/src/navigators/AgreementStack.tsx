import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import AgreementPdfViewerScreen from "@/screens/Agreement/AgreementPdfViewerScreen";
import AgreementQuestionsScreen from "@/screens/Agreement/AgreementQuestionsScreen";
import AgreementSignatureScreen from "@/screens/Agreement/AgreementSignatureScreen";
import { FormProvider } from "@/context/useFormContext";
import { mockAgreement } from "@/mock/agreement";
import { FormPreset } from "@/interfaces/FormPreset";

export type AgreementStackParamList = {
  AgreementPdfViewer: undefined;
  AgreementQuestions: undefined;
  AgreementSignature: undefined;
};

const Stack = createStackNavigator<AgreementStackParamList>();

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
        options={{ title: "Agreement" }}
      />
      <Stack.Screen
        name="AgreementQuestions"
        component={AgreementQuestionsScreen}
        options={{ title: "Questions" }}
      />
      <Stack.Screen
        name="AgreementSignature"
        component={AgreementSignatureScreen}
        options={{ title: "Signature" }}
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
    )
}


export default AgreementFlow;

// TODO: Integrate this navigator into the main App's navigation flow (e.g. in RootNavigator.tsx)
// For example:
// <Stack.Screen name="AgreementFlow" component={AgreementFlow} options={{ headerShown: false }} />
