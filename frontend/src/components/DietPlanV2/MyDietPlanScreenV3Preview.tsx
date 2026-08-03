import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Text } from "@/components/ui/Text";
import CustomScrollView from "@/components/ui/scrollview/CustomScrollView";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import useStyles from "@/styles/useGlobalStyles";
import { selectionHaptic } from "@/utils/haptics";
import { DIET_V2_CARD_BORDER, DIET_V2_DARK } from "./dietV2Icons";
import { DietV2Meal, DietV2OptionMacros, DietV2Plan } from "@/interfaces/DietPlanV2";
import { computeMealTotalsFromCategories } from "./dietPlanV2ClientUtils";
import { DIET_V2_MOCK_PLAN, DIET_V2_MOCK_TIPS } from "./dietV2MockPlan";
import { ConsumedFoodEntry, sumConsumedMacros } from "./mockFoodCatalog";
import DailyCalorieIntakeV3 from "./DailyCalorieIntakeV3";
import CollapsibleMealV3 from "./CollapsibleMealV3";
import SmartMenuTabV2 from "./SmartMenuTabV2";
import { MealTile, buildMealTiles } from "./smartMenu/mealTiles";

const computePlanTotals = (plan: DietV2Plan): DietV2OptionMacros => {
  const totals = plan.meals.reduce(
    (acc, meal) => {
      const t = computeMealTotalsFromCategories(meal.categories);
      return {
        protein: acc.protein + t.protein,
        carbs: acc.carbs + t.carbs,
        fat: acc.fat + t.fat,
        calories: acc.calories + t.calories,
      };
    },
    { protein: 0, carbs: 0, fat: 0, calories: 0 }
  );
  totals.calories = Math.round(totals.calories + (plan.freeCalories ?? 0));
  return totals;
};


const V3Header: React.FC<{
  targets: DietV2OptionMacros;
  consumed: DietV2OptionMacros;
}> = ({ targets, consumed }) => {
  const { layout, spacing } = useStyles();
  return (
    <ScrollView
      contentContainerStyle={[spacing.pdHorizontalMd, { paddingTop: 14, paddingBottom: 18 }]}
      style={{ flexGrow: 0 }}
    >
      <View style={[layout.widthFull]}>
        <DailyCalorieIntakeV3
          totalCalories={Math.round(targets.calories)}
          totalProtein={Math.round(targets.protein)}
          totalCarbs={Math.round(targets.carbs)}
          totalFat={Math.round(targets.fat)}
          consumedCalories={Math.round(consumed.calories)}
          consumedProtein={Math.round(consumed.protein)}
          consumedCarbs={Math.round(consumed.carbs)}
          consumedFat={Math.round(consumed.fat)}
        />
      </View>
    </ScrollView>
  );
};

const V3MealsList: React.FC<{ meals: DietV2Meal[] }> = ({ meals }) => {
  const { height } = useWindowDimensions();
  const { spacing, layout } = useStyles();
  return (
    <View style={[{ height: height * 0.5 }]}>
      <CustomScrollView
        style={{ flexGrow: 1 }}
        contentContainerStyle={[{ flexGrow: 1, gap: 10 }, spacing.pdHorizontalMd]}
      >
        <ConditionalRender condition={!meals.length}>
          <View style={[layout.center]}>
            <Text style={{ textAlign: "center" }}>אין תוכנית תזונה</Text>
          </View>
        </ConditionalRender>
        {meals.map((meal, i) => (
          <CollapsibleMealV3
            key={meal.id}
            meal={meal}
            index={i}
            freeCalories={i === 0 ? 150 : 0}
          />
        ))}
      </CustomScrollView>
    </View>
  );
};

const V3SmartMenu: React.FC<{
  consumed: ConsumedFoodEntry[];
  onConsumedChange: (next: ConsumedFoodEntry[]) => void;
  mealTiles: MealTile[];
}> = ({ consumed, onConsumedChange, mealTiles }) => {
  const { height } = useWindowDimensions();
  return (
    <View style={[{ height: height * 0.65 }]}>
      <SmartMenuTabV2
        consumed={consumed}
        onConsumedChange={onConsumedChange}
        mealTiles={mealTiles}
      />
    </View>
  );
};

