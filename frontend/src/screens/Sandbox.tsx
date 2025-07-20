import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import ToastContainer from "@/components/ui/toast/ToastContainer";
import { useState } from "react";
import Tabs from "@/components/ui/Tabs";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  const [active1, setActive1] = useState("פחמימות");
  const [active2, setActive2] = useState("פחמימות");
  const [active3, setActive3] = useState("פחמימות");

  const tabs1 = [
    { value: "protein", label: "חלבונים" },
    { value: "carbs", label: "פחמימות" },
    { value: "fats", label: "שומנים" },
    { value: "vegetable", label: "ירקות" },
  ];

  const tabs2 = [
    { value: "day", label: "יומי" },
    { value: "week", label: "שבועי" },
    { value: "month", label: "חודשי" },
  ];

  const tabs3 = [
    { value: "login", label: "התחברות" },
    { value: "register", label: "חשבון חדש" },
  ];

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

      <Tabs items={tabs1} value={active1} setValue={(val) => setActive1(val)} />
      <Tabs items={tabs2} value={active2} setValue={(val) => setActive2(val)} />
      <Tabs items={tabs3} value={active3} setValue={(val) => setActive3(val)} />

      <Text>active1-{active1}</Text>
      <Text>active2-{active2}</Text>
      <Text>active3-{active3}</Text>

      <ToastContainer />
    </View>
  );
};

export default Sandbox;
