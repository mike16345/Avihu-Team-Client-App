import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";
import { FlatList } from "react-native";

interface TipsModalProps {
  isOpen: boolean;
  dismiss: () => void;
  tips: string[];
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, dismiss, tips }) => {
  const { colors, fonts, spacing, text } = useStyles();
  return (
    <BottomDrawer open={isOpen} onClose={dismiss}>
      <ScrollView style={[spacing.pdMd, { height: `auto` }]}>
        <Text
          style={[text.textRight, fonts.xxl, text.textBold, colors.textPrimary, spacing.pdDefault]}
        >
          דגשים
        </Text>
        <FlatList
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item, index }) => (
            <Text
              style={[
                text.textBold,
                text.textRight,
                fonts.md,
                colors.textOnSurface,
                spacing.mgHorizontalSm,
                spacing.pdVerticalDefault,
              ]}
            >
              {index + 1 + ". "}
              {item}
            </Text>
          )}
          data={tips}
        />
      </ScrollView>
    </BottomDrawer>
  );
};

export default TipsModal;
