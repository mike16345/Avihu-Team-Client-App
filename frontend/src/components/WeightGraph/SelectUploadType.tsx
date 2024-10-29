import React, { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import * as ImagePicker from "expo-image-picker";

interface SelectUploadTypeProps {
  returnImage: (image: string) => void;
}

const SelectUploadType: React.FC<SelectUploadTypeProps> = ({ returnImage }) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    returnImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (result.canceled) {
      return;
    }

    returnImage(result.assets[0].uri);
  };

  const uploadTypes = [
    {
      iconName: `camera`,
      title: `מצלמה`,
      handlePress: () => takePhoto(),
    },
    {
      iconName: "upload",
      title: `גלרייה`,
      handlePress: () => pickImage(),
    },
  ];

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={[layout.flexRowReverse, layout.center, spacing.gapXxl, layout.widthFull]}>
      {uploadTypes.map((item, i) => (
        <TouchableOpacity
          key={i}
          style={[
            colors.backgroundSecondary,
            common.rounded,
            spacing.pdDefault,
            spacing.gapDefault,
            layout.center,
          ]}
          onPress={item.handlePress}
        >
          <NativeIcon
            library="FontAwesome"
            name={item.iconName}
            style={[colors.textPrimary, fonts.xl]}
          />
          <Text style={text.textBold}>{item.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default SelectUploadType;
