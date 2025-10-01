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

type FieldConfig = {
  key: string;
  label?: string;
  placeholder?: string;
  prefix?: string;
  keyboardType?: "default" | "number-pad" | "numeric" | "email-address" | "phone-pad";
  existingValue?: string;
  schemaKey?: string;
  parse?: (raw: string | undefined) => unknown;
  inputProps?: Partial<React.ComponentProps<typeof Input>>;
};

interface UpdateDataModalProps {
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
  date: string;

  /**  Deprecated use fields[].existingValue instead */
  existingValue?: string;
  /**  Deprecated use fields[].label instead */
  label?: string;
  /**  Deprecated use fields[].placeholder instead */
  placeholder?: string;
  /**  Deprecated use fields[].placeholder instead */
  prefix?: string;
  /**  Deprecated use fields[].schemaKey instead */
  schemaKey?: string;

  schema?: ZodObject<any>;
  fields?: FieldConfig[]; // NEW: if omitted, falls back to single-field mode
}

const UpdateDataModal: React.FC<UpdateDataModalProps> = ({
  date,
  onDelete,
  onSave,
  existingValue,
  schema,
  label,
  placeholder,
  prefix,
  schemaKey,
  fields,
}) => {
  const { layout, spacing, text } = useStyles();
  const { width } = useWindowDimensions();
  const { triggerErrorToast } = useToast();

  const singleFieldFallback: FieldConfig[] = [
    {
      key: schemaKey || "",
      label,
      placeholder,
      prefix,
      existingValue,
      keyboardType: "number-pad",
      schemaKey: schemaKey, // from your old props
    },
  ];

  const fieldList = fields && fields.length ? fields : singleFieldFallback;

  const [values, setValues] = useState<Record<string, string | undefined>>(() =>
    fieldList.reduce((acc, f) => {
      acc[f.key] = f.existingValue;
      return acc;
    }, {} as Record<string, string | undefined>)
  );

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [openModal, setOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const coerce = (raw: string | undefined, f: FieldConfig) => {
    if (f.parse) return f.parse(raw);
    if (f.keyboardType === "number-pad" || f.keyboardType === "numeric") {
      const n = Number(raw);
      return Number.isNaN(n) ? raw : n;
    }
    return raw ?? "";
  };

  const buildParsedObject = () => {
    return fieldList.reduce((acc, f) => {
      acc[f.key] = coerce(values[f.key], f);
      return acc;
    }, {} as Record<string, unknown>);
  };

  const handleDismissModal = () => {
    setOpenModal(false);
    setErrors({});
    setValues(
      fieldList.reduce((acc, f) => {
        acc[f.key] = f.existingValue;
        return acc;
      }, {} as Record<string, string | undefined>)
    );
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      Keyboard.dismiss();

      const payload = buildParsedObject();

      if (schema) {
        const result = schema.safeParse(payload);

        if (!result.success) {
          const fieldErrorMap: Record<string, string | undefined> = {};
          const first = result.error.errors[0];
          result.error.errors.forEach((e) => {
            const p = e.path?.[0] as string | undefined;
            if (p) fieldErrorMap[p] = e.message;
          });
          setErrors(fieldErrorMap);
          triggerErrorToast({ message: first?.message ?? "שגיאה לא ידועה" });
          return;
        }
      }

      setErrors({});
      await onSave(payload);
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

  useEffect(() => {
    setValues(() =>
      fieldList.reduce((acc, f) => {
        acc[f.key] = f.existingValue;
        return acc;
      }, {} as Record<string, string | undefined>)
    );
    setErrors({});
  }, [existingValue, JSON.stringify(fields)]);

  return (
    <>
      <TouchableOpacity onPress={() => setOpenModal(true)}>
        <Icon name="pencil" />
      </TouchableOpacity>

      <CustomModal visible={openModal} onDismiss={() => setOpenModal(false)}>
        <CustomModal.Content>
          <View style={[layout.widthFull, layout.center, spacing.gapMd]}>
            <Text fontSize={16}>{DateUtils.formatDate(date!, "DD.MM.YYYY")}</Text>
            <View style={[layout.flexRow, layout.itemsCenter]}>
              {fieldList.map((f) => (
                <Text key={f.key} fontSize={16}>
                  {f.prefix ?? prefix}
                  <Text style={[text.textUnderline]}>
                    {values[f.key] ? ` ${values[f.key]}` : "_"}
                  </Text>
                </Text>
              ))}
            </View>

            <View style={[spacing.gapLg, layout.center]}>
              {fieldList.map((f) => (
                <Input
                  key={f.key}
                  value={values[f.key]}
                  error={!!errors[f.key]}
                  onChangeText={(txt) => setValues((prev) => ({ ...prev, [f.key]: txt }))}
                  keyboardType={f.keyboardType ?? "default"}
                  label={f.label}
                  style={[{ width: width * 0.75 }]}
                  placeholder={f.placeholder || "הכניסו פרטים"}
                  {...(f.inputProps ?? {})}
                />
              ))}

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
