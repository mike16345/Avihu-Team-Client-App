import { View, Text, ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";

import { CustomModal } from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [visible, setVisible] = useState(false);

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>
      <PrimaryButton children="Open Modal" block onPress={() => setVisible(true)} />

      <CustomModal visible={visible}>
        <CustomModal.Header onDismiss={() => setVisible(false)} dismissIcon="chevronRightBig">
          <View
            style={[
              colors.backgroundSurface,
              common.borderXsm,
              colors.outline,
              layout.center,
              spacing.gapDefault,
              common.rounded,
              layout.flex1,
              { height: 35 },
            ]}
          >
            <Text>חלבונים</Text>
          </View>
        </CustomModal.Header>

        <CustomModal.Content>
          <ScrollView contentContainerStyle={spacing.gapDefault}>
            {Array.from({ length: 50 }).map((_, i) => (
              <Text key={i}>I am index number {i}</Text>
            ))}
          </ScrollView>
        </CustomModal.Content>
      </CustomModal>
    </View>
  );
};

export default Sandbox;
