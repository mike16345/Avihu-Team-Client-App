import { Animated, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { useDropwDownContext } from "@/context/useDropdown";
import { ConditionalRender } from "../ui/ConditionalRender";
import { Text } from "../ui/Text";
import { useFadeIn } from "@/styles/useFadeIn";
import ProgressionSummary from "./ProgressionSummary";
import { IRecordedSetRes } from "@/interfaces/Workout";

const ANIMATION_DURATION = 1200;

const GraphsContainer = () => {
  const { layout, spacing } = useStyles();
  const { items, selectedValue } = useDropwDownContext();
  const opacity = useFadeIn(ANIMATION_DURATION);

  const recordedSets: IRecordedSetRes[] = Array.isArray(selectedValue) ? selectedValue : [];

  return (
    <Animated.View
      style={[
        { flex: 1, opacity: opacity },
        spacing.gap14,
        spacing.pdHorizontalMd,
        spacing.pdBottomBar,
      ]}
    >
      <ConditionalRender condition={items.length === 0}>
        <View style={[layout.center]}>
          <Text>לא הוקלטו סטים</Text>
        </View>
      </ConditionalRender>

      <ConditionalRender condition={items.length !== 0}>
        <ProgressionSummary recordedSets={recordedSets} />
      </ConditionalRender>
    </Animated.View>
  );
};

export default GraphsContainer;
