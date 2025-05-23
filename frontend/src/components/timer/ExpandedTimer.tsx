import { View, TouchableOpacity } from "react-native";
import CircularPrgress from "../ui/CircularPrgress";
import { formatTime } from "@/utils/timer";
import { useTimerStore } from "@/store/timerStore";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "../ui/Text";
import NativeIcon from "../Icon/NativeIcon";

const ExpandedTimer = () => {
  const { countdown, initialCountdown, stopCountdown } = useTimerStore();
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        layout.widthFull,
        layout.flexRow,
        layout.justifyBetween,
        layout.itemsCenter,
        spacing.pdXl,
        spacing.pdVerticalXxl,
      ]}
    >
      <View style={[layout.itemsEnd, spacing.gapDefault]}>
        <Text style={[colors.textOnBackground, text.textCenter, text.textBold]}>
          זמן מנוחה עד לסט הבא
        </Text>
        <View style={[layout.flexRow, layout.itemsCenter, spacing.gapXxl]}>
          <TouchableOpacity onPress={stopCountdown}>
            <Text style={[colors.textOnBackground, text.textUnderline, text.textBold, fonts.lg]}>
              דלג
            </Text>
          </TouchableOpacity>
          <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
            <NativeIcon
              color={colors.textOnBackground.color}
              library="AntDesign"
              name="clockcircleo"
              style={[text.textBold, fonts.default]}
            />
            <Text style={[colors.textOnBackground, text.textBold, fonts.default]}>
              {formatTime(initialCountdown)}
            </Text>
          </View>
        </View>
      </View>
      <View style={[common.roundedFull, colors.background, spacing.pdXs]}>
        <CircularPrgress
          type="full"
          value={countdown || 0}
          size={90}
          width={10}
          maxValue={initialCountdown}
          color={colors.textPrimary.color}
          secondaryColor={colors.backdrop.backgroundColor}
          labelSize={fonts.lg.fontSize}
          prefil="from-start"
          valueFormatter={formatTime}
        />
      </View>
    </View>
  );
};

export default ExpandedTimer;
