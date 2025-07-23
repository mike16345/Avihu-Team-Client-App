import { View, Text, ScrollView } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";

import { CustomModal } from "@/components/ui/Modal";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Tabs from "@/components/ui/Tabs";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState("1");

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdXl,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>
      <PrimaryButton children="Open Modal" block onPress={() => setVisible(true)} />

      <Tabs
        items={[
          { label: `1`, value: "1" },
          { label: `2`, value: "2" },
          { label: `3`, value: "3" },
        ]}
        value={tab}
        setValue={(v) => setTab(v)}
      />

      <CustomModal visible={visible} onDismiss={() => setVisible(false)}>
        <CustomModal.Header dismissIcon="chevronRightBig">
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
