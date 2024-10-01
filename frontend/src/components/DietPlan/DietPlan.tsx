import { View, ImageBackground, ScrollView, Text, Animated } from "react-native";
import { useEffect, useRef, useState } from "react";
import logoBlack from "../../../assets/images/avihu-logo-black.png";
import useHideTabBarOnScroll from "@/hooks/useHideTabBarOnScroll";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import { IDietPlan } from "@/interfaces/DietPlan";
import MealContainer from "./MealContainer";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import useStyles from "@/styles/useGlobalStyles";
import { DarkTheme, useThemeContext } from "@/themes/useAppTheme";
import { Portal } from "react-native-paper";
import Loader from "../ui/loaders/Loader";
import DietPlanSkeleton from "../ui/loaders/skeletons/DietPlanSkeleton";
import useSlideFadeIn from "@/styles/useSlideFadeIn";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import TipsAndCaloriesContainer from "./TipsAndCaloriesContainer";

export default function DietPlan() {
  const { handleScroll } = useHideTabBarOnScroll();
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const { layout, spacing, colors, common, text } = useStyles();
  const { theme } = useThemeContext();

  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);
  const [isLoading, setisLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string | null>(null);
  const scrollRef = useRef(null);
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
      .then((res) => {
        console.log(res);
        setDietPlan(res);
      })
      .catch((err) => console.log(err))
      .finally(() => setisLoading(false));
  }, []);

  return (
    <Portal.Host>
      <ScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        style={[
          layout.flex1,
          colors.backgroundSecondary,
          spacing.pdBottomBar,
          spacing.pdStatusBar,
          { backgroundColor: DarkTheme.colors.background },
        ]}
      >
        <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />

        {isLoading ? (
          <DietPlanSkeleton />
        ) : (
          <View>
            <TipsAndCaloriesContainer />
            {dietPlan?.meals.map((meal, i) => (
              <Animated.View
                key={i}
                style={[
                  layout.flexRowReverse,
                  layout.itemsCenter,
                  spacing.pdDefault,
                  spacing.mgSm,
                  colors.backgroundSecondaryContainer,
                  common.rounded,
                  slideAnimations[i],
                ]}
              >
                <View
                  style={[
                    layout.itemsCenter,
                    spacing.pdXs,
                    spacing.gapSm,
                    common.borderLeftSm,
                    colors.borderSecondary,
                    { paddingLeft: 10 },
                  ]}
                >
                  <NativeIcon
                    library="MaterialCommunityIcons"
                    name="food-outline"
                    color={theme.colors.secondary}
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
