import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";
import UploadDrawer from "@/components/ui/UploadDrawer";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useStyles from "@/styles/useGlobalStyles";

interface FileUploadInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ value, onChange }) => {
  const { spacing, layout, common } = useStyles();

  const handleUpload = async (images: string[]) => {
    onChange(images);
  };

  const renderTrigger = ({ onPress }: { onPress: () => void }) => {
    if (!value.length) {
      return (
        <PrimaryButton mode="light" onPress={onPress}>
          העלאת קבצים
        </PrimaryButton>
      );
    }

    return (
      <TouchableOpacity onPress={onPress} style={layout.widthFull}>
        <View style={styles.previewRow}>
          {value.map((image, index) => (
            <View key={`${image}-${index}`} style={styles.previewItem}>
              <Image
                source={{ uri: image }}
                resizeMode="cover"
                style={[styles.previewImage, common.rounded]}
              />
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[spacing.gapSm, layout.widthFull]}>
      <UploadDrawer
        handleUpload={handleUpload}
        trigger={renderTrigger}
        images={value}
        imageCap={4}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  previewRow: {
    flexDirection: "row",
    gap: 8,
  },
  previewItem: {
    width: 68,
  },
  previewImage: {
    width: 68,
    height: 68,
  },
});

export default FileUploadInput;
