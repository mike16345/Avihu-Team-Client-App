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

      <PrimaryButton mode="dark" label="התחברות" block icon="like" loading />
      <PrimaryButton mode="light" label="התחברות" block icon="like" loading />
      <PrimaryButton
        mode="dark"
        label="התחברות"
        block
        icon="like"
        onPress={() => console.log("pressed")}
      />
      <PrimaryButton mode="light" label="התחברות" block icon="like" />

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <PrimaryButton mode="dark" label="התחברות" />

        <SecondaryButton label="הסטוריית משקל וחזרות" trailingIcon="documentText" />
        <SecondaryButton label="דגשים" trailingIcon="info" />
        <SecondaryButton label="הצגת תחליף לארוחה בחלבון" trailingIcon="info" />
        <SecondaryButton label="הסטוריית משקל וחזרות" leadingIcon="arrowLeft" size="sm" />
        <SecondaryButton label="לצפייה" leadingIcon="arrowLeft" size="sm" shadow={false} />
      </View>

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <IconButton icon="gallery" />
        <IconButton icon="camera" />
      </View>
    </View>
  );
};

export default Sandbox;
