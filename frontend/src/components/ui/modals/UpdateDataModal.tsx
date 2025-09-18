import { View, TouchableOpacity, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import Icon from "@/components/Icon/Icon";
import useStyles from "@/styles/useGlobalStyles";
import { CustomModal } from "./Modal";
import { Text } from "../Text";
import Input from "../inputs/Input";
import PrimaryButton from "../buttons/PrimaryButton";
import DateUtils from "@/utils/dateUtils";
import { useToast } from "@/hooks/useToast";
import { ZodObject } from "zod";
import { Keyboard } from "react-native";

interface UpdateDataModalProps {
  onSave: (data: string) => Promise<void>;
  onDelete: () => Promise<void>;
  date: string;
  existingValue?: string;
  label: string;
  placeholder?: string;
  prefix: string;
  schema?: ZodObject<any>;
  schemaKey?: string;
}

const UpdateDataModal: React.FC<UpdateDataModalProps> = ({
  date,
  onDelete,
  onSave,
  existingValue,
  schema,
  schemaKey,
  label,
  placeholder,
  prefix,
}) => {
  const { layout, spacing, text } = useStyles();
  const { width } = useWindowDimensions();
  const { triggerErrorToast } = useToast();

  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [value, setValue] = useState<string | undefined>(existingValue);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleDismissModal = () => {
    setOpenModal(false);
    setValue(undefined);
    setError(undefined);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      Keyboard.dismiss();

      if (schema && schemaKey) {
        const parsed = Number(value);

        const result = schema.safeParse({
          [schemaKey]: parsed,
        });

        if (!result.success) {
          const message = result.error.errors[0]?.message ?? "שגיאה לא ידועה";

          triggerErrorToast({ message });
          setError(message);
          return;
        }
      }

      setError(undefined);

      await onSave(value!);

      handleDismissModal();
    } catch (error: any) {
      triggerErrorToast({ message: error?.response?.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete();

      handleDismissModal();
    } catch (error: any) {
      triggerErrorToast({ message: error?.response?.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => setValue(existingValue), [existingValue]);

  return (
    <>
      <TouchableOpacity onPress={() => setOpenModal(true)}>
        <Icon name="pencil" />
      </TouchableOpacity>

      <CustomModal visible={openModal} onDismiss={() => setOpenModal(false)}>
        <CustomModal.Content>
          <View style={[layout.widthFull, layout.center, spacing.gapMd]}>
            <Text fontSize={16}>{DateUtils.formatDate(date!, "DD.MM.YYYY")}</Text>
            <Text fontSize={16}>
              {prefix}
              <Text style={[text.textUnderline]}>{value ? ` ${value}` : "_"}</Text>
            </Text>

            <View style={[spacing.gapLg, layout.center]}>
              <Input
                value={value}
                error={!!error}
                onChangeText={setValue}
                keyboardType="number-pad"
                label={label}
                style={[{ width: width * 0.75 }]}
                placeholder={placeholder || "הכניסו פרטים"}
              />
              <View style={[spacing.gapMd, { width: width * 0.5 }]}>
                <PrimaryButton loading={isLoading} disabled={isLoading} onPress={handleSave} block>
                  עדכון
                </PrimaryButton>
                <PrimaryButton
                  disabled={isLoading}
                  onPress={() => handleDismissModal()}
                  mode="light"
                  block
                >
                  ביטול
                </PrimaryButton>
              </View>
            </View>
            <TouchableOpacity disabled={isLoading} onPress={handleDelete}>
              <Icon name="trash" />
            </TouchableOpacity>
          </View>
        </CustomModal.Content>
      </CustomModal>
    </>
  );
};

export default UpdateDataModal;
