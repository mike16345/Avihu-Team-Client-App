import { Pressable, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { CustomModal } from "@/components/ui/modals/Modal";
import { Text } from "@/components/ui/Text";
import Icon from "@/components/Icon/Icon";
import { FC, useState, useEffect } from "react";
import { useTimerStore } from "@/store/timerStore";
import TriggerWrapper, { TriggerProps } from "@/components/ui/TriggerWrapper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface RestTimerProps {
  trigger: TriggerProps;
}

const RestTimer: FC<RestTimerProps> = ({ trigger }) => {
  const { layout } = useStyles();
  const { countdown } = useTimerStore();

  const [isVisible, setIsVisible] = useState(false);

  // 🔹 Animation setup
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    if (!isVisible) return;

    scale.value = withSequence(withTiming(1.15, { duration: 60 }), withTiming(1, { duration: 60 }));
  }, [countdown, isVisible]);

  return (
    <>
      <TriggerWrapper trigger={trigger} setOpen={() => setIsVisible(true)} />

      <CustomModal visible={isVisible} onDismiss={() => setIsVisible(false)} style={[layout.flex1]}>
        <View style={[layout.flex1, layout.center]}>
          <Animated.View style={animatedStyle}>
            <Text fontSize={100} fontVariant="brutalist">
              {countdown}
            </Text>
          </Animated.View>
        </View>
        <View style={[layout.itemsCenter, layout.justifyEnd]}>
          <Pressable onPress={() => setIsVisible(false)}>
            <Icon name="close" height={40} width={40} />
          </Pressable>
        </View>
      </CustomModal>
    </>
  );
};

export default RestTimer;
