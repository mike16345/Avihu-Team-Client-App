import React from "react";
import { View } from "react-native";
import UploadDrawer from "@/components/ui/UploadDrawer";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";

interface FileUploadInputProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const FileUploadInput: React.FC<FileUploadInputProps> = ({ value, onChange }) => {
  const { spacing, colors, layout } = useStyles();

  const handleUpload = async (images: string[]) => {
    onChange(images);
  };

  return (
    <View style={[spacing.gapSm, layout.itemsStart]}>
      <UploadDrawer
        handleUpload={handleUpload}
        trigger={<PrimaryButton mode="light">העלאת קבצים</PrimaryButton>}
        images={value}
      />
      <Text fontSize={14} style={colors.textPrimary}>
        {value.length ? `נבחרו ${value.length} קבצים` : "לא נבחרו קבצים"}
      </Text>
    </View>
  );
};

export default FileUploadInput;
