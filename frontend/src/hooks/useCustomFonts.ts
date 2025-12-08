import { useFonts } from "expo-font";

export default function useCustomFonts() {
  return useFonts({
    "Assistant-ExtraLight": require("../../assets/fonts/Assistant/Assistant-ExtraLight.ttf"),
    "Assistant-Light": require("../../assets/fonts/Assistant/Assistant-Light.ttf"),
    "Assistant-Regular": require("../../assets/fonts/Assistant/Assistant-Regular.ttf"),
    "Assistant-Medium": require("../../assets/fonts/Assistant/Assistant-Medium.ttf"),
    "Assistant-SemiBold": require("../../assets/fonts/Assistant/Assistant-SemiBold.ttf"),
    "Assistant-Bold": require("../../assets/fonts/Assistant/Assistant-Bold.ttf"),
    "Assistant-ExtraBold": require("../../assets/fonts/Assistant/Assistant-ExtraBold.ttf"),
    Brutalist: require("../../assets/fonts/TelAviv-BrutalistLight.ttf"),
  });
}
