import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import Icon from "@/components/Icon/Icon";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";

interface ErrorScreenProps {
  isFetching?: boolean;
  error?: any;
  refetchFunc?: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ isFetching = false, error, refetchFunc }) => {
  const { colors, fonts, layout, spacing } = useStyles();

  return (
    <>
      <View
        style={[
          layout.flex1,
          layout.center,
          spacing.gapDefault,
          colors.background,
          spacing.pdLg,
          spacing.pdBottomBar,
        ]}
      >
        <View style={[layout.flex1, layout.center]}>
          <Icon name="info" color={colors.textDanger.color} height={100} width={100} />
          <Text style={[colors.textPrimary, fonts.xl]}>אירעה שגיאה</Text>
          <ConditionalRender
            condition={error}
            children={<Text style={[colors.textPrimary, fonts.xl]}>{error?.message || ""}</Text>}
          />
        </View>

        {refetchFunc && (
          <PrimaryButton onPress={refetchFunc} block loading={isFetching}>
            נסה שוב
          </PrimaryButton>
        )}
      </View>
    </>
  );
};

export default ErrorScreen;
