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

      <CustomModal
        visible={visible}
        onDismiss={() => setVisible(false)}
        dismissableBackButton
        dismissable={false}
        dismissIcon="chevronRightBig"
        title={
          <View
            style={[
              colors.backgroundSurface,
              layout.center,
              spacing.pdDefault,
              common.rounded,
              colors.outline,
              ,
              common.borderXsm,
            ]}
          >
            <Text>חלבונים</Text>
          </View>
        }
      >
        <ScrollView contentContainerStyle={spacing.gapDefault}>
          {Array.from({ length: 50 }).map((_, i) => (
            <Text key={i}>I am index number {i}</Text>
          ))}
        </ScrollView>
      </CustomModal>
    </View>
  );
};

export default Sandbox;
