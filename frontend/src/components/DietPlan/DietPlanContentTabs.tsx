import { Tabs, TabsList } from "../ui/Tabs";
import { useState } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MealsList from "./MealsList";
import FoodGroupTabs from "./FoodGroupTabs";
import Supplements from "./Supplements";
import { TabItem, useTabs } from "@/hooks/useTabs";

const tabs: TabItem[] = [
  {
    label: "הארוחות שלי",
    value: "הארוחות שלי",
    content: <MealsList />,
    forceMount: true,
  },
  { label: "מידע תזונתי", value: "מידע תזונתי", content: <FoodGroupTabs />, forceMount: true },
  { label: "תוספים", value: "תוספים", content: <Supplements />, forceMount: true },
];

const DietPlanContentTabs = () => {
  const { spacing } = useStyles();
  const [selectedTab, setSelectedTab] = useState(tabs[0].label);

  const onTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const { tabTriggers, tabContent } = useTabs(tabs);

  return (
    <View style={[spacing.pdHorizontalMd, { flex: 1 }]}>
      <Tabs value={selectedTab} onValueChange={onTabChange}>
        <View style={[spacing.gap20]}>
          <TabsList>{tabTriggers}</TabsList>
          {tabContent}
        </View>
      </Tabs>
    </View>
  );
};

export default DietPlanContentTabs;
