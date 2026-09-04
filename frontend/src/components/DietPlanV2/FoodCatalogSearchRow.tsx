import { semanticColors } from "@/themes/semanticColors";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeInDown, LinearTransition } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import type { FoodCatalogProduct } from "@/interfaces/IFoodCatalog";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import {
  BarcodeIcon,
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_GREEN,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "./dietV2Icons";
import { formatDietPlanV2Number } from "./dietPlanV2Utils";

interface FoodCatalogSearchRowProps {
  product: FoodCatalogProduct;
  index: number;
  onSelect: (product: FoodCatalogProduct) => void;
}

const buildProductMeta = (product: FoodCatalogProduct): string => {
  const nutrition = product.nutrition.perServing;
  const parts: string[] = [];
  if (nutrition.calories !== null) {
    parts.push(`${formatDietPlanV2Number(nutrition.calories)} קק"ל`);
  }
  if (nutrition.protein !== null) {
    parts.push(`${formatDietPlanV2Number(nutrition.protein)} חלבון`);
  }
  if (nutrition.carbohydrates !== null) {
    parts.push(`${formatDietPlanV2Number(nutrition.carbohydrates)} פחמימה`);
  }
  if (nutrition.fat !== null) {
    parts.push(`${formatDietPlanV2Number(nutrition.fat)} שומן`);
  }
  return parts.join(" · ");
};

const FoodCatalogSearchRow = ({ product, index, onSelect }: FoodCatalogSearchRowProps) => {
  const { layout } = useStyles();
  const meta = useMemo(() => buildProductMeta(product), [product]);
  const serving = product.serving?.description ?? product.package.description;

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index * 35, 175)).duration(220)}
      layout={LinearTransition.duration(160)}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`בחר ${product.displayName ?? "מוצר"}`}
        onPress={() => {
          selectionHaptic();
          onSelect(product);
        }}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <View style={[layout.widthFull, layout.flexRow, layout.itemsCenter, styles.rowContent]}>
          <View style={styles.productIcon}>
            <BarcodeIcon size={21} color={DIET_V2_GREEN} />
          </View>
          <View style={[layout.flex1, layout.itemsStart, styles.copy]}>
            <Text fontVariant="bold" fontSize={14} style={styles.name} numberOfLines={2}>
              {product.displayName ?? "מוצר ללא שם"}
            </Text>
            {product.brand ? (
              <Text fontSize={11} style={styles.brand} numberOfLines={1}>
                {product.brand}
              </Text>
            ) : null}
            {meta ? (
              <Text fontSize={11} style={styles.meta} numberOfLines={2}>
                {meta}
              </Text>
            ) : null}
            {serving ? (
              <Text fontSize={10} style={styles.serving} numberOfLines={1}>
                {serving}
              </Text>
            ) : null}
          </View>
          <View style={styles.addButton}>
            <Text fontVariant="bold" fontSize={20} style={styles.addButtonLabel}>
              +
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    borderRadius: 15,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: semanticColors.app.surfaceRaised,
  },
  rowContent: {
    minHeight: 88,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 11,
  },
  rowPressed: { backgroundColor: semanticColors.pressed, transform: [{ scale: 0.99 }] },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
  addButtonLabel: { color: DIET_V2_GREEN, lineHeight: 23 },
  copy: {},
  name: { color: DIET_V2_DARK },
  brand: { color: DIET_V2_GREEN, paddingTop: 1 },
  meta: { color: DIET_V2_MUTED, paddingTop: 2 },
  serving: { color: DIET_V2_MUTED, paddingTop: 2, opacity: 0.8 },
  productIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: DIET_V2_MINT,
  },
});

export default FoodCatalogSearchRow;
