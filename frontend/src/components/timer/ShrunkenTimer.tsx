import { useTimerStore } from "@/store/timerStore";
import useStyles from "@/styles/useGlobalStyles";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import { formatTime } from "@/utils/timer";
import CircularPrgress from "../ui/CircularPrgress";

const ShrunkenTimer = () => {
  const { countdown, initialCountdown, stopCountdown } = useTimerStore();
  const { colors, fonts, layout, spacing, text } = useStyles();

  return (
    <View
      style={[
        layout.widthFull,
        layout.heightFull,
        spacing.pdDefault,
        spacing.pdHorizontalXl,
        layout.flexRow,
        layout.itemsEnd,
        layout.justifyBetween,
      ]}
    >
      <TouchableOpacity onPress={stopCountdown}>
        <Text style={[colors.textOnBackground, text.textUnderline, text.textBold, fonts.default]}>
          דלג
        </Text>
      </TouchableOpacity>
      <View style={[layout.flexRow, layout.itemsCenter, spacing.gapSm]}>
        <CircularPrgress
          maxValue={initialCountdown}
          value={countdown || 0}
          size={19}
          width={2}
          showValue={false}
          color={colors.backgroundInversePrimary.backgroundColor}
          secondaryColor={colors.backdrop.backgroundColor}
        />
        <Text
          style={[
            { color: colors.backgroundInversePrimary.backgroundColor },
            text.textBold,
            fonts.xl,
          ]}
        >
          {formatTime(countdown || 0)}
        </Text>
      </View>
    </View>
  );
};

export default ShrunkenTimer;
