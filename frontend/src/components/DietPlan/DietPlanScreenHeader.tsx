import { RefreshControl, ScrollView, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import SecondaryButton from "../ui/buttons/SecondaryButton";
import DailyCalorieIntake from "./DailyCalorieIntake";
import { Text } from "../ui/Text";
import TipsModal from "../ui/modals/TipsModal";
import { useState } from "react";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";

const DietPlanScreenHeader = () => {
  const { layout, spacing } = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const { data, isRefetching, refetch } = useDietPlanQuery();
  const tips = data?.customInstructions || [];

  return (
    <>
      <ScrollView
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />}
        contentContainerStyle={spacing.pdHorizontalMd}
        style={{ flexGrow: 0 }}
      >
        <View style={[layout.flexRow, spacing.gapLg, layout.itemsCenter]}>
          <View style={[layout.flexRow, layout.widthFull, { flex: 2 }]}>
            <DailyCalorieIntake />
          </View>
          <View style={[layout.flexRow, layout.justifyEnd, { flex: 1 }]}>
            <SecondaryButton onPress={() => setIsOpen(true)} rightIcon="info">
              <Text fontVariant="semibold">דגשים</Text>
            </SecondaryButton>
          </View>
        </View>
      </ScrollView>
      <TipsModal
        title={"דגשים"}
        useHtmlRenderer
        visible={isOpen}
        onDismiss={() => setIsOpen(false)}
        tips={tips}
      />
    </>
  );
};

export default DietPlanScreenHeader;
