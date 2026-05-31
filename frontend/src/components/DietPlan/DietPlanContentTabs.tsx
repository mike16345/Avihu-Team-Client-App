import { Tabs, TabsList } from "../ui/Tabs";
import { useMemo, useState } from "react";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MealsList from "./MealsList";
import FoodGroupTabs from "./FoodGroupTabs";
import { TabItem, useTabs } from "@/hooks/useTabs";
import Supplements from "./Supplements";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { isHtmlEmpty } from "@/utils/utils";

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
  const { data } = useDietPlanQuery();
  const { spacing } = useStyles();
  const filteredTabs = useMemo(() => {
    if (!data) return [];
    const hasSupplements = !isHtmlEmpty(data?.supplements?.join("") || "");

    return hasSupplements ? tabs : tabs.filter((tab) => tab.value !== "תוספים");
  }, [data]);

  const [selectedTab, setSelectedTab] = useState(tabs[0].label);

  const onTabChange = (value: string) => {
    setSelectedTab(value);
  };

  const { tabTriggers, tabContent } = useTabs(filteredTabs);

  return (
    <View style={[{ flex: 1 }]}>
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
