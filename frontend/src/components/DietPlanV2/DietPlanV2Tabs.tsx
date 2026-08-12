import { useState } from "react";
import { View } from "react-native";
import { Tabs, TabsList } from "@/components/ui/Tabs";
import type { TabItem } from "@/hooks/useTabs";
import { useTabs } from "@/hooks/useTabs";
import type { IDietPlanV2 } from "@/interfaces/IDietPlanV2";
import useStyles from "@/styles/useGlobalStyles";
import DietPlanV2Highlights from "./DietPlanV2Highlights";
import DietPlanV2MealsList from "./DietPlanV2MealsList";

interface DietPlanV2TabsProps {
  plan: IDietPlanV2;
}

const DietPlanV2Tabs = ({ plan }: DietPlanV2TabsProps) => {
  const { spacing } = useStyles();
  const [selectedTab, setSelectedTab] = useState("הארוחות שלי");

  const tabs: TabItem[] = [
    {
      label: "דגשים",
      value: "דגשים",
      content: <DietPlanV2Highlights highlights={plan.highlights} />,
    },
    {
      label: "הארוחות שלי",
      value: "הארוחות שלי",
      content: <DietPlanV2MealsList meals={plan.meals} />,
    },
    // Smart Menu stays disabled until barcode/manual logging has a real Server contract.
    // { label: "תפריט חכם", value: "תפריט חכם", content: <DietPlanV2SmartMenu /> },
  ];

  const { tabTriggers, tabContent } = useTabs(tabs);

  return (
    <Tabs
      horizontalPadding={spacing.pdHorizontalMd.paddingHorizontal}
      value={selectedTab}
      onValueChange={setSelectedTab}
    >
      <View style={spacing.gap20}>
        <View style={spacing.pdHorizontalMd}>
          <TabsList>{tabTriggers}</TabsList>
        </View>
        {tabContent}
      </View>
    </Tabs>
  );
};

export default DietPlanV2Tabs;
