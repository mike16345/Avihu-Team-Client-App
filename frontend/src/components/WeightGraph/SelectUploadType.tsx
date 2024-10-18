import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import NativeIcon from "../Icon/NativeIcon";
import useStyles from "@/styles/useGlobalStyles";
import * as ImagePicker from "expo-image-picker";
import ImagePreview from "./ImagePreview";

const SelectUploadType = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerResult | null>(null);

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

    setSelectedImage(result);
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

    setSelectedImage(result);
  };

  const uploadTypes = [
    {
      title: `פתיחת מצלמה`,
      iconName: `camera`,
      handlePress: () => takePhoto(),
    },
    {
      title: `בחר תמונה קיימת`,
      iconName: "upload",
      handlePress: () => pickImage(),
    },
  ];

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={[spacing.gapXxl, layout.heightFull, { direction: "rtl" }]}>
      {selectedImage ? (
        <ImagePreview close={() => setSelectedImage(null)} image={selectedImage} />
      ) : (
        <>
          <Text style={[text.textLeft, fonts.xl, colors.textOnBackground, text.textBold]}>
            בחר צורת העלאה
          </Text>
          <View style={[spacing.gapLg, spacing.pdVerticalXxl]}>
            {uploadTypes.map(({ iconName, title, handlePress }, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  layout.flexRow,
                  layout.itemsCenter,
                  layout.justifyStart,
                  colors.backgroundSecondary,
                  spacing.gapXxl,
                  spacing.pdDefault,
                  common.rounded,
                ]}
                onPress={handlePress}
              >
                <NativeIcon
                  library="FontAwesome"
                  name={iconName}
                  style={[colors.textPrimary, fonts.xl]}
                />
                <Text style={[fonts.default]}>{title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );
};

export default SelectUploadType;
