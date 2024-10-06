import { View, ImageBackground, ScrollView, Text, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import logoBlack from "../../../assets/avihu/avihu-logo-black.png";
import { useDietPlanApi } from "@/hooks/api/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import { IDietPlan } from "@/interfaces/DietPlan";
import MealContainer from "./MealContainer";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import useStyles from "@/styles/useGlobalStyles";
import { DarkTheme } from "@/themes/useAppTheme";
import { Portal } from "react-native-paper";
import DietPlanSkeleton from "../ui/loaders/skeletons/DietPlanSkeleton";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import Tips from "./Tips";
import AmountContainer from "./AmountContainer";

export default function DietPlan() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const { layout, spacing, colors, common, text } = useStyles();

  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);
  const [isLoading, setisLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string | null>(null);
  const {
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
  } = useSlideInAnimations();

  const slideAnimations = [
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
  ];

  const displayMenuItems = (foodGroup: string) => {
    setIsModalOpen(true);
    setIsFabOpen(false);
    setSelectedFoodGroup(foodGroup);
  };

  useEffect(() => {
    if (!currentUser) return;
    setisLoading(true);
    getDietPlanByUserId(currentUser._id)
      .then((res) => setDietPlan(res))
      .catch((err) => console.log(err))
      .finally(() => setisLoading(false));
  }, []);

  return (
    <Portal.Host>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          layout.flexGrow,
          colors.backgroundSecondary,
          spacing.pdBottomBar,
          { backgroundColor: DarkTheme.colors.background },
        ]}
      >
        <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />

        {isLoading ? (
          <DietPlanSkeleton />
        ) : (
          <View style={[spacing.pdDefault, spacing.gapLg]}>
            <Animated.View
              style={[
                layout.flexRowReverse,
                layout.justifyBetween,
                spacing.gapLg,
                { flexWrap: `wrap` },
                slideInRightDelay0,
              ]}
            >
              {dietPlan?.customInstructions && <Tips tips={dietPlan.customInstructions} />}

              {Boolean(dietPlan?.freeCalories) && (
                <AmountContainer title="קלוריות חופשיות" amount={dietPlan?.freeCalories} />
              )}

              <AmountContainer title="כמות שומנים ליום" variant="gr" amount={250} />
            </Animated.View>
            {dietPlan?.meals.map((meal, i) => (
              <Animated.View
                key={meal._id}
                style={[
                  layout.flexRowReverse,
                  layout.itemsCenter,
                  spacing.pdDefault,
                  colors.backgroundSecondaryContainer,
                  common.rounded,
                  slideAnimations[i],
                ]}
              >
                <View
                  style={[layout.itemsCenter, spacing.pdXs, spacing.gapSm, { paddingLeft: 10 }]}
                >
                  <NativeIcon
                    library="MaterialCommunityIcons"
                    name="food-outline"
                    color={colors.backgroundSecondary.backgroundColor}
                    size={20}
                  />
                  <Text style={[text.textBold, colors.textOnBackground]}>ארוחה {i + 1}</Text>
                </View>
                <MealContainer meal={meal} />
              </Animated.View>
            ))}
          </View>
        )}

        <MenuItemModal
          foodGroup={selectedFoodGroup}
          isOpen={isModalOpen}
          dismiss={() => setIsModalOpen(false)}
        />

        <FABGroup
          open={isFabOpen}
          visible
          variant="primary"
          icon={isFabOpen ? `close` : `food-outline`}
          onStateChange={({ open }) => setIsFabOpen(open)}
          actions={[
            {
              icon: "fish",
              label: "חלבונים",
              onPress: () => displayMenuItems(`protein`),
            },
            {
              icon: "baguette",
              label: "פחמימות",
              onPress: () => displayMenuItems(`carbs`),
            },
            {
              icon: "cheese",
              label: "שומנים",
              onPress: () => displayMenuItems(`fats`),
            },
            {
              icon: `leaf`,
              label: `ירקות`,
              onPress: () => displayMenuItems(`vegetables`),
            },
          ]}
        />
      </ScrollView>
    </Portal.Host>
  );
}
