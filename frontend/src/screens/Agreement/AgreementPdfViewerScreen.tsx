import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import AgreementPdfViewer from "@/components/Agreements/AgreementPdfViewer";
import { mockAgreement } from "@/mock/agreement";
import Checkbox from "@/components/ui/Checkbox";
import Button from "@/components/Button/Button";
import useStyles from "@/styles/useGlobalStyles";
import { AgreementStackParamList } from "@/navigators/AgreementStack"; // This will be created later

type AgreementPdfViewerScreenNavigationProp = StackNavigationProp<
  AgreementStackParamList,
  "AgreementPdfViewer"
>;

const AgreementPdfViewerScreen = () => {
  const [agreed, setAgreed] = useState(false);
  const navigation = useNavigation<AgreementPdfViewerScreenNavigationProp>();
  const { spacing, layout } = useStyles();

  const handleContinue = () => {
    navigation.navigate("AgreementQuestions");
  };

  return (
    <View style={[layout.flex, styles.container]}>
      <AgreementPdfViewer agreement={mockAgreement} />
      <View style={[spacing.pHorizontalMd, spacing.pVl, styles.bottomContainer]}>
        <Checkbox
          label="I declare that I have read and agree to the terms above."
          isChecked={agreed}
          onCheck={() => setAgreed(!agreed)}
        />
        <Button
          text="Continue"
          onPress={handleContinue}
          // The button can be always enabled as per requirements, 
          // but this is how you would disable it based on the checkbox.
          // disabled={!agreed} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
  },
  bottomContainer: {
    borderTopWidth: 1,
    borderColor: "#eee",
  },
});

export default AgreementPdfViewerScreen;
