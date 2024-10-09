import { View, ImageBackground, ScrollView, Text, Animated } from "react-native";
import { useState } from "react";
import logoBlack from "../../../assets/avihu/avihu-logo-black.png";
import { useDietPlanApi } from "@/hooks/useDietPlanApi";
import { useUserStore } from "@/store/userStore";
import MealContainer from "./MealContainer";
import NativeIcon from "../Icon/NativeIcon";
import FABGroup from "../ui/FABGroup";
import MenuItemModal from "./MenuItemModal";
import useStyles from "@/styles/useGlobalStyles";
import { DarkTheme } from "@/themes/useAppTheme";
import { Portal } from "react-native-paper";
import DietPlanSkeleton from "../ui/loaders/skeletons/DietPlanSkeleton";
import useSlideInAnimations from "@/styles/useSlideInAnimations";
import ExtraInfoContainer from "./ExtraInfoContainer";
import Divider from "../ui/Divider";
import { useQuery } from "@tanstack/react-query";
import { DIET_PLAN_KEY, ONE_DAY } from "@/constants/reactQuery";
import ErrorScreen from "@/screens/ErrorScreen";

export default function DietPlan() {
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const { layout, spacing, colors, common, text } = useStyles();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string | null>(null);
  const {
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  } = useSlideInAnimations();

  const slideAnimations = [
    slideInRightDelay0,
    slideInRightDelay100,
    slideInRightDelay200,
    slideInRightDelay300,
    slideInRightDelay400,
    slideInBottomDelay500,
    slideInBottomDelay600,
  ];

  const { data, isError, error, isLoading } = useQuery({
    queryFn: () => getDietPlanByUserId(currentUser?._id || ``),
    queryKey: [DIET_PLAN_KEY + currentUser?._id],
    enabled: !!currentUser,
    staleTime: ONE_DAY,
  });

  const displayMenuItems = (foodGroup: string) => {
    setIsModalOpen(true);
    setIsFabOpen(false);
    setSelectedFoodGroup(foodGroup);
  };

  if (isError) return <ErrorScreen error={error} />;

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
            <View style={{ direction: `rtl` }}>
              <ExtraInfoContainer
                customInstructions={data?.customInstructions}
                freeCalories={data?.freeCalories}
              />
            </View>
            {data?.meals.map((meal, i) => (
              <Animated.View
                key={meal._id}
                style={[
                  layout.flexRowReverse,
                  layout.itemsCenter,
                  spacing.pdDefault,
                  colors.backgroundSecondaryContainer,
                  common.rounded,
                  slideAnimations[i + 1],
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
                <Divider orientation="vertical" color="white" thickness={0.8} />
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
