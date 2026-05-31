import { useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import { CustomModal } from "@/components/ui/modals/Modal";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import useLogout from "@/hooks/useLogout";

const QuestionnaireExitButton = () => {
  const { colors, common, layout, spacing, text } = useStyles();
  const { handleLogout } = useLogout();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeModal = () => {
    if (isLoggingOut) return;

    setIsModalOpen(false);
  };

  const onConfirmExit = async () => {
    try {
      setIsLoggingOut(true);
      await handleLogout();
      setIsModalOpen(false);
    } catch (e) {
      console.error("Error during logout:", e);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setIsModalOpen(true)} disabled={isLoggingOut}>
        <Text
          fontVariant="bold"
          style={[text.textUnderline, styles.exitText, isLoggingOut && styles.disabled]}
        >
          יציאה
        </Text>
      </TouchableOpacity>

      <CustomModal transparent visible={isModalOpen} onDismiss={closeModal}>
        <View style={[layout.flex1, layout.center]}>
          <View
            style={[
              colors.backgroundSurface,
              common.roundedMd,
              spacing.pdLg,
              spacing.gapLg,
              styles.modalCard,
            ]}
          >
            <Text fontVariant="extrabold" fontSize={22} style={[colors.textPrimary, styles.center]}>
              האם אתה בטוח שברצונך לצאת?
            </Text>

            <View style={[layout.flexRow, spacing.gapMd, styles.actionsRow]}>
              <PrimaryButton
                block
                mode="light"
                style={styles.actionButton}
                onPress={closeModal}
                disabled={isLoggingOut}
              >
                לא
              </PrimaryButton>
              <PrimaryButton
                block
                style={styles.actionButton}
                onPress={onConfirmExit}
                loading={isLoggingOut}
              >
                כן
              </PrimaryButton>
            </View>
          </View>
        </View>
      </CustomModal>
    </>
  );
};

const styles = StyleSheet.create({
  modalCard: {
    width: "100%",
    maxWidth: 360,
  },
  center: {
    textAlign: "center",
  },
  actionsRow: {
    width: "100%",
  },
  actionButton: {
    flex: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  exitText: {
    color: "#C53030",
  },
});

export default QuestionnaireExitButton;