const V3TipsList: React.FC<{ tips: string[] }> = ({ tips }) => {
  const { spacing, layout } = useStyles();
  const { height } = useWindowDimensions();

  if (!tips.length) {
    return (
      <View style={[spacing.pdHorizontalMd, layout.center, { paddingVertical: 40 }]}>
        <Text>אין דגשים</Text>
      </View>
    );
  }

  return (
    <View style={[{ height: height * 0.5 }]}>
      <CustomScrollView
        style={{ flexGrow: 1 }}
        contentContainerStyle={[{ flexGrow: 1 }, spacing.gapDefault, spacing.pdHorizontalMd]}
      >
        {tips.map((tip, i) => (
          <View
            key={i}
            style={[layout.flexRow, spacing.gapDefault, { paddingVertical: 6 }]}
          >
            <Text fontSize={15}>{tip}</Text>
          </View>
        ))}
      </CustomScrollView>
    </View>
  );
};

interface V3TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

const V3TabBar: React.FC<{
  tabs: V3TabItem[];
  selected: string;
  onSelect: (value: string) => void;
}> = ({ tabs, selected, onSelect }) => (
  <View style={tabBarStyles.container}>
    {tabs.map((tab) => {
      const active = tab.value === selected;
      return (
        <Pressable
          key={tab.value}
          onPress={() => {
            selectionHaptic();
            onSelect(tab.value);
          }}
          style={[tabBarStyles.tab, active && tabBarStyles.tabActive]}
        >
          <Text
            fontVariant={active ? "semibold" : "medium"}
            fontSize={13}
            style={active ? tabBarStyles.labelActive : tabBarStyles.labelIdle}
          >
            {tab.label}
          </Text>
        </Pressable>
      );
    })}
  </View>
);

const MyDietPlanScreenV3Preview = () => {
  const { spacing, layout, colors } = useStyles();
  const [consumed, setConsumed] = useState<ConsumedFoodEntry[]>([]);
  const [selectedTab, setSelectedTab] = useState("הארוחות שלי");

  const targets = useMemo(() => computePlanTotals(DIET_V2_MOCK_PLAN), []);
  const consumedTotals = useMemo(() => sumConsumedMacros(consumed), [consumed]);
  const mealTiles = useMemo(
    () => buildMealTiles(DIET_V2_MOCK_PLAN.meals.length),
    [],
  );

  const tabs: V3TabItem[] = useMemo(
    () => [
      {
        label: "דגשים",
        value: "דגשים",
        content: <V3TipsList tips={DIET_V2_MOCK_TIPS} />,
      },
      {
        label: "הארוחות שלי",
        value: "הארוחות שלי",
        content: <V3MealsList meals={DIET_V2_MOCK_PLAN.meals} />,
      },
      {
        label: "תפריט חכם",
        value: "תפריט חכם",
        content: (
          <V3SmartMenu
            consumed={consumed}
            onConsumedChange={setConsumed}
            mealTiles={mealTiles}
          />
        ),
      },
    ],
    [consumed, mealTiles]
  );

  const activeTab = tabs.find((tab) => tab.value === selectedTab) ?? tabs[0];

  return (
    <View style={[layout.flex1, colors.background]}>
      <View style={[spacing.pdBottomBar, layout.flex1, { gap: 12 }]}>
        <V3Header targets={targets} consumed={consumedTotals} />
        <View style={[layout.flex1]}>
          <View style={spacing.pdHorizontalMd}>
            <V3TabBar tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
          </View>
          <Animated.View
            key={selectedTab}
            entering={FadeIn.duration(220)}
            style={{ flex: 1, marginTop: 12 }}
          >
            {activeTab.content}
          </Animated.View>
        </View>
      </View>
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
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

export default MyDietPlanScreenV3Preview;
