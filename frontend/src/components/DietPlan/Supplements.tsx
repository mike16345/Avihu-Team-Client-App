import { Text } from "../ui/Text";
import { ScrollView, useWindowDimensions } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { Card } from "../ui/Card";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import { BOTTOM_BAR_HEIGHT } from "@/constants/Constants";

const Supplements = () => {
  const { spacing } = useStyles();
  const { height } = useWindowDimensions();
  const { data } = useDietPlanQuery();
  const supplements = data?.supplements || [];

  return (
    <Card style={{ maxHeight: height / 1.8 - (BOTTOM_BAR_HEIGHT + 20) }} variant="gray">
      <ScrollView contentContainerStyle={[spacing.gapDefault]}>
        {supplements.map((item, i) => {
          return (
            <Text key={item + i} fontVariant="semibold">
              {item}
            </Text>
          );
        })}
      </ScrollView>
    </Card>
  );
};

export default Supplements;
