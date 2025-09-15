import Icon from "@/components/Icon/Icon";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import {
  AuthStackParamList,
  AuthStackParamListNavigationProp,
  StackNavigatorProps,
} from "@/types/navigatorTypes";
import { successNotificationHaptic } from "@/utils/haptics";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect } from "react";
import { View } from "react-native";

type SuccessScreenProps = StackNavigatorProps<AuthStackParamList, "SuccessScreen">;

export const SuccessScreen: React.FC<SuccessScreenProps> = ({ route }) => {
  const navigation = useNavigation<AuthStackParamListNavigationProp>();
  const { fonts, layout, spacing, text } = useStyles();

  useEffect(() => {
    successNotificationHaptic();
  }, []);

  return (
    <View
      style={[
        layout.flex1,
        layout.center,
        spacing.pdDefault,
        spacing.pdHorizontalXl,
        spacing.pdBottomBar,
      ]}
    >
      <View style={[layout.center, spacing.gapXl, layout.flex1]}>
        <Icon name="like" height={80} width={80} />
        <View style={layout.center}>
          <Text style={[text.textBold, fonts.xl]}>{route?.params?.title}</Text>
          <Text style={fonts.lg}>{route?.params?.message}</Text>
        </View>
      </View>
      <PrimaryButton
        onPress={() => {
          navigation.navigate("LoginScreen");
        }}
        block
      >
        חזרה לדף הבית
      </PrimaryButton>
    </View>
  );
};

export default SuccessScreen;
