import { useState } from "react";
import { View, StyleSheet, useWindowDimensions, Platform, BackHandler } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Checkbox from "@/components/ui/Checkbox";
import useStyles from "@/styles/useGlobalStyles";
import { AgreementStackParamList } from "@/navigators/AgreementStack";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import PDFViewer from "@/components/ui/PDFViewer";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useCurrentAgreementStore } from "@/store/agreementStore";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import SpinningIcon from "@/components/ui/loaders/SpinningIcon";

type AgreementPdfViewerScreenNavigationProp = NativeStackNavigationProp<
  AgreementStackParamList,
  "AgreementPdfViewer"
>;

const AgreementPdfViewerScreen = () => {
  const { height } = useWindowDimensions();
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const navigation = useNavigation<AgreementPdfViewerScreenNavigationProp>();
  const { spacing, layout } = useStyles();
  const { currentAgreement } = useCurrentAgreementStore();

  const handleContinue = () => {
    navigation.navigate("AgreementQuestions");
  };

  useFocusEffect(() => {
    if (Platform.OS !== "android") return;

    const handler = BackHandler.addEventListener("hardwareBackPress", () => true);

    return () => {
      handler.remove();
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <View style={layout.flex1}>
        <ConditionalRender condition={currentAgreement?.pdfUrl}>
          <PDFViewer
            uri={currentAgreement?.pdfUrl!}
            onScrollToEnd={() => setHasScrolledToEnd(true)}
          />
        </ConditionalRender>

        <ConditionalRender condition={!currentAgreement?.pdfUrl}>
          <View style={[layout.center, layout.flex1]}>
            <SpinningIcon mode="light" />
          </View>
        </ConditionalRender>
      </View>
      <View style={[spacing.pdHorizontalMd, spacing.pdLg, styles.bottomContainer]}>
        <Checkbox
          label="אני מאשר/ת כי קראתי והבנתי את מלוא תנאי ההסכם והתקנון"
          isChecked={agreed}
          onCheck={() => setAgreed(!agreed)}
          disabled={!hasScrolledToEnd}
        />
        <PrimaryButton onPress={handleContinue} block disabled={!agreed}>
          קראתי, בואו נמשיך
        </PrimaryButton>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, gap: 20 },
  bottomContainer: {
    justifyContent: "center",
    width: "100%",
    gap: 30,
  },
});

export default AgreementPdfViewerScreen;
