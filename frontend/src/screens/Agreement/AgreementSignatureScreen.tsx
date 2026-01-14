import React, { useRef, useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import SignatureScreen, { SignatureViewRef } from "react-native-signature-canvas";
import Button from "@/components/Button/Button";
import useStyles from "@/styles/useGlobalStyles";
import { useFormContext } from "@/context/useFormContext";
import { mockAgreement } from "@/mock/agreement";
import { Text } from "@/components/ui/Text";

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

  const handleConfirm = () => {
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
    border: none;
    height: ${Dimensions.get('window').height - 300}px;
  }
  .m-signature-pad--body {
    border: 1px solid #eee;
  }
  .m-signature-pad--footer {
    display: none;
  }
  `;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Please sign below</Text>
      <View style={styles.sigContainer}>
        <SignatureScreen
            ref={ref}
            onOK={handleOK}
            webStyle={webStyle}
            backgroundColor={"#fff"}
            penColor={"#000"}
        />
      </View>
        <View style={[spacing.pHorizontalMd, spacing.pVl, styles.buttonContainer]}>
            <View style={styles.row}>
                <Button text="Clear" onPress={handleClear} variant="outline" style={styles.flex} />
                <Button text="Confirm" onPress={handleConfirm} style={styles.flex} />
            </View>
            <Button
            text="Agree and Continue"
            onPress={handleAgreeAndContinue}
            disabled={!signature}
            />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
      fontSize: 20,
      textAlign: 'center',
      margin: 20
  },
  sigContainer: {
    flex: 1,
    height: Dimensions.get('window').height - 300,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  flex: {
      flex: 1,
      marginHorizontal: 5
  },
  buttonContainer: {
      paddingBottom: 30
  }
});

export default AgreementSignatureScreen;
