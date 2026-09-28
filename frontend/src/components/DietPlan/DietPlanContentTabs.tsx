import { Tabs, TabsList } from "../ui/Tabs";
import { useMemo, useState } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MealsList from "./MealsList";
import FoodGroupTabs from "./FoodGroupTabs";
import HighlightsTab from "./HighlightsTab";
import { TabItem, useTabs } from "@/hooks/useTabs";
import useDietPlanV1Query from "@/hooks/queries/useDietPlanV1Query";

const tabs: TabItem[] = [
  { label: "דגשים", value: "דגשים", content: <HighlightsTab />, forceMount: true },
  {
    label: "הארוחות שלי",
    value: "הארוחות שלי",
    content: <MealsList />,
    forceMount: true,
  },
  { label: "מידע תזונתי", value: "מידע תזונתי", content: <FoodGroupTabs />, forceMount: true },
];

const DietPlanContentTabs = () => {
  const { data } = useDietPlanV1Query();
  const { spacing } = useStyles();
  const filteredTabs = useMemo(() => {
    if (!data) return [];
    return tabs;
  }, [data]);

  const [selectedTab, setSelectedTab] = useState("הארוחות שלי");

  const onTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const { tabTriggers, tabContent } = useTabs(filteredTabs);

  return (
    <View>
      <Tabs
        horizontalPadding={spacing.pdHorizontalMd.paddingHorizontal}
        value={selectedTab}
        onValueChange={onTabChange}
      >
        <View style={[spacing.gap20]}>
          <View style={spacing.pdHorizontalMd}>
            <TabsList>{tabTriggers}</TabsList>
          </View>
          {tabContent}
        </View>
      </Tabs>
    </View>
  );
};

export default DietPlanContentTabs;
