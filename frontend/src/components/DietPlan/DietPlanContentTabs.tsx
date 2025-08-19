import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { useMemo, useState } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MealsList from "./MealsList";
import FoodGroupTabs from "./FoodGroupTabs";
import Supplements from "./Supplements";

const tabs = [
  {
    label: "הארוחות שלי",
    value: <MealsList />,
    forceMount: true,
  },
  { label: "מידע תזונתי", value: <FoodGroupTabs />, forceMount: true },
  { label: "תוספים", value: <Supplements />, forceMount: true },
];

const DietPlanContentTabs = () => {
  const { spacing } = useStyles();
  const [selectedTab, setSelectedTab] = useState(tabs[0].label);

  const onTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const { list: tabList, content: tabContent } = useMemo(() => {
    const list = tabs.map((tab) => (
      <TabsTrigger key={tab.label} label={tab.label} value={tab.label} />
    ));

    const content = tabs.map((tab) => (
      <TabsContent key={tab.label} value={tab.label} forceMount={tab.forceMount}>
        {tab.value}
      </TabsContent>
    ));

    return { list, content };
  }, [tabs]);

  return (
    <View>
      <Tabs value={selectedTab} onValueChange={onTabChange}>
        <View style={[spacing.gap20]}>
          <TabsList>{tabList}</TabsList>
          {tabContent}
        </View>
      </Tabs>
    </View>
  );
};

export default DietPlanContentTabs;
