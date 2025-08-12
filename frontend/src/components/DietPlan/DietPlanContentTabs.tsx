import { View, Text } from "react-native";
import Tabs from "../ui/Tabs";

const tabs = [
  { label: "Breakfast", value: <Text>Breakfast Content</Text> },
  { label: "Lunch", value: <Text>Lunch Content</Text> },
  { label: "Dinner", value: <Text>Dinner Content</Text> },
  { label: "Snacks", value: <Text>Snacks Content</Text> },
];

const DietPlanContentTabs = () => {
  return (
    <View>
      <Tabs items={tabs} />
    </View>
  );
};

export default DietPlanContentTabs;
