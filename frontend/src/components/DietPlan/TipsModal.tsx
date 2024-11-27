import React from "react";
import { CustomModal } from "../ui/Modal";
import { ScrollView } from "react-native-gesture-handler";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";

interface TipsModalProps {
  isOpen: boolean;
  dismiss: () => void;
  tips: string;
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, dismiss, tips }) => {
  const { colors, common, fonts, spacing, text } = useStyles();
  return (
    <CustomModal visible={isOpen} dismissable dismissableBackButton onDismiss={dismiss}>
      <ScrollView
        style={[
          colors.backgroundSecondaryContainer,
          spacing.pdMd,
          colors.borderPrimary,
          common.borderDefault,
          common.roundedMd,
          { height: `auto` },
        ]}
      >
        <Text
          style={[text.textRight, fonts.xl, text.textBold, colors.textPrimary, spacing.pdDefault]}
        >
          דגשים
        </Text>
        <Text style={[colors.textOnSecondaryContainer, text.textRight, spacing.pdDefault]}>
          {tips}
        </Text>
      </ScrollView>
    </CustomModal>
  );
};

export default TipsModal;
