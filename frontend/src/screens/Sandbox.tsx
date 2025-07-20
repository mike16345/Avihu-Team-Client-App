import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { useState } from "react";
import CustomDropdown from "@/components/ui/CustomDropdown";

const testItems = [
  { label: "תפוח", value: "תפוח" },
  { label: "בננה", value: "בננה" },
  { label: "דובדבן", value: "דובדבן" },
  { label: "תמר", value: "תמר" },
  { label: "סמבוק", value: "סמבוק" },
  { label: "תאנה", value: "תאנה" },
  { label: "ענב", value: "ענב" },
  { label: "מלון דבש", value: "מלון דבש" },
  { label: "קיווי", value: "קיווי" },
  { label: "לימון", value: "לימון" },
];

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { getExerciseMethodByName } = useExerciseMethodApi();

  const [loading, setLoading] = useState(false);

  const get = async () => {
    setLoading(true);
    try {
      await getExerciseMethodByName("אימון פוקוס על כוח שיא (Max Effort)");
    } catch (error) {
      throw error; //throwing error is important for internal try catch to work in asyncWrapper
    } finally {
      setLoading(false);
    }
  };

  const [value, setValue] = useState<string>();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
        { direction: "rtl" },
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <Text>{value || "select to change me"}</Text>
      <CustomDropdown
        items={testItems}
        selectedValue={value}
        onSelect={(selected) => setValue(selected)}
      />
    </View>
  );
};

export default Sandbox;
