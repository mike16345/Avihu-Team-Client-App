import { useState } from "react";
import { View, StyleSheet, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { mockAgreement } from "@/mock/agreement";
import Checkbox from "@/components/ui/Checkbox";
import useStyles from "@/styles/useGlobalStyles";
import { AgreementStackParamList } from "@/navigators/AgreementStack"; // This will be created later
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PDFViewer from "@/components/ui/PDFViewer";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

type AgreementPdfViewerScreenNavigationProp = NativeStackNavigationProp<
  AgreementStackParamList,
  "AgreementPdfViewer"
>;

const AgreementPdfViewerScreen = () => {
  const [agreed, setAgreed] = useState(false);
  const navigation = useNavigation<AgreementPdfViewerScreenNavigationProp>();
  const { spacing, layout } = useStyles();
  const pdfHeight = useWindowDimensions().height * 0.7;

  const handleContinue = () => {
    navigation.navigate("AgreementQuestions");
  };

  return (
    <View style={[layout.flexRow, styles.container, spacing.pdStatusBar]}>
      <View style={[{ height: pdfHeight }]}>
        <PDFViewer uri={mockAgreement.pdfUrl} />
      </View>
      <View style={[spacing.pdHorizontalMd, spacing.pdLg, styles.bottomContainer]}>
        <Checkbox
          label="קראתי ואני מאשר את התקנון"
          isChecked={agreed}
          onCheck={() => setAgreed(!agreed)}
        />
        <PrimaryButton onPress={handleContinue} block disabled={!agreed}>
          המשך
        </PrimaryButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    justifyContent: "center",
    width: "100%",
    gap: 30,
  },
});

export default AgreementPdfViewerScreen;
