import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import { selectionHaptic, successNotificationHaptic } from "@/utils/haptics";
import {
  createFoodCatalogDraft,
  createSmartFoodEntry,
  validateSmartFoodDraft,
  type SmartFoodDraft,
  type SmartFoodDraftErrors,
  type SmartFoodEntry,
} from "./foodCatalog";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

interface FoodCatalogResultCardProps {
  product?: FoodCatalogProduct;
  initialDraft?: SmartFoodDraft;
  entryIdentity?: Pick<SmartFoodEntry, "id" | "recordedAt">;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  disabled?: boolean;
  onDismiss: () => void;
  onSubmit: (entry: SmartFoodEntry) => void;
}

interface MacroInputProps {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

const MacroInput = ({ label, value, error, onChange }: MacroInputProps) => (
  <View style={styles.macroField}>
    <Text fontVariant="medium" fontSize={11} style={styles.fieldLabel}>
      {label}
    </Text>
    <TextInput
      value={value}
      onChangeText={onChange}
      keyboardType="decimal-pad"
      placeholder="0"
      placeholderTextColor="#A0A7B0"
      selectTextOnFocus
      style={[styles.macroInput, error ? styles.inputError : null]}
    />
  </View>
);

const resolveInitialDraft = (
  product: FoodCatalogProduct | undefined,
  initialDraft: SmartFoodDraft | undefined
): SmartFoodDraft => {
  if (initialDraft) return initialDraft;
  if (product) return createFoodCatalogDraft(product);
  throw new Error("FoodCatalogResultCard requires a product or an initial draft");
};

const FoodCatalogResultCard = ({
  product,
  initialDraft,
  entryIdentity,
  title = "נמצא מוצר",
  subtitle = "אפשר לתקן כל ערך לפני הרישום",
  submitLabel = "רשום את המוצר",
  disabled,
  onDismiss,
  onSubmit,
}: FoodCatalogResultCardProps) => {
  const [draft, setDraft] = useState<SmartFoodDraft>(() =>
    resolveInitialDraft(product, initialDraft)
  );
  const [errors, setErrors] = useState<SmartFoodDraftErrors>({});

  useEffect(() => {
    setDraft(resolveInitialDraft(product, initialDraft));
    setErrors({});
  }, [initialDraft, product]);

  const preview = useMemo(
    () => createSmartFoodEntry(draft, "preview", new Date(0).toISOString()),
    [draft]
  );

  const update = (field: keyof SmartFoodDraft, value: string) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const record = () => {
    const nextErrors = validateSmartFoodDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const entry = createSmartFoodEntry(
      draft,
      entryIdentity?.id ?? `smart-food-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      entryIdentity?.recordedAt ?? new Date().toISOString()
    );
    if (!entry) return;

    void successNotificationHaptic();
    onSubmit(entry);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            selectionHaptic();
            onDismiss();
          }}
          hitSlop={8}
          style={styles.closeButton}
        >
          <Text fontVariant="bold" fontSize={18} style={styles.closeLabel}>
            ×
          </Text>
        </Pressable>
        <View style={styles.headerText}>
          <Text fontVariant="bold" fontSize={17} style={styles.title}>
            {title}
          </Text>
          <Text fontSize={12} style={styles.subtitle}>
            {subtitle}
          </Text>
        </View>
        <View style={styles.successDot}>
          <Text fontVariant="bold" fontSize={16} style={styles.successCheck}>
            ✓
          </Text>
        </View>
      </View>

      <View style={styles.nameSection}>
        <Text fontVariant="medium" fontSize={11} style={styles.fieldLabel}>
          שם המוצר
        </Text>
        <TextInput
          value={draft.name}
          onChangeText={(value) => update("name", value)}
          placeholder="שם המוצר"
          placeholderTextColor="#A0A7B0"
          style={[styles.nameInput, errors.name ? styles.inputError : null]}
        />
        {product?.brand ? (
          <Text fontSize={11} style={styles.brand}>
            {product.brand}
          </Text>
        ) : null}
      </View>

      <View style={styles.servingRow}>
        <View style={styles.servingDescription}>
          <Text fontVariant="medium" fontSize={11} style={styles.fieldLabel}>
            הגדרת מנה
          </Text>
          <Text fontVariant="semibold" fontSize={14} style={styles.servingText}>
            {draft.servingDescription}
          </Text>
        </View>
        <View style={styles.servingCountField}>
          <Text fontVariant="medium" fontSize={11} style={styles.fieldLabel}>
            מספר מנות
          </Text>
          <TextInput
            value={draft.servingCount}
            onChangeText={(value) => update("servingCount", value)}
            keyboardType="decimal-pad"
            selectTextOnFocus
            style={[styles.servingInput, errors.servingCount ? styles.inputError : null]}
          />
        </View>
      </View>

      <View style={styles.macrosSection}>
        <Text fontVariant="semibold" fontSize={13} style={styles.sectionTitle}>
          ערכים למנה אחת
        </Text>
        <View style={styles.macrosRow}>
          <MacroInput
            label="קלוריות"
            value={draft.calories}
            error={errors.calories}
            onChange={(value) => update("calories", value)}
          />
          <MacroInput
            label="חלבון"
            value={draft.protein}
            error={errors.protein}
            onChange={(value) => update("protein", value)}
          />
          <MacroInput
            label="פחמימה"
            value={draft.carbs}
            error={errors.carbs}
            onChange={(value) => update("carbs", value)}
          />
          <MacroInput
            label="שומן"
            value={draft.fat}
            error={errors.fat}
            onChange={(value) => update("fat", value)}
          />
        </View>
      </View>

      {preview ? (
        <View style={styles.preview}>
          <Text fontVariant="semibold" fontSize={12} style={styles.previewText}>
            {`${formatDietPlanV2Number(preview.macros.calories)} קק"ל · ${formatDietPlanV2Number(preview.macros.protein)} חלבון · ${formatDietPlanV2Number(preview.macros.carbs)} פחמימה · ${formatDietPlanV2Number(preview.macros.fat)} שומן`}
          </Text>
        </View>
      ) : null}

      {Object.keys(errors).length > 0 ? (
        <View style={styles.errorSummary}>
          <Text selectable fontVariant="semibold" fontSize={12} style={styles.error}>
            יש לתקן את השדות המסומנים:
          </Text>
          {Object.values(errors).map((message) => (
            <View key={message} style={styles.errorDetailRow}>
              <View style={styles.errorDot} />
              <Text selectable fontSize={12} style={styles.errorDetail}>
                {message}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <PrimaryButton block disabled={disabled} onPress={record}>
        {submitLabel}
      </PrimaryButton>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    gap: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BDE7D0",
    backgroundColor: "#FFFFFF",
    shadowColor: "#0F5E3B",
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerText: { flex: 1, alignItems: "flex-start" },
  title: { color: DIET_V2_DARK },
  subtitle: { color: DIET_V2_MUTED },
  successDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  successCheck: { color: DIET_V2_GREEN },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
  },
  closeLabel: { color: DIET_V2_MUTED, lineHeight: 20 },
  nameSection: { gap: 5, alignItems: "stretch" },
  fieldLabel: { width: "100%", color: DIET_V2_MUTED },
  nameInput: {
    width: "100%",
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FAFBFA",
    color: DIET_V2_DARK,
    fontFamily: "Assistant-SemiBold",
    fontSize: 15,
    writingDirection: "rtl",
  },
  brand: { color: DIET_V2_MUTED },
  servingRow: { flexDirection: "row", gap: 10, alignItems: "stretch" },
  servingDescription: {
    flex: 1,
    padding: 11,
    gap: 3,
    borderRadius: 12,
    backgroundColor: "#F5F8F6",
    alignItems: "flex-start",
  },
  servingText: { color: DIET_V2_DARK },
  servingCountField: { width: 92, gap: 5, alignItems: "flex-start" },
  servingInput: {
    width: "100%",
    height: 43,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    color: DIET_V2_DARK,
    fontFamily: "Assistant-Bold",
    fontSize: 17,
    writingDirection: "ltr",
  },
  macrosSection: { gap: 7 },
  sectionTitle: { color: DIET_V2_DARK, alignSelf: "flex-start" },
  macrosRow: { flexDirection: "row", gap: 7 },
  macroField: { flex: 1, gap: 4, alignItems: "center" },
  macroInput: {
    width: "100%",
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    color: DIET_V2_DARK,
    fontFamily: "Assistant-SemiBold",
    fontSize: 14,
    textAlign: "center",
    writingDirection: "ltr",
  },
  preview: { padding: 10, borderRadius: 11, backgroundColor: DIET_V2_MINT },
  previewText: { color: DIET_V2_GREEN, textAlign: "center", writingDirection: "rtl" },
  inputError: { borderColor: "#DC2626", borderWidth: 1.5, backgroundColor: "#FFF7F7" },
  errorSummary: {
    width: "100%",
    paddingHorizontal: 11,
    paddingVertical: 9,
    gap: 3,
    borderRadius: 10,
    backgroundColor: "#FFF1F2",
  },
  error: { width: "100%", color: "#B42318" },
  errorDetailRow: { width: "100%", flexDirection: "row", alignItems: "flex-start", gap: 6 },
  errorDot: { width: 5, height: 5, marginTop: 7, borderRadius: 3, backgroundColor: "#DC2626" },
  errorDetail: { flex: 1, color: "#B42318" },
});

export default FoodCatalogResultCard;
