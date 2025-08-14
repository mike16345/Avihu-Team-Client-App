import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/Tabs";
import { ReactNode, useMemo, useState } from "react";
import useMenuItemsQuery from "@/hooks/queries/MenuItems/useMenuItemsQuery";
import { ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { foodGroupToName, formatServingText } from "@/utils/utils";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";

const FoodGroupTabs = () => {
  const { layout, spacing } = useStyles();
  const { data, isLoading } = useMenuItemsQuery();

  const { tabNames, tabTriggers, tabContent } = useMemo(() => {
    if (!data) return {};
    const tabTriggers: ReactNode[] = [];
    const tabContent: ReactNode[] = [];
    const tabNames: string[] = [];

    Object.keys(data).forEach((foodGroup) => {
      const foodGroupTranslated = foodGroupToName(foodGroup);

      tabNames.push(foodGroupTranslated);
      tabTriggers.push(<TabsTrigger label={foodGroupTranslated} value={foodGroupTranslated} />);
      tabContent.push(
        <TabsContent value={foodGroupTranslated} forceMount>
          <Card variant="gray" style={[{ paddingBottom: BOTTOM_BAR_HEIGHT + 80 }]}>
            <ScrollView contentContainerStyle={[spacing.gapDefault]}>
              {data[foodGroup].map((item) => {
                return <Text>{formatServingText(item.name, item.oneServing)}</Text>;
              })}
            </ScrollView>
          </Card>
        </TabsContent>
      );
    });

    return {
      tabNames,
      tabTriggers,
      tabContent,
    };
  }, [data]);

  const [selectedTab, setSelectedTab] = useState<string>(tabNames ? tabNames[0] : "");

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  console.log("selected tab ", selectedTab);

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
