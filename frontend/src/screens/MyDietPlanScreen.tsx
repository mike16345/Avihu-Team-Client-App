import { useState } from "react";
import { Pressable, View } from "react-native";
import DietPlanContentTabs from "@/components/DietPlan/DietPlanContentTabs";
import DietPlanScreenHeader from "@/components/DietPlan/DietPlanScreenHeader";
import MyDietPlanScreenV2Preview from "@/components/DietPlanV2/MyDietPlanScreenV2Preview";
import MyDietPlanScreenV3Preview from "@/components/DietPlanV2/MyDietPlanScreenV3Preview";
import PlanPendingState from "@/components/ui/PlanPendingState";
import { Text } from "@/components/ui/Text";
import DietPlanSkeleton from "@/components/ui/loaders/skeletons/DietPlanSkeleton";
import useDietPlanQuery from "@/hooks/queries/useDietPlanQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import useStyles from "@/styles/useGlobalStyles";
import { useThemeContext } from "@/themes/useAppTheme";
import { isHtmlEmpty } from "@/utils/utils";

type PreviewMode = "v1" | "v2" | "v3";

const MyDietPlanScreen = () => {
  const { layout } = useStyles();
  const [mode, setMode] = useState<PreviewMode>("v1");

  const renderBody = () => {
    if (mode === "v1") return <V1Body />;
    if (mode === "v3") return <MyDietPlanScreenV3Preview />;
    return <MyDietPlanScreenV2Preview />;
  };

  return (
    <View style={[layout.flex1]}>
      <PreviewToggle mode={mode} onChange={setMode} />
      {renderBody()}
    </View>
  );
};

const PreviewToggle = ({
  mode,
  onChange,
}: {
  mode: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) => {
  const { spacing, layout, common } = useStyles();
  const { theme } = useThemeContext();

  const renderChip = (value: PreviewMode, label: string) => {
    const active = mode === value;
    return (
      <Pressable
        key={value}
        onPress={() => onChange(value)}
        style={[
          spacing.pdHorizontalDefault,
          spacing.pdVerticalXs,
          common.roundedFull,
          {
            backgroundColor: active ? theme.colors.primary : theme.colors.surfaceVariant,
          },
        ]}
      >
        <Text
          fontSize={12}
          fontVariant="bold"
          style={{ color: active ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={[
        layout.flexRow,
        layout.itemsCenter,
        layout.justifyCenter,
        spacing.gapDefault,
        spacing.pdVerticalSm,
        spacing.pdStatusBar,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text fontSize={11} style={{ color: theme.colors.onSurfaceVariant }}>
        תצוגה מקדימה
      </Text>
      {renderChip("v1", "סגנון 1")}
      {renderChip("v2", "סגנון 2")}
      {renderChip("v3", "סגנון 3")}
    </View>
  );
};

const V1Body = () => {
  const { spacing, layout } = useStyles();
  const { data, error, isError, isFetching, isLoading, refetch } = useDietPlanQuery();

  const hasMeals = (data?.meals?.length ?? 0) > 0;
  const hasSupplements = !isHtmlEmpty(data?.supplements?.join("") || "");
  const hasInstructions = !isHtmlEmpty(data?.customInstructions?.join("") || "");
  const hasDietPlanContent = hasMeals || hasSupplements || hasInstructions;

  if (error?.status === 404 || (!isLoading && !isError && !hasDietPlanContent)) {
    return (
      <PlanPendingState
        title="תפריט תזונה בבנייה"
        description="ברגע שהמאמן יסיים לבנות לך את התפריט הוא יופיע לך כאן."
        isFetching={isFetching}
        onRefresh={() => void refetch()}
      />
    );
  }

  if (isError) {
    return <ErrorScreen error={error} refetchFunc={() => void refetch()} isFetching={isFetching} />;
  }

  if (isLoading) return <DietPlanSkeleton />;

  return (
    <View style={[spacing.gap34, spacing.pdBottomBar, layout.flex1]}>
      <DietPlanScreenHeader />
      <DietPlanContentTabs />
    </View>
  );
};

export default MyDietPlanScreen;
