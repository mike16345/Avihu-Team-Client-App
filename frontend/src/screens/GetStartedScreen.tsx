import React from "react";
import { View, Text, ImageBackground, TouchableOpacity, useWindowDimensions } from "react-native";
import avihuFlyTrap from "@assets/avihuFlyTrap.jpeg";
import { moderateScale } from "react-native-size-matters";
import { RootStackParamList, StackNavigatorProps } from "../types/navigatorTypes";
import { StatusBar } from "expo-status-bar";
import useStyles from "@/styles/useGlobalStyles";

interface GetStartedScreenProps extends StackNavigatorProps<RootStackParamList, "Home"> {}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ navigation }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { height } = useWindowDimensions();

  return (
    <View style={[layout.flex1, layout.center]}>
      <StatusBar hidden />
      <ImageBackground
        source={avihuFlyTrap}
        style={[
          layout.center,
          {
            width: moderateScale(350, 2),
            height: moderateScale(700, 2),
            zIndex: 0,
          },
        ]}
      ></ImageBackground>
      <View
        style={[
          layout.flex1,
          layout.sizeFull,
          colors.background,
          { opacity: 0.4, position: `absolute`, zIndex: 40 },
        ]}
      ></View>
      <View
        style={[
          layout.justifyAround,
          layout.itemsCenter,
          spacing.gapXxl,
          { position: `absolute`, top: 0, zIndex: 100, height: height },
        ]}
      >
        <Text style={[fonts.xxxxl, colors.textOnBackground, text.textBold, { paddingBottom: 80 }]}>
          Avihu Busheri
        </Text>
        <TouchableOpacity
          onPress={() => navigation!.navigate("LoginScreen")}
          style={[colors.backgroundPrimary, spacing.pdDefault, common.rounded]}
        >
          <Text style={[text.textBold]}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
