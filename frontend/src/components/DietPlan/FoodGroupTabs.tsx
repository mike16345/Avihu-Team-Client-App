import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { ReactNode, useMemo, useState } from "react";
import useMenuItemsQuery from "@/hooks/queries/MenuItems/useMenuItemsQuery";
import { ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { foodGroupToName, formatServingText } from "@/utils/utils";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";

const FoodGroupTabs = () => {
  const { layout, spacing } = useStyles();
  const { data, isLoading } = useMenuItemsQuery();

  const [selectedTab, setSelectedTab] = useState<string>("");

  const { tabTriggers, tabContent } = useMemo(() => {
    if (!data) return {};
    const tabTriggers: ReactNode[] = [];
    const tabContent: ReactNode[] = [];
    const tabNames: string[] = [];

    (Object.keys(data) as Array<keyof typeof data>).forEach((foodGroup) => {
      const foodGroupTranslated = foodGroupToName(foodGroup);

      tabNames.push(foodGroupTranslated);
      tabTriggers.push(
        <TabsTrigger
          key={foodGroupTranslated}
          label={foodGroupTranslated}
          value={foodGroupTranslated}
        />
      );
      tabContent.push(
        <TabsContent key={foodGroupTranslated} value={foodGroupTranslated} forceMount>
          <Card variant="gray">
            <ScrollView contentContainerStyle={[spacing.gapDefault]}>
              {data[foodGroup].map((item) => {
                return <Text key={item._id}>{formatServingText(item.name, item.oneServing)}</Text>;
              })}
            </ScrollView>
          </Card>
        </TabsContent>
      );
    });
    setSelectedTab(tabNames[0]);

    return {
      tabNames,
      tabTriggers,
      tabContent,
    };
  }, [data]);

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab}>
      <View style={[spacing.gap20]}>
        <TabsList>{tabTriggers}</TabsList>
        {tabContent}
      </View>
    </Tabs>
  );
};

export default FoodGroupTabs;
