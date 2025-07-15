import { View, Text } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";
import IconButton from "@/components/ui/buttons/IconButton";

const Sandbox = () => {
  const { colors, spacing, layout } = useStyles();

  return (
    <View
      style={[
        spacing.pdBottomBar,
        spacing.pdStatusBar,
        spacing.pdDefault,
        colors.background,
        layout.sizeFull,
        spacing.gapDefault,
      ]}
    >
      <Text style={[colors.textPrimary]}>Sandbox</Text>

      <PrimaryButton mode="dark" children="התחברות" block icon="like" loading />
      <PrimaryButton mode="light" children="התחברות" block icon="like" loading />
      <PrimaryButton
        mode="dark"
        children="התחברות"
        block
        icon="like"
        onPress={() => console.log("pressed")}
      />
      <PrimaryButton
        mode="light"
        children={<Text style={{ color: "red" }}>kaka batacha</Text>}
        block
        icon="like"
      />

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <PrimaryButton mode="dark" children="התחברות" />

        <SecondaryButton children="הסטוריית משקל וחזרות" leftIcon="documentText" />
        <SecondaryButton children="דגשים" leftIcon="info" />
        <SecondaryButton children="הצגת תחליף לארוחה בחלבון" leftIcon="info" />
        <SecondaryButton children={<Text>aaaaaaabbbaa</Text>} rightIcon="arrowLeft" size="sm" />
        <SecondaryButton children="לצפייה" rightIcon="arrowLeft" size="sm" shadow={false} />
      </View>

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <IconButton icon="gallery" />
        <IconButton icon="camera" />
      </View>
    </View>
  );
};

export default Sandbox;
