import { RefreshControl, ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import DailyCalorieIntakeStyle1 from "./DailyCalorieIntakeStyle1";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";

const DietPlanScreenHeader = () => {
  const { layout, spacing } = useStyles();
  const { isRefetching, refetch } = useDietPlanQuery();

  return (
    <ScrollView
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
      contentContainerStyle={spacing.pdHorizontalMd}
      style={{ flexGrow: 0 }}
    >
      <View style={[layout.widthFull]}>
        <DailyCalorieIntakeStyle1 />
      </View>
    </ScrollView>
  );
};

export default DietPlanScreenHeader;
