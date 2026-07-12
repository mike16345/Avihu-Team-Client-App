import { CustomModal } from "@/components/ui/modals/Modal";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { Text } from "@/components/ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { StyleSheet, View } from "react-native";

interface FormExitConfirmationModalProps {
  visible: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

const FormExitConfirmationModal: React.FC<FormExitConfirmationModalProps> = ({
  visible,
  isLoading = false,
  onConfirm,
  onDismiss,
}) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <CustomModal transparent visible={visible} onDismiss={onDismiss}>
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
              onPress={onDismiss}
              disabled={isLoading}
            >
              לא
            </PrimaryButton>
            <PrimaryButton
              block
              style={styles.actionButton}
              onPress={onConfirm}
              loading={isLoading}
            >
              כן
            </PrimaryButton>
          </View>
        </View>
      </View>
    </CustomModal>
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
});

export default FormExitConfirmationModal;
