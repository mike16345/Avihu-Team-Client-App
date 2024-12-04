import { View, useWindowDimensions } from "react-native";

import useStyles from "@/styles/useGlobalStyles";
import NativeIcon from "@/components/Icon/NativeIcon";
import { useUserDrawer } from "@/store/userDrawerStore";

export default function TopBar() {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { height } = useWindowDimensions();
  const { setOpenUserDrawer } = useUserDrawer();

  return (
    <View
      style={[
        spacing.pdStatusBar,
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
