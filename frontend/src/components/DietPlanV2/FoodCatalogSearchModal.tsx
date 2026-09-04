import { semanticColors } from "@/themes/semanticColors";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Text } from "@/components/ui/Text";
import useFoodCatalogSearchQuery from "@/hooks/queries/useFoodCatalogSearchQuery";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import useStyles from "@/styles/useGlobalStyles";
import {
  BarcodeIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
  FlameIcon,
  SearchIcon,
} from "./dietV2Icons";
import FoodCatalogSearchRow from "./FoodCatalogSearchRow";
import {
  getFoodCatalogSearchPresentation,
  normalizeFoodCatalogSearchQuery,
  shouldRequestFoodCatalogSearch,
} from "./foodCatalogSearch";

interface FoodCatalogSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (product: FoodCatalogProduct) => void;
  onScan: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

const FoodCatalogSearchModal = ({
  visible,
  onClose,
  onSelect,
  onScan,
}: FoodCatalogSearchModalProps) => {
  const insets = useSafeAreaInsets();
  const { layout } = useStyles();
  const searchInputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (!visible) return;
    const normalizedQuery = normalizeFoodCatalogSearchQuery(query);
    if (normalizedQuery === debouncedQuery) return;

    const timer = setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [debouncedQuery, query, visible]);

  useEffect(() => {
    if (visible) return;
    searchInputRef.current?.clear();
    setQuery("");
    setDebouncedQuery("");
  }, [visible]);

  const normalizedQuery = normalizeFoodCatalogSearchQuery(query);
  const queryIsValid = shouldRequestFoodCatalogSearch(normalizedQuery);
  const queryIsSettling = normalizedQuery !== debouncedQuery;
  const search = useFoodCatalogSearchQuery(
    debouncedQuery,
    visible && queryIsValid && !queryIsSettling
  );

  const products = search.data?.products ?? [];
  const presentation = getFoodCatalogSearchPresentation({
    inputQuery: query,
    requestedQuery: debouncedQuery,
    productCount: products.length,
    isLoading: search.isLoading,
    isFetching: search.isFetching,
    isError: search.isError,
  });

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const select = (product: FoodCatalogProduct) => {
    Keyboard.dismiss();
    onSelect(product);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={close}
      onShow={() => searchInputRef.current?.focus()}
    >
      <View
        style={[
          layout.flex1,
          styles.container,
          { paddingTop: Math.max(insets.top, 12), paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={[layout.flexRow, layout.itemsCenter, styles.headerBar]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="סגור חיפוש"
            onPress={close}
            hitSlop={8}
            style={styles.closeButton}
          >
            <Text fontVariant="bold" fontSize={20} style={styles.closeLabel}>
              ×
            </Text>
          </Pressable>
          <View style={styles.headerTitleWrap}>
            <Text fontVariant="bold" fontSize={17} style={styles.headerTitle}>
              חיפוש מוצר
            </Text>
            <Text fontSize={11} style={styles.headerSubtitle}>
              מוצרים שנסרקו ונשמרו במאגר
            </Text>
          </View>
        </View>

        <View style={[layout.flexRow, layout.itemsCenter, styles.searchWrap]}>
          <View style={styles.searchIcon}>
            <SearchIcon size={17} color={DIET_V2_MUTED} />
          </View>
          <TextInput
            ref={searchInputRef}
            defaultValue=""
            onChangeText={setQuery}
            placeholder="חפש מוצר או מותג..."
            placeholderTextColor={DIET_V2_MUTED}
            returnKeyType="search"
            autoCorrect={false}
            spellCheck={false}
            style={[layout.flex1, styles.searchInput]}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[layout.flexRow, layout.itemsCenter, styles.sectionHeader]}>
            {!presentation.hasQuery ? <FlameIcon size={17} color={DIET_V2_GREEN} /> : null}
            {presentation.showRefreshing ? (
              <ActivityIndicator size="small" color={DIET_V2_GREEN} />
            ) : null}
            <Text fontVariant="bold" fontSize={15} style={styles.sectionTitle}>
              {presentation.hasQuery ? "תוצאות חיפוש" : "מוצרים פופולריים"}
            </Text>
          </View>

          {presentation.showTooShort ? (
            <Animated.View entering={FadeIn.duration(150)} style={styles.messageCard}>
              <Text fontSize={13} style={styles.messageText}>
                הקלד לפחות שני תווים כדי לחפש.
              </Text>
            </Animated.View>
          ) : null}

          {presentation.showLoading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color={DIET_V2_GREEN} />
              <Text fontSize={12} style={styles.messageText}>
                מחפש במאגר...
              </Text>
            </View>
          ) : null}

          {presentation.showError ? (
            <Animated.View entering={FadeIn.duration(150)} style={styles.messageCard}>
              <Text fontVariant="semibold" fontSize={13} style={styles.errorText}>
                לא הצלחנו לחפש כרגע. בדוק את החיבור ונסה שוב.
              </Text>
              <Pressable onPress={() => void search.refetch()} style={styles.retryButton}>
                <Text fontVariant="semibold" fontSize={12} style={styles.retryLabel}>
                  נסה שוב
                </Text>
              </Pressable>
            </Animated.View>
          ) : null}

          {presentation.showEmpty ? (
            <Animated.View entering={FadeIn.duration(170)} style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <BarcodeIcon size={27} color={DIET_V2_GREEN} />
              </View>
              <Text fontVariant="bold" fontSize={15} style={styles.emptyTitle}>
                המוצר עדיין לא במאגר
              </Text>
              <Text fontSize={12} style={styles.emptyDescription}>
                אפשר לסרוק את הברקוד, להוסיף אותו עכשיו ולמצוא אותו בקלות בפעם הבאה.
              </Text>
              <Pressable
                onPress={() => {
                  Keyboard.dismiss();
                  onScan();
                }}
                style={styles.scanButton}
              >
                <View style={[layout.flexRow, layout.itemsCenter, styles.scanButtonContent]}>
                  <BarcodeIcon size={16} color={semanticColors.app.surfaceRaised} />
                  <Text fontVariant="semibold" fontSize={13} style={styles.scanButtonLabel}>
                    סריקת ברקוד
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          ) : null}

          {presentation.showProducts ? (
            <View style={styles.resultsWrap}>
              {products.map((product, index) => (
                <FoodCatalogSearchRow
                  key={product.id}
                  product={product}
                  index={index}
                  onSelect={select}
                />
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: semanticColors.surfaceSubtle },
  headerBar: {
    minHeight: 58,
    paddingHorizontal: 16,
    gap: 10,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
    alignItems: "center",
    justifyContent: "center",
  },
  closeLabel: { color: DIET_V2_DARK, lineHeight: 22 },
  headerTitleWrap: { flex: 1, alignItems: "flex-start", gap: 1 },
  headerTitle: { color: DIET_V2_DARK },
  headerSubtitle: { color: DIET_V2_MUTED },
  searchWrap: {
    height: 48,
    marginHorizontal: 16,
    marginTop: 6,
    paddingHorizontal: 12,
    gap: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  searchIcon: { width: 20, alignItems: "center" },
  searchInput: {
    minWidth: 0,
    height: "100%",
    paddingVertical: 0,
    color: DIET_V2_DARK,
    fontFamily: "Assistant-Regular",
    fontSize: 14,
    writingDirection: "rtl",
  },
  clearButton: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  clearLabel: { color: DIET_V2_MUTED, lineHeight: 20 },
  scrollContent: { padding: 16, paddingBottom: 28, gap: 11 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  sectionTitle: { color: DIET_V2_DARK },
  resultsWrap: { gap: 8 },
  loadingWrap: { alignItems: "center", gap: 9, paddingVertical: 36 },
  messageCard: {
    alignItems: "center",
    gap: 12,
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  messageText: { color: DIET_V2_MUTED, textAlign: "center" },
  errorText: { color: semanticColors.diet.dangerText, textAlign: "center" },
  retryButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: DIET_V2_MINT,
  },
  retryLabel: { color: DIET_V2_GREEN },
  emptyCard: {
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 22,
    paddingVertical: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  emptyIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  emptyTitle: { color: DIET_V2_DARK },
  emptyDescription: { color: DIET_V2_MUTED, textAlign: "center", lineHeight: 19 },
  scanButton: {
    minHeight: 40,
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: DIET_V2_GREEN,
  },
  scanButtonContent: { gap: 7 },
  scanButtonLabel: { color: semanticColors.app.surfaceRaised },
});

export default FoodCatalogSearchModal;
