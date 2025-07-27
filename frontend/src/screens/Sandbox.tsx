import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import Collapsible from "@/components/ui/Collapsible";
import { useState } from "react";
import Icon from "@/components/Icon/Icon";

const Sandbox = () => {
  const { colors, spacing, layout, common } = useStyles();

  const [open, setOpen] = useState(false);
  const [open2, setOpen2] = useState(false);
  const [open3, setOpen3] = useState(false);

  const handleOpenChange = (value: boolean, state: "open" | "open2") => {
    if (state == "open") {
      setOpen(value);
      setOpen2(!value);
    } else {
      setOpen2(value);
      setOpen(!value);
    }
  };

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

      <Collapsible
        isCollapsed={open}
        onCollapseChange={(val) => handleOpenChange(val, "open")}
        trigger="ארוחה 1"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <Text key={i}>מספר {i}</Text>
        ))}
      </Collapsible>
      <Collapsible
        isCollapsed={open2}
        onCollapseChange={(val) => handleOpenChange(val, "open2")}
        trigger={
          <View style={[layout.flexRow, layout.justifyBetween]}>
            <Text>ideal for custom icons (due to rotation)</Text>
            <Icon name="bell" rotation={open2 ? 12 : 0} />
          </View>
        }
      >
        {Array.from({ length: 25 }).map((_, i) => (
          <Text key={i}>מספר {i}</Text>
        ))}
      </Collapsible>

      <Collapsible
        variant="white"
        style={[open3 ? colors.backgroundSuccessContainer : {}, common.borderDefault]}
        isCollapsed={open3}
        onCollapseChange={(val) => setOpen3(val)}
        trigger="ארוחה 2"
      >
        {Array.from({ length: 15 }).map((_, i) => (
          <Text key={i}>מספר {i}</Text>
        ))}
      </Collapsible>
    </View>
  );
};

export default Sandbox;
