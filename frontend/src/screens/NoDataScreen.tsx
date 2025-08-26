import NativeIcon from "@/components/Icon/NativeIcon";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import React from "react";
import { Linking, RefreshControl, ScrollView, View } from "react-native";
import { Button } from "react-native-paper";
import Constants from "expo-constants";

interface NoDataScreenProps {
  variant?: "dietPlan" | "workoutPlan";
  message?: string;
  refreshFunc?: () => void;
  refreshing?: boolean;
}

const NoDataScreen: React.FC<NoDataScreenProps> = ({
  variant,
  message,
  refreshFunc,
  refreshing = false,
}) => {
  const { colors, fonts, common, layout, spacing, text } = useStyles();
  const isDevMode = process.env.EXPO_PUBLIC_MODE == "development";
  const TRAINER_PHONE_NUMBER = isDevMode
    ? process.env.EXPO_PUBLIC_TRAINER_PHONE_NUMBER
    : Constants?.expoConfig?.extra?.TRAINER_PHONE_NUMBER;

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshFunc} />}
      contentContainerStyle={[
        layout.flex1,
        layout.sizeFull,
        layout.center,
        spacing.gapDefault,
        colors.background,
      ]}
    >
      <NativeIcon
        library="Ionicons"
        name="cloud-offline-outline"
        size={110}
        style={[colors.textPrimary, spacing.pdDefault]}
      />
      <Text style={[fonts.lg, colors.textOnBackground, text.textBold]}>
        {message
          ? message
          : variant == `dietPlan`
          ? `טרם בנו לך תפריט תזונה`
          : `טרם בנו לך תוכנית אימון`}
      </Text>
      {variant && (
        <Button
          mode="contained"
          onPress={() => Linking.openURL(`whatsapp://send?phone=${TRAINER_PHONE_NUMBER}`)}
          style={[common.rounded, layout.center, spacing.mgDefault]}
        >
          <View style={[layout.flexRow, layout.center, spacing.gapDefault, spacing.pdXs]}>
            <Text style={[text.textBold, colors.textOnBackground]}>צור קשר עם המאמן</Text>
            <NativeIcon
              library="FontAwesome"
              name="whatsapp"
              style={[fonts.lg, colors.textOnBackground]}
            />
          </View>
        </Button>
      )}
    </ScrollView>
  );
};

export default NoDataScreen;
