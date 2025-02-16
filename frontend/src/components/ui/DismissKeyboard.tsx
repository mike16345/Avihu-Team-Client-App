import { Keyboard, TouchableWithoutFeedback, useWindowDimensions, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";

const DismissKeyboard = () => {
  const { height, width } = useWindowDimensions();
  const { colors } = useStyles();

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          colors.background,
          {
            position: `absolute`,
            top: 0,
            left: 0,
            zIndex: 10,
            opacity: 0.1,
            height: height + 100,
            width: width,
          },
        ]}
      ></View>
    </TouchableWithoutFeedback>
  );
};

export default DismissKeyboard;
