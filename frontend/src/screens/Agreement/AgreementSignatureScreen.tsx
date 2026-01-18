import { useRef, useState } from "react";
import { View, StyleSheet, Dimensions, useWindowDimensions } from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import useStyles from "@/styles/useGlobalStyles";
import { useFormContext } from "@/context/useFormContext";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useCurrentAgreementStore } from "@/store/agreementStore";
import { useAgreementApi } from "@/hooks/api/useAgreementApi";
import { ISignedAgreement } from "@/interfaces/IFormResponse";
import { useUserStore } from "@/store/userStore";
import { useNavigation } from "@react-navigation/native";
import { useToast } from "@/hooks/useToast";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";

const AgreementSignatureScreen = () => {
  const ref = useRef<SignatureViewRef>(null);
  const { answers } = useFormContext(); // Using FormProvider from parent, so context is available
  const { spacing, layout } = useStyles();
  const { currentAgreement, setCurrentAgreement } = useCurrentAgreementStore();
  const { sendSignedAgreement } = useAgreementApi();
  const currentUserId = useUserStore((state) => state.currentUser?._id);
  const navigation = useNavigation();
  const { triggerErrorToast } = useToast();

  const [signature, setSignature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOK = (sig: string) => {
    setSignature(sig);
  };

  const handleClear = () => {
    ref.current?.clearSignature();
    setSignature(null);
  };

  const handleEnd = () => {
    ref.current?.readSignature();
  };

  const handleAgreeAndContinue = async () => {
    if (!signature) {
      console.log("Please provide a signature.");
      return;
    }

    const mappedAnswers = Object.entries(answers).map(([key, value]) => ({
      questionId: key,
      value: value,
    }));

    const submissionPayload: ISignedAgreement = {
      agreementId: currentAgreement?.agreementId!,
      agreementVersion: currentAgreement?.version!,
      answers: mappedAnswers as any,
      signaturePngBase64: signature,
      userId: currentUserId!,
    };

    try {
      setIsLoading(true);
      await sendSignedAgreement(submissionPayload);

      setCurrentAgreement(null);
      navigation.navigate("BottomTabs");
    } catch (error: any) {
      triggerErrorToast({ message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const webStyle = `
  .m-signature-pad {
    box-shadow: none; 
    border: 1px solid #eee;
    height: ${useWindowDimensions().height * 0.6}px;
    width: ${useWindowDimensions().width}px;
    margin: 0 auto;
    background-color:#F8F8F8
  }
  .m-signature-pad--body {
    border: 1px solid #eee;
  }
  .m-signature-pad--footer {
    display: none;
    height:0
  }
  `;

  return (
    <View style={[styles.container]}>
      <ConditionalRender condition={!isLoading}>
        <SignatureScreen
          ref={ref}
          onOK={handleOK}
          webStyle={webStyle}
          onEnd={handleEnd}
          penColor={"#000"}
          imageType="image/png"
          trimWhitespace
        />
      </ConditionalRender>
      <ConditionalRender condition={isLoading}>
        <View style={[layout.flex1, layout.center]}>
          <SpinningIcon mode="light" />
        </View>
      </ConditionalRender>

      <View style={[spacing.pdHorizontalMd, spacing.pdLg, styles.buttonContainer]}>
        <View style={styles.row}>
          <PrimaryButton
            mode="light"
            onPress={handleClear}
            style={styles.flex}
            disabled={isLoading}
          >
            נקה
          </PrimaryButton>
          <PrimaryButton
            onPress={handleAgreeAndContinue}
            style={styles.flex}
            disabled={!signature}
            loading={isLoading}
          >
            חתימה ושליחה
          </PrimaryButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    margin: 20,
  },
  sigContainer: {
    height: Dimensions.get("window").height - 0.6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  flex: {
    flex: 1,
    marginHorizontal: 5,
  },
  buttonContainer: {
    paddingBottom: 30,
  },
});

export default AgreementSignatureScreen;
