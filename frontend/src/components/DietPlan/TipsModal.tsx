import React from "react";
import { CustomModal } from "../ui/Modal";
import { ScrollView } from "react-native-gesture-handler";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";

interface TipsModalProps {
  isOpen: boolean;
  dismiss: () => void;
  tips: string;
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, dismiss, tips }) => {
  const { colors, common, fonts, spacing, text } = useStyles();
  return (
    <BottomDrawer open={isOpen} onClose={dismiss}>
      <ScrollView style={[spacing.pdMd, { height: `auto` }]}>
        <Text
          style={[text.textRight, fonts.xl, text.textBold, colors.textPrimary, spacing.pdDefault]}
        >
          דגשים
        </Text>
        <Text style={[colors.textOnSecondaryContainer, text.textRight, spacing.pdDefault]}>
          {tips}
        </Text>
      </ScrollView>
    </BottomDrawer>
  );
};

export default TipsModal;
