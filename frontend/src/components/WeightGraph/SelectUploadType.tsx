import React, { useEffect } from "react";
import { Alert, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { openSettings } from "expo-linking";
import IconButton from "../ui/buttons/IconButton";
interface SelectUploadTypeProps {
  returnImage: (image: string) => void;
}

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  mediaTypes: "images",
  allowsEditing: true,
  cameraType: ImagePicker.CameraType.back,
  quality: 1,
};

const SelectUploadType: React.FC<SelectUploadTypeProps> = ({ returnImage }) => {
  const { layout } = useStyles();

  const [_, requestPermission] = ImagePicker.useCameraPermissions();

  const checkPermissions = async (
    getPermissions: () => Promise<
      ImagePicker.CameraPermissionResponse | ImagePicker.MediaLibraryPermissionResponse
    >,
    requestPermissions: () => Promise<
      ImagePicker.CameraPermissionResponse | ImagePicker.MediaLibraryPermissionResponse
    >
  ) => {
    const { status, canAskAgain } = await getPermissions();

    if (status !== "granted") {
      if (canAskAgain) {
        const { status: newStatus } = await requestPermissions();

        return newStatus;
      } else {
        Alert.alert(
          "דרושה הרשאה",
          "כדי לגשת לתמונות שלך, יש לאפשר הרשאה לספריית המדיה/מצלמה בהגדרות המכשיר.",
          [{ text: "פתח הגדרות", onPress: () => openSettings() }, { text: "בטל" }]
        );
      }
    }

    return status;
  };

  const pickImage = async () => {
    const status = await checkPermissions(
      ImagePicker.getMediaLibraryPermissionsAsync,
      ImagePicker.requestMediaLibraryPermissionsAsync
    );

    if (status !== "granted") return;

    let result = await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

    if (result.canceled) {
      return;
    }

    returnImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const status = await checkPermissions(
      ImagePicker.getCameraPermissionsAsync,
      ImagePicker.requestCameraPermissionsAsync
    );

    if (status !== "granted") return;

    let result = await ImagePicker.launchCameraAsync(imagePickerOptions);

    if (result.canceled) return;
    const fixedImage = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ flip: ImageManipulator.FlipType.Horizontal }],
      {
        compress: 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    returnImage(fixedImage.uri);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  return (
    <View style={[layout.flexRow, layout.center, { gap: 40 }, layout.widthFull]}>
      <IconButton icon="camera" onPress={takePhoto} />
      <IconButton icon="gallery" onPress={pickImage} />
    </View>
  );
};

export default SelectUploadType;
