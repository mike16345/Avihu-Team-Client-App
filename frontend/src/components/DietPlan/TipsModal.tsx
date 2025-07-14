import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";
import { FlatList, View } from "react-native";

interface TipsModalProps {
  isOpen: boolean;
  dismiss: () => void;
  tips: string[];
}

const TipsModal: React.FC<TipsModalProps> = ({ isOpen, dismiss, tips }) => {
  const { colors, fonts, spacing, text } = useStyles();
  return (
    <BottomDrawer heightVariant="auto" open={isOpen} onClose={dismiss}>
      <View style={[spacing.pdMd, { height: `auto` }]}>
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
      </View>
    </BottomDrawer>
  );
};

export default TipsModal;
