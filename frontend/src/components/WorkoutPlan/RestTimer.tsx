import { View, Text, TouchableOpacity } from "react-native";

import React, { useEffect, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { ProgressBar } from "react-native-paper";
import NativeIcon from "../Icon/NativeIcon";
import { formatTime } from "@/utils/timer";
import { useTimerStore } from "@/store/timerStore";
import CircularPrgress from "../ui/CircularPrgress";

const RestTimer = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { countdown, initialCountdown, setCountdown } = useTimerStore();

  return (
    <View
      style={[
        colors.background,
        common.borderDefault,
        common.rounded,
        colors.borderInverseOnSurface,
      ]}
    >
      <View style={[layout.widthFull, layout.center, spacing.pdSm]}>
        <CircularPrgress
          type="full"
          value={countdown}
          size={90}
          width={10}
          maxValue={initialCountdown}
          color={colors.textPrimary.color}
          secondaryColor={colors.backdrop.backgroundColor}
          isTimer
        />
      </View>
    </View>
  );
};

export default RestTimer;
