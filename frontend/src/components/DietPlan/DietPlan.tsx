import { View, ImageBackground, ScrollView, Text,  } from "react-native";
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

export default function DietPlan() {
  const { handleScroll } = useHideTabBarOnScroll();
  const currentUser = useUserStore((state) => state.currentUser);
  const { getDietPlanByUserId } = useDietPlanApi();
  const {layout, spacing, colors,common,text}=useStyles()
  const {theme}=useThemeContext()

  const [dietPlan, setDietPlan] = useState<IDietPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [selectedFoodGroup, setSelectedFoodGroup] = useState<string | null>(null);
  const scrollRef = useRef(null);

  const displayMenuItems = (foodGroup: string) => {
    setIsModalOpen(true);
    setIsFabOpen(false);
    setSelectedFoodGroup(foodGroup);
  };

  console.log(colors.background);
  

  useEffect(() => {
    if (!currentUser) return;

    getDietPlanByUserId(currentUser?._id)
      .then((res) => setDietPlan(res))
      .catch((err) => console.log(err));
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
        {backgroundColor:DarkTheme.colors.background}
      ]}
    >
      <ImageBackground source={logoBlack} className="w-screen h-[30vh]" />

      {dietPlan?.meals.map((meal, i) => (
        <View key={i} style={[
          layout.flexRowReverse,
          layout.itemsCenter,
          spacing.pdDefault,
          spacing.mgSm,
          colors.backgroundSecondaryContainer,
          common.rounded
        ]}
        >
          <View style={[
            layout.itemsCenter,
            spacing.pdXs,
            spacing.gapSm,
            common.borderLeftSm,
            colors.borderSecondary,
            {paddingLeft:10}
          ]} 
          >
            <NativeIcon
              library="MaterialCommunityIcons"
              name="food-outline"
              color={theme.colors.secondary}
              size={20}
            />
            <Text style={[
              text.textBold,
              colors.textOnBackground
            ]}>ארוחה {i + 1}</Text>
          </View>
          <MealContainer meal={meal} />
        </View>
      ))}

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

