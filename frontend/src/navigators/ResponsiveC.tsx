import React from "react";
import {
  View,
  Image,
  Text,
  StyleSheet,
  PixelRatio,
  StatusBar,
  useWindowDimensions,
} from "react-native";
import localImage from "@assets/avihuFlyTrap.jpeg"; // Adjust the path to your image
import { useLayoutStyles } from "@/styles/useLayoutStyles";
import { useAppTheme } from "@/themes/useAppTheme";

const ResponsiveComponent = () => {
  // Get the pixel ratio of the device
  const pixelRatio = PixelRatio.get();
  const { center } = useLayoutStyles();
  const theme = useAppTheme();
  // Define the base layout size (in dp)
  const baseLayoutWidth = 200;
  const baseLayoutHeight = 100;

  const rWidth = PixelRatio.getPixelSizeForLayoutSize(baseLayoutWidth);
  const rHeight = PixelRatio.getPixelSizeForLayoutSize(baseLayoutHeight);
  const font = PixelRatio.getFontScale();
  const windowFont = useWindowDimensions().fontScale;

  console.log("font: " + font);
  console.log("window font", windowFont);
  console.log(rWidth + "px" + rHeight + "px");

  console.log("pixel ratio: ", pixelRatio);

  return (
    <View style={[styles.container]}>
      <Text style={{ color: theme.colors.success }} maxFontSizeMultiplier={2}>
        Responsive Component
      </Text>
      <Image
        source={localImage}
        style={{
          width: PixelRatio.getPixelSizeForLayoutSize(200),
          height: PixelRatio.getPixelSizeForLayoutSize(100),
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight,
  },
  text: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
});

export default ResponsiveComponent;
