import { semanticColors } from "@/themes/semanticColors";
import { useState } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Text } from "@/components/ui/Text";
import useLogout from "@/hooks/useLogout";
import FormExitConfirmationModal from "./FormExitConfirmationModal";

const QuestionnaireExitButton = () => {
  const { text } = useStyles();
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

      <FormExitConfirmationModal
        visible={isModalOpen}
        isLoading={isLoggingOut}
        onDismiss={closeModal}
        onConfirm={() => void onConfirmExit()}
      />
    </>
  );
};

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
  exitText: {
    color: semanticColors.app.formExit,
  },
});

export default QuestionnaireExitButton;
