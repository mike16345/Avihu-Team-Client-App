import { useState, type ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import type { SmartFoodEntry } from "./foodCatalog";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import type { DietPlanV2CompletionMap } from "./dietPlanV2Consumption";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK } from "./dietV2Icons";
import DietPlanV2Highlights from "./DietPlanV2Highlights";
import DietPlanV2MealsList from "./DietPlanV2MealsList";
import DietPlanV2SmartMenu from "./DietPlanV2SmartMenu";

interface DietPlanV2TabsProps {
  plan: IDietPlanV2;
  completion: DietPlanV2CompletionMap;
  disabled?: boolean;
  onToggleRow: (mealIndex: number, rowKey: string) => void;
  onToggleMeal: (mealIndex: number) => void;
  smartFoodEntries: SmartFoodEntry[];
  smartFoodsReady: boolean;
  onRecordSmartFood: (entry: SmartFoodEntry) => void;
  onUpdateSmartFood: (entry: SmartFoodEntry) => void;
  onRemoveSmartFood: (entryId: string) => void;
}

interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
}

const DietPlanV2Tabs = ({
  plan,
  completion,
  disabled,
  onToggleRow,
  onToggleMeal,
  smartFoodEntries,
  smartFoodsReady,
  onRecordSmartFood,
  onUpdateSmartFood,
  onRemoveSmartFood,
}: DietPlanV2TabsProps) => {
  const { spacing } = useStyles();

  const [selectedTab, setSelectedTab] = useState("הארוחות שלי");

  const tabs: TabItem[] = [
    {
      label: "הארוחות שלי",
      value: "הארוחות שלי",
      content: (
        <DietPlanV2MealsList
          meals={plan.meals}
          completion={completion}
          disabled={disabled}
          onToggleRow={onToggleRow}
          onToggleMeal={onToggleMeal}
        />
      ),
    },
    {
      label: "תפריט חכם",
      value: "תפריט חכם",
      content: (
        <DietPlanV2SmartMenu
          plan={plan}
          entries={smartFoodEntries}
          isReady={smartFoodsReady}
          onRecord={onRecordSmartFood}
          onUpdate={onUpdateSmartFood}
          onRemove={onRemoveSmartFood}
        />
      ),
    },
    {
      label: "דגשים",
      value: "דגשים",
      content: <DietPlanV2Highlights highlights={plan.highlights} />,
    },
  ];
  const activeTab = tabs.find(({ value }) => value === selectedTab) ?? tabs[0];

  return (
    <View style={[styles.content]}>
      <View style={[spacing.pdHorizontalMd]}>
        <View style={[styles.tabBar]}>
          {tabs.map((tab) => {
            const active = tab.value === selectedTab;
            return (
              <Pressable
                key={tab.value}
                onPress={() => {
                  selectionHaptic();
                  setSelectedTab(tab.value);
                }}
                style={[styles.tab, active && styles.tabActive]}
              >
                <Text
                  fontVariant={active ? "semibold" : "medium"}
                  fontSize={13}
                  style={active ? styles.labelActive : styles.labelIdle}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Animated.View key={selectedTab} entering={FadeIn.duration(220)}>
        {activeTab.content}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 12,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#EFF1F5",
    borderRadius: 14,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: DIET_V2_CARD_BORDER,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D6DBE0",
    shadowColor: "#0B2A22",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  labelIdle: {
    color: "#6B7280",
  },
  labelActive: {
    color: DIET_V2_DARK,
  },
});

export default DietPlanV2Tabs;
