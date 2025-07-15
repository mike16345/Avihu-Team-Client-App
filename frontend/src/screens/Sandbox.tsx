import { View, Text, Image } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import NativeIcon from "@/components/Icon/NativeIcon";
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
      <PrimaryButton mode="dark" label="התחברות" block icon="like" />
      <PrimaryButton mode="light" label="התחברות" block icon="like" />

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <PrimaryButton mode="dark" label="התחברות" />

        <SecondaryButton
          label="הסטוריית משקל וחזרות"
          leadingIcon={<NativeIcon library="AntDesign" name="API" size={20} />}
        />
        <SecondaryButton
          label="הסטוריית משקל וחזרות"
          trailingIcon={<NativeIcon library="AntDesign" name="API" size={20} />}
        />
        <SecondaryButton
          label="הסטוריית משקל וחזרות"
          trailingIcon={<NativeIcon library="AntDesign" name="API" size={20} />}
          size="sm"
        />
        <SecondaryButton
          label="הסטוריית משקל וחזרות"
          trailingIcon={<NativeIcon library="AntDesign" name="API" size={20} />}
          size="sm"
          shadow={false}
        />
      </View>

      <View style={[layout.flexRow, layout.wrap, spacing.gapDefault]}>
        <IconButton />
      </View>
    </View>
  );
};

export default Sandbox;
