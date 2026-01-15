import { useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import useStyles from "@/styles/useGlobalStyles";
import { useFormContext } from "@/context/useFormContext";
import { mockAgreement } from "@/mock/agreement";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

const AgreementSignatureScreen = () => {
  const ref = useRef<SignatureViewRef>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const { answers } = useFormContext(); // Using FormProvider from parent, so context is available
  const { spacing } = useStyles();

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

  const handleAgreeAndContinue = () => {
    if (!signature) {
      // TODO: Show an error message to the user
      console.log("Please provide a signature.");
      return;
    }

    const submissionPayload = {
      agreementId: mockAgreement.agreementId,
      agreementVersion: mockAgreement.version,
      answers,
      signatureBase64: signature,
    };

    console.log("Mock Submission Payload:", submissionPayload);

    // TODO: Implement real submission logic here
    // e.g., call a mutation to send the data to the server
    // After successful submission, navigate to the next screen in the app flow.
  };

  const webStyle = `
  .m-signature-pad {
    box-shadow: none; 
    border: 1px solid #eee;
    height: ${Dimensions.get("window").height * 0.6}px;
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
    <View style={[styles.container, spacing.pdStatusBar]}>
      <Text style={styles.title} fontVariant="semibold">
        אנא חתמו כאן
      </Text>
      <SignatureScreen
        ref={ref}
        onOK={handleOK}
        webStyle={webStyle}
        onEnd={handleEnd}
        penColor={"#000"}
      />
      <View style={[spacing.pdHorizontalMd, spacing.pdLg, styles.buttonContainer]}>
        <View style={styles.row}>
          <PrimaryButton mode="light" onPress={handleClear} style={styles.flex}>
            נקה
          </PrimaryButton>
          <PrimaryButton onPress={handleAgreeAndContinue} style={styles.flex} disabled={!signature}>
            אישור והמשך
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
