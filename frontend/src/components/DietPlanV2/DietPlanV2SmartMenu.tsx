import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import PrimaryButton from "@/components/ui/buttons/PrimaryButton";
import { useFoodCatalogApi } from "@/hooks/api/useFoodCatalogApi";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import FoodCatalogResultCard from "./FoodCatalogResultCard";
import FoodCatalogScannerModal from "./FoodCatalogScannerModal";
import { createSmartFoodEntryDraft, sumSmartFoodMacros, type SmartFoodEntry } from "./foodCatalog";
import {
  BarcodeIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
  SparkleIcon,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

interface DietPlanV2SmartMenuProps {
  entries: SmartFoodEntry[];
  isReady: boolean;
  onRecord: (entry: SmartFoodEntry) => void;
  onUpdate: (entry: SmartFoodEntry) => void;
  onRemove: (entryId: string) => void;
}

const DietPlanV2SmartMenu = ({
  entries,
  isReady,
  onRecord,
  onUpdate,
  onRemove,
}: DietPlanV2SmartMenuProps) => {
  const { spacing } = useStyles();
  const { reportConsumption } = useFoodCatalogApi();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [product, setProduct] = useState<FoodCatalogProduct | null>(null);
  const [editingEntry, setEditingEntry] = useState<SmartFoodEntry | null>(null);
  const totals = useMemo(() => sumSmartFoodMacros(entries), [entries]);
  const editingDraft = useMemo(
    () => (editingEntry ? createSmartFoodEntryDraft(editingEntry) : null),
    [editingEntry]
  );

  const record = (entry: SmartFoodEntry) => {
    onRecord(entry);
    setProduct(null);
    void reportConsumption(entry.catalogItemId).catch((error) => {
      console.warn("Failed to report Food Catalog consumption", error);
    });
  };

  const confirmRemove = (entry: SmartFoodEntry) => {
    selectionHaptic();
    Alert.alert("הסרת מוצר", `להסיר את \"${entry.name}\" מהרישומים של היום?`, [
      { text: "ביטול", style: "cancel" },
      {
        text: "הסר",
        style: "destructive",
        onPress: () => {
          onRemove(entry.id);
          if (editingEntry?.id === entry.id) setEditingEntry(null);
        },
      },
    ]);
  };

  return (
    <View style={[spacing.pdHorizontalMd, styles.content]}>
      <View style={styles.addCard}>
        <View style={styles.cardHeader}>
          <View style={styles.headerCopy}>
            <Text fontVariant="bold" fontSize={17} style={styles.title}>
              הוספה חכמה
            </Text>
            <Text fontSize={13} style={styles.description}>
              סרוק מוצר וקבל את הערכים התזונתיים אוטומטית
            </Text>
          </View>
          <View style={styles.iconCircle}>
            <SparkleIcon size={21} color={DIET_V2_GREEN} />
          </View>
        </View>

        <PrimaryButton
          block
          onPress={() => {
            selectionHaptic();
            setEditingEntry(null);
            setScannerOpen(true);
          }}
        >
          <View style={styles.scanButtonContent}>
            <BarcodeIcon size={19} color="#FFFFFF" />
            <Text fontVariant="bold" fontSize={16} style={styles.scanButtonLabel}>
              סרוק ברקוד
            </Text>
          </View>
        </PrimaryButton>
      </View>

      {product ? (
        <FoodCatalogResultCard
          product={product}
          disabled={!isReady}
          onDismiss={() => setProduct(null)}
          onSubmit={record}
        />
      ) : null}

      {editingEntry && editingDraft ? (
        <FoodCatalogResultCard
          initialDraft={editingDraft}
          entryIdentity={editingEntry}
          title="עריכת מוצר"
          subtitle="אפשר לעדכן את המנה והערכים שנרשמו"
          submitLabel="שמור שינויים"
          disabled={!isReady}
          onDismiss={() => setEditingEntry(null)}
          onSubmit={(entry) => {
            onUpdate(entry);
            setEditingEntry(null);
          }}
        />
      ) : null}

      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <View style={styles.todayTitleWrap}>
            <Text fontVariant="bold" fontSize={16} style={styles.title}>
              נרשם היום
            </Text>
            {entries.length > 0 ? (
              <Text fontSize={12} style={styles.description}>
                {`${formatDietPlanV2Number(totals.calories)} קק"ל · ${formatDietPlanV2Number(totals.protein)} חלבון · ${formatDietPlanV2Number(totals.carbs)} פחמימה · ${formatDietPlanV2Number(totals.fat)} שומן`}
              </Text>
            ) : null}
          </View>
          {entries.length > 0 ? (
            <View style={styles.countBadge}>
              <Text fontVariant="bold" fontSize={12} style={styles.countLabel}>
                {entries.length}
              </Text>
            </View>
          ) : null}
        </View>

        {!isReady ? (
          <Text fontSize={13} style={styles.emptyText}>
            טוען את הרישומים של היום...
          </Text>
        ) : null}

        {isReady && entries.length === 0 ? (
          <View style={styles.emptyState}>
            <BarcodeIcon size={27} color="#9AA5A0" />
            <Text fontSize={13} style={styles.emptyText}>
              מוצרים שתסרוק ותאשר יופיעו כאן ויתווספו להתקדמות היומית.
            </Text>
          </View>
        ) : null}

        {entries.map((entry, index) => (
          <Animated.View
            key={entry.id}
            entering={FadeInDown.delay(Math.min(index * 35, 140)).duration(220)}
            exiting={FadeOut.duration(160)}
            layout={LinearTransition.duration(180)}
            style={styles.entryRow}
          >
            <Pressable onPress={() => confirmRemove(entry)} hitSlop={8} style={styles.removeButton}>
              <Text fontVariant="bold" fontSize={16} style={styles.removeLabel}>
                ×
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                selectionHaptic();
                setProduct(null);
                setEditingEntry(entry);
              }}
              style={styles.entryCopy}
            >
              <Text fontVariant="semibold" fontSize={14} style={styles.entryName}>
                {entry.name}
              </Text>
              <Text fontSize={11} style={styles.entryMeta}>
                {`${formatDietPlanV2Number(entry.servingCount)} × ${entry.servingDescription} · ${formatDietPlanV2Number(entry.macros.calories)} קק"ל`}
              </Text>
              <Text fontVariant="medium" fontSize={11} style={styles.editLabel}>
                הקש לעריכה
              </Text>
            </Pressable>
            <View style={styles.entryDot} />
          </Animated.View>
        ))}
      </View>

      <FoodCatalogScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onProduct={(nextProduct) => {
          setEditingEntry(null);
          setProduct(nextProduct);
          setScannerOpen(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  content: { gap: 14, paddingBottom: 18 },
  addCard: {
    padding: 16,
    gap: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  headerCopy: { flex: 1, gap: 3, alignItems: "flex-start" },
  title: { color: DIET_V2_DARK, textAlign: "right" },
  description: { color: DIET_V2_MUTED, textAlign: "right" },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  scanButtonContent: { flexDirection: "row", alignItems: "center", gap: 9 },
  scanButtonLabel: { color: "#FFFFFF" },
  todayCard: {
    padding: 16,
    gap: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  todayHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  todayTitleWrap: { flex: 1, gap: 2, alignItems: "flex-start" },
  countBadge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  countLabel: { color: DIET_V2_GREEN, fontVariant: ["tabular-nums"] },
  emptyState: { alignItems: "center", gap: 7, paddingHorizontal: 14, paddingVertical: 12 },
  emptyText: { color: DIET_V2_MUTED, textAlign: "center" },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#EEF1EF",
  },
  entryCopy: { flex: 1, alignItems: "flex-start" },
  entryName: { color: DIET_V2_DARK, textAlign: "right" },
  entryMeta: { color: DIET_V2_MUTED, textAlign: "right", writingDirection: "rtl" },
  editLabel: { color: DIET_V2_GREEN, textAlign: "right", paddingTop: 2 },
  entryDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: DIET_V2_GREEN },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6F5",
  },
  removeLabel: { color: DIET_V2_MUTED, lineHeight: 18 },
});

export default DietPlanV2SmartMenu;
