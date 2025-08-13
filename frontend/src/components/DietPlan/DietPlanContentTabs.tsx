import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { useState } from "react";
import { Text } from "../ui/Text";

const tabs = [
  { label: "הארוחות שלי", value: <Text>Breakfast Content</Text> },
  { label: "מידע תזונתי", value: <Text>Dinner Content</Text> },
  { label: "תוספים", value: <Text>Snacks Content</Text> },
];

const DietPlanContentTabs = () => {
  // TODO: Replace tabs with actual data fetching logic
  const [selectedTab, setSelectedTab] = useState(tabs[0].label);

  const onTabChange = (value: string) => {
    setSelectedTab(value);
  };

  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.label} label={tab.label} value={tab.label} />
        ))}
      </TabsList>

      {tabs.map((tab) => {
        return (
          <TabsContent key={tab.label} value={tab.label}>
            {tab.value}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default DietPlanContentTabs;
