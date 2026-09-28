import { Pressable, StyleSheet } from "react-native";
import Icon from "@/components/Icon/Icon";
import { Text } from "@/components/ui/Text";
import UploadDrawer from "@/components/ui/UploadDrawer";
import { useWeighInPhotosApi } from "@/hooks/api/useWeighInPhotosApi";
import { useToast } from "@/hooks/useToast";
import { useUserStore } from "@/store/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { USER_IMAGE_URLS_KEY } from "@/constants/reactQuery";

interface ReplaceCycleButtonProps {
  cycleNumber: number;
  oldUrls: string[];
}

const ReplaceCycleButton: React.FC<ReplaceCycleButtonProps> = ({ cycleNumber, oldUrls }) => {
  const { handleReplaceCycle, uploading } = useWeighInPhotosApi();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const queryClient = useQueryClient();
  const userId = useUserStore((state) => state.currentUser?._id);

  const onReplace = async (files: string[]) => {
    if (files.length !== oldUrls.length) {
      triggerErrorToast({
        title: "יש לבחור 4 תמונות",
        message: "החלפת מחזור דורשת בחירת 4 תמונות לפי הסדר.",
      });
      return;
    }
    try {
      await handleReplaceCycle(oldUrls, files);
      triggerSuccessToast({
        title: "הוחלף בהצלחה",
        message: `מחזור ${cycleNumber} עודכן`,
      });
      if (userId) {
        queryClient.invalidateQueries({ queryKey: [USER_IMAGE_URLS_KEY + userId] });
      }
    } catch (error) {
      triggerErrorToast({ message: "אירעה שגיאה בהחלפת המחזור" });
    }
  };

  return (
    <UploadDrawer
      imageCap={oldUrls.length}
      loading={uploading}
      handleUpload={onReplace}
      trigger={
        <Pressable style={styles.btn} hitSlop={6}>
          <Icon name="camera" width={12} height={12} />
          <Text fontSize={11} fontVariant="bold">
            החלפה
          </Text>
        </Pressable>
      }
      hint={
        <Text fontVariant="bold" style={styles.hint}>
          החליפו לפי הסדר: מלפנים → מאחור → מהצד ימין → מהצד שמאל
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(7, 39, 35, 0.15)",
  },
  hint: {
    textAlign: "center",
  },
});

export default ReplaceCycleButton;
