import { StyleSheet } from "react-native";
import {
  DIET_V2_CARD_BORDER,
  DIET_V2_DARK,
  DIET_V2_MINT,
  DIET_V2_MUTED,
} from "../dietV2Icons";

export const smartMenuStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    padding: 16,
    shadowColor: "#0F5E3B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitleDark: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  cardTitleCenter: {
    color: DIET_V2_DARK,
    textAlign: "center",
  },
  cardSubtitle: {
    color: DIET_V2_MUTED,
    textAlign: "right",
  },
  foodChip: {
    width: 190,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
    backgroundColor: "#FFFFFF",
  },
  foodChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DIET_V2_MINT,
    alignItems: "center",
    justifyContent: "center",
  },
  foodChipDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#0F5E3B",
  },
  foodChipTextWrap: {
    flex: 1,
  },
  foodChipTitle: {
    color: DIET_V2_DARK,
    textAlign: "right",
  },
  foodChipSubtitle: {
    color: DIET_V2_MUTED,
    marginTop: 2,
    textAlign: "right",
  },
});
