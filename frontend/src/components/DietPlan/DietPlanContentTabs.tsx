import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { useMemo, useState } from "react";
import { Text } from "../ui/Text";
import { View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import MealsList from "./MealsList";
import { IMeal } from "@/interfaces/DietPlan";
import FoodGroupTabs from "./FoodGroupTabs";

const dietPlan = {
  _id: "6810ea7b4829230cb4bd680f",
  userId: "22222",
  meals: [
    {
      totalProtein: {
        quantity: 1.5,
        customItems: [],
        extraItems: [
          "2 ביצים + 1 לבן",
          "גביע קוטג 1 אחוז+ביצה",
          "משקה חלבון יטבתה (הזירו)+ יוגורט גו",
          "1 וחצי סקופ אבקת חלבון",
          "200 גרם גבינה לבנה 3 אחוז + ביצה",
          "4 פרוסות גבנצ 9 אחוז",
          "2 מעדני גו חלבון",
          "חטיף חלבון",
          "קוטג 3 אחוז",
        ],
        _id: "6810ea7b4829230cb4bd6811",
      },
      totalCarbs: {
        quantity: 2,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd6812",
      },
      _id: "6810ea7b4829230cb4bd6810",
    },
    {
      totalProtein: {
        quantity: 2,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd6814",
      },
      totalCarbs: {
        quantity: 2,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd6815",
      },
      _id: "6810ea7b4829230cb4bd6813",
    },
    {
      totalProtein: {
        quantity: 1,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd6817",
      },
      totalCarbs: {
        quantity: 2,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd6818",
      },
      _id: "6810ea7b4829230cb4bd6816",
    },
    {
      totalProtein: {
        quantity: 1.5,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd681a",
      },
      totalCarbs: {
        quantity: 0,
        customItems: [],
        extraItems: [],
        _id: "6810ea7b4829230cb4bd681b",
      },
      _id: "6810ea7b4829230cb4bd6819",
    },
  ],
  customInstructions: ["כמה שיותר להתייעץ איתי בפרטי!"],
  freeCalories: 250,
  veggiesPerDay: 5,
};

const Component1 = () => {
  console.log("Mounted 1!");

  return <Text>Component 1</Text>;
};
const Component2 = () => {
  console.log("Mounted 2!");

  return <Text>Component 2</Text>;
};

const tabs = [
  {
    label: "הארוחות שלי",
    value: <MealsList meals={dietPlan.meals as IMeal[]} />,
    forceMount: true,
  },
  { label: "מידע תזונתי", value: <FoodGroupTabs />, forceMount: true },
  { label: "תוספים", value: <Component2 />, forceMount: true },
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
