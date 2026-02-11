import { View } from "react-native";
import React, { useEffect } from "react";
import useStyles from "@/styles/useGlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamListNavigationProp } from "@/types/navigatorTypes";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import Icon from "@/components/Icon/Icon";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { successNotificationHaptic } from "@/utils/haptics";

const AgreementSignedScreen = () => {
  const { layout, spacing, colors, common, text } = useStyles();
  const navigation = useNavigation<RootStackParamListNavigationProp>();

  const scale = useSharedValue(0);

  const handlePress = () => navigation.replace("BottomTabs");

  useEffect(() => {
    scale.value = withSequence(
      withTiming(0, { duration: 0 }),
      withSpring(1, { damping: 10, stiffness: 100 }),
      withSpring(1.2, { damping: 8, stiffness: 150 }),
      withSpring(1, { damping: 12, stiffness: 100 })
    );
    successNotificationHaptic();
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  return (
    <View
      style={[
        colors.background,
        layout.flex1,
        spacing.pdHorizontalLg,
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        layout.justifyBetween,
        layout.itemsCenter,
      ]}
    >
      <View style={[layout.flex1, layout.center, spacing.gapXxl]}>
        <Animated.View
          style={[common.roundedFull, spacing.pdDefault, colors.backgroundSuccess, animatedStyle]}
        >
          <Icon color={colors.background.backgroundColor} name="check" height={80} width={80} />
        </Animated.View>
        <View style={[layout.center, spacing.gapDefault]}>
          <Text fontVariant="bold" fontSize={25}>
            הפרטים נשלחו בהצלחה!
          </Text>
          <Text fontSize={20} style={text.textCenter}>
            אני עובר על הכל אישית ומתחיל לבנות עבורך תוכנית מדויקת - זמן בנייה 2-3 ימים.
          </Text>
        </View>
      </View>
      <PrimaryButton onPress={handlePress} block>
        יאללה, לאפליקציה
      </PrimaryButton>
    </View>
  );
};

export default AgreementSignedScreen;
