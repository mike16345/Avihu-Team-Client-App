import { View, useWindowDimensions } from "react-native";

import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";
import { useUserDrawer } from "@/store/userDrawerStore";

export default function TopBar() {
  const { colors, layout, spacing } = useStyles();
  const { height } = useWindowDimensions();
  const { setOpenUserDrawer } = useUserDrawer();

  return (
    <View
      style={[
        { paddingTop: spacing.pdStatusBar.paddingTop! + 5 },
        layout.itemsEnd,
        spacing.pdHorizontalDefault,
        {
          height: height * 0.1,
          borderBottomWidth: 0.25,
          borderBottomColor: colors.borderSecondaryContainer.borderColor,
        },
      ]}
    >
      <NativeIcon
        library="Feather"
        name="user"
        color={colors.textOnBackground.color}
        size={30}
        onPress={() => setOpenUserDrawer(true)}
      />
    </View>
  );
}
