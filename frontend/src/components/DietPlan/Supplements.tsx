import { Text } from "../ui/Text";
import { ScrollView, useWindowDimensions, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "../ui/Card";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";
import { ConditionalRender } from "../ui/ConditionalRender";

const Supplements = () => {
  const { layout, spacing } = useStyles();
  const { height } = useWindowDimensions();
  const { data } = useDietPlanQuery();
  const supplements = data?.supplements || [];

  return (
    <Card style={{ maxHeight: height / 1.8 - (BOTTOM_BAR_HEIGHT + 20) }} variant="gray">
      <ScrollView contentContainerStyle={[spacing.gapDefault]}>
        <ConditionalRender condition={!data?.supplements?.length}>
          <View style={[layout.center]}>
            <Text>אין תוספים</Text>
          </View>
        </ConditionalRender>
        {supplements.map((item, i) => {
          return (
            <Text key={item + i} style={[layout.alignSelfStart]} fontVariant="semibold">
              {item}
            </Text>
          );
        })}
      </ScrollView>
    </Card>
  );
};

export default Supplements;
