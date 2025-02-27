import { View } from "react-native";
import React from "react";
import { Text } from "../ui/Text";
import BottomDrawer from "../ui/BottomDrawer";
import useStyles from "@/styles/useGlobalStyles";
import useExerciseMethodQuery from "@/hooks/queries/useExerciseMethodQuery";
import NativeIcon from "../Icon/NativeIcon";
import Loader from "../ui/loaders/Loader";
import ErrorScreen from "@/screens/ErrorScreen";

interface ExerciseMethodDrawerProps {
  open: boolean;
  close: () => void;
  exerciseMethodBName: string | null;
}

const ExerciseMethodDrawer: React.FC<ExerciseMethodDrawerProps> = ({
  close,
  open,
  exerciseMethodBName,
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const { data, isError, isLoading } = useExerciseMethodQuery(exerciseMethodBName);

  if (isLoading && open) return <Loader />;
  if (isError) return <ErrorScreen />;

  return (
    <BottomDrawer
      onClose={close}
      open={open}
      heightVariant="auto"
      children={
        <View style={[layout.itemsEnd, spacing.gapDefault, spacing.pdDefault, spacing.pdBottomBar]}>
          <Text
            style={[
              text.textRight,
              fonts.xxl,
              text.textBold,
              colors.textPrimary,
              spacing.pdDefault,
            ]}
          >
            שיטת אימון
          </Text>
          <View
            style={[
              common.rounded,
              colors.backgroundPrimary,
              spacing.pdDefault,
              layout.widthFull,
              layout.flexRowReverse,
              layout.itemsCenter,
              spacing.gapDefault,
              layout.justifyStart,
            ]}
          >
            <View style={[spacing.gapSm]}>
              <View style={[layout.flexRowReverse, layout.widthFull, layout.justifyBetween]}>
                <Text style={[colors.textOnBackground, text.textRight, text.textBold]}>
                  {data?.data.title}
                </Text>
                <NativeIcon
                  size={24}
                  style={[colors.textOnBackground]}
                  library="MaterialCommunityIcons"
                  name="dumbbell"
                />
              </View>
              <Text style={[colors.textOnBackground, text.textRight]}>
                {data?.data.description}
              </Text>
            </View>
          </View>
        </View>
      }
    />
  );
};

export default ExerciseMethodDrawer;
