import { Tabs, TabsList } from "../ui/Tabs";
import { useState } from "react";
import useMenuItemsQuery from "@/hooks/queries/MenuItems/useMenuItemsQuery";
import { ScrollView, useWindowDimensions, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import { foodGroupToName, formatServingText } from "@/utils/utils";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import { useTabsFromData } from "@/hooks/useTabsFromData";

const FoodGroupTabs = () => {
  const { height } = useWindowDimensions();
  const { layout, spacing } = useStyles();
  const { data, isLoading } = useMenuItemsQuery();

  const [selectedTab, setSelectedTab] = useState<string>("");

  const { tabTriggers, tabContent, tabNames } = useTabsFromData({
    data,
    getLabel: (foodGroup) => foodGroupToName(foodGroup),
    getContent: (_, items) => {
      return (
        <Card style={{ maxHeight: height / 2 - (BOTTOM_BAR_HEIGHT + 20) }} variant="gray">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[spacing.gapDefault]}
          >
            {items.map((item) => (
              <Text
                style={[layout.alignSelfStart]}
                fontSize={14}
                fontVariant="semibold"
                key={item._id}
              >
                {formatServingText(item.name, item.oneServing)}
              </Text>
            ))}
          </ScrollView>
        </Card>
      );
    },
    forceMount: true,
  });

  if (isLoading)
    return (
      <View style={[layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

  return (
    <Tabs
      horizontalPadding={spacing.pdHorizontalMd.paddingHorizontal}
      value={selectedTab || tabNames[0]}
      onValueChange={setSelectedTab}
    >
      <View style={[spacing.gap20, { paddingBottom: 100 }, spacing.pdHorizontalMd]}>
        <TabsList>{tabTriggers}</TabsList>
        {tabContent}
      </View>
    </Tabs>
  );
};

export default FoodGroupTabs;
