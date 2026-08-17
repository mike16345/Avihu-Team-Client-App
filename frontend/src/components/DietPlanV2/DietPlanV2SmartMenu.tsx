import { useMemo, useState } from "react";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import { useFoodCatalogApi } from "@/hooks/api/useFoodCatalogApi";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { DietPlanV2CompletionMap } from "./dietPlanV2Consumption";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import FoodCatalogResultCard from "./FoodCatalogResultCard";
import FoodCatalogSearchModal from "./FoodCatalogSearchModal";
import FoodCatalogScannerModal from "./FoodCatalogScannerModal";
import SmartFoodDeleteModal from "./SmartFoodDeleteModal";
import SmartFoodHistoryModal from "./SmartFoodHistoryModal";
import { createSmartFoodEntryDraft, sumSmartFoodMacros, type SmartFoodEntry } from "./foodCatalog";
import {
  BarcodeIcon,
  ClockIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
  SearchIcon,
  SparkleIcon,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

const OPEN_FOOD_FACTS_URL = "https://world.openfoodfacts.org";

interface DietPlanV2SmartMenuProps {
  plan: IDietPlanV2;
  completion: DietPlanV2CompletionMap;
  entries: SmartFoodEntry[];
  isReady: boolean;
  onRecord: (entry: SmartFoodEntry) => void;
  onUpdate: (entry: SmartFoodEntry) => void;
  onRemove: (entryId: string) => void;
}

const DietPlanV2SmartMenu = ({
  plan,
  completion,
  entries,
  isReady,
  onRecord,
  onUpdate,
  onRemove,
}: DietPlanV2SmartMenuProps) => {
  const { spacing } = useStyles();
  const { reportConsumption } = useFoodCatalogApi();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [product, setProduct] = useState<FoodCatalogProduct | null>(null);
  const [editingEntry, setEditingEntry] = useState<SmartFoodEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<SmartFoodEntry | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
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

  const requestRemove = (entry: SmartFoodEntry) => {
    selectionHaptic();
    setDeleteEntry(entry);
  };

  return (
    <View style={[spacing.pdHorizontalMd, styles.content]}>
      <View style={styles.addCard}>
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <SparkleIcon size={21} color={DIET_V2_GREEN} />
          </View>
          <View style={styles.headerCopy}>
            <Text fontVariant="bold" fontSize={17} style={styles.title}>
              הוספה חכמה
            </Text>
            <Text fontSize={13} style={styles.description}>
              סרוק מוצר וקבל את הערכים התזונתיים אוטומטית
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="חיפוש מוצר במאגר"
          onPress={() => {
            selectionHaptic();
            setSearchOpen(true);
          }}
          style={({ pressed }) => [styles.searchWrap, pressed && styles.searchWrapPressed]}
        >
          <View style={styles.searchIcon}>
            <SearchIcon size={17} color={DIET_V2_MUTED} />
          </View>
          <View>
            <Text fontSize={13} style={styles.searchPlaceholder}>
              חפש מוצר שנסרק בעבר...
            </Text>
          </View>
        </Pressable>

        <View style={styles.quickActions}>
          <Pressable
            style={styles.quickAction}
            onPress={() => {
              selectionHaptic();
              setEditingEntry(null);
              setScannerOpen(true);
            }}
          >
            <BarcodeIcon size={17} color={DIET_V2_GREEN} />
            <Text fontVariant="semibold" fontSize={12} style={styles.quickActionLabel}>
              סרוק ברקוד
            </Text>
          </Pressable>
          <Pressable
            style={styles.quickAction}
            onPress={() => {
              selectionHaptic();
              setHistoryOpen(true);
            }}
          >
            <ClockIcon size={17} color={DIET_V2_GREEN} />
            <Text fontVariant="semibold" fontSize={12} style={styles.quickActionLabel}>
              היסטוריה
            </Text>
          </Pressable>
        </View>
        <Text fontSize={11} style={styles.searchHint}>
          לא מצאת את המוצר? סרוק אותו כדי להוסיף אותו לרישומים.
        </Text>
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
            <Pressable onPress={() => requestRemove(entry)} hitSlop={8} style={styles.removeButton}>
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

      <Pressable
        accessibilityRole="link"
        accessibilityLabel="פתיחת אתר Open Food Facts, מקור נתוני המוצרים"
        onPress={() => {
          selectionHaptic();
          void Linking.openURL(OPEN_FOOD_FACTS_URL).catch((error) => {
            console.warn("Failed to open Open Food Facts website", error);
          });
        }}
        style={({ pressed }) => [styles.attribution, pressed && styles.attributionPressed]}
      >
        <View style={styles.attributionDot} />
        <Text fontSize={10} style={styles.attributionText}>
          מקור נתוני המוצרים: Open Food Facts
        </Text>
      </Pressable>

      <FoodCatalogScannerModal
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onProduct={(nextProduct) => {
          setEditingEntry(null);
          setProduct(nextProduct);
          setScannerOpen(false);
        }}
      />
      <FoodCatalogSearchModal
        visible={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={(nextProduct) => {
          setEditingEntry(null);
          setProduct(nextProduct);
          setSearchOpen(false);
        }}
        onScan={() => {
          setSearchOpen(false);
          setTimeout(() => {
            setEditingEntry(null);
            setScannerOpen(true);
          }, 220);
        }}
      />
      <SmartFoodHistoryModal
        visible={historyOpen}
        plan={plan}
        currentEntries={entries}
        currentCompletion={completion}
        onClose={() => setHistoryOpen(false)}
      />
      <SmartFoodDeleteModal
        entry={deleteEntry}
        onDismiss={() => setDeleteEntry(null)}
        onConfirm={(entry) => {
          onRemove(entry.id);
          if (editingEntry?.id === entry.id) setEditingEntry(null);
          setDeleteEntry(null);
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
  title: { color: DIET_V2_DARK },
  description: { color: DIET_V2_MUTED },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  searchWrap: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#F8FAF9",
  },
  searchIcon: { width: 22, alignItems: "center" },
  searchWrapPressed: { backgroundColor: "#F0F8F4", borderColor: "#BFDCCB" },
  searchPlaceholder: { width: "100%", color: DIET_V2_MUTED },
  quickActions: { flexDirection: "row", gap: 8 },
  quickAction: {
    flex: 1,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingHorizontal: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  quickActionLabel: { color: DIET_V2_DARK, textAlign: "center" },
  searchHint: { width: "100%", color: DIET_V2_MUTED },
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
  entryName: { color: DIET_V2_DARK },
  entryMeta: { color: DIET_V2_MUTED },
  editLabel: { color: DIET_V2_GREEN, paddingTop: 2 },
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
  attribution: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 28,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  attributionPressed: { backgroundColor: "#EEF4F1" },
  attributionDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#A8B3AE",
  },
  attributionText: { color: "#7F8B85" },
});

export default DietPlanV2SmartMenu;
