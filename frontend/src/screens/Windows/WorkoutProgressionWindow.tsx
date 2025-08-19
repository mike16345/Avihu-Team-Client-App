import Icon from "@/components/Icon/Icon";
import Collapsible from "@/components/ui/Collapsible";
import Graph from "@/components/ui/graph/Graph";
import { Text } from "@/components/ui/Text";
import WorkoutProgressionHeader from "@/components/WorkoutProgression/WorkoutProgressionHeader";
import { DropDownContextProvider } from "@/context/useDropdown";
import useStyles from "@/styles/useGlobalStyles";
import { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";

const WorkoutProgressionWindow = () => {
  const { layout, colors, common, fonts, spacing, text } = useStyles();

  const [showRepsGraph, setShowRepsGraph] = useState(true);
  const [showWeightGraph, setShowWeightGraph] = useState(false);

  const handleCollapseChange = (open: boolean) => {
    setShowRepsGraph(!open);
    setShowWeightGraph(open);
  };

  return (
    <View style={[spacing.gapDefault, layout.flex1, spacing.pdMd]}>
      <DropDownContextProvider
        items={Array.from({ length: 20 }).map((_, i) => {
          return { label: i, value: i };
        })}
        onSelect={() => {}}
      >
        <View style={{ zIndex: 10 }}>
          <WorkoutProgressionHeader />
        </View>
      </DropDownContextProvider>

      <ScrollView contentContainerStyle={spacing.gapDefault}>
        <Collapsible
          isCollapsed={showRepsGraph}
          onCollapseChange={() => handleCollapseChange(showRepsGraph)}
          trigger={
            <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
              <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                <Icon name="clock" />
                <Text>חזרות</Text>
              </View>

              <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                <Text>60.00%</Text>
                <Icon name="growthIndicator" />
              </View>
            </View>
          }
        >
          <Graph
            data={[12, 320, 3, 67, 3, 456, 4]}
            labels={["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]}
          />
        </Collapsible>
        <Collapsible
          isCollapsed={showWeightGraph}
          onCollapseChange={(val) => handleCollapseChange(val)}
          trigger={
            <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
              <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                <Icon name="upload" />
                <Text>משקל</Text>
              </View>

              <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
                <Text>60.00%</Text>
                <Icon name="growthIndicator" />
              </View>
            </View>
          }
        >
          <Graph
            data={[12, 320, 3, 67, 3, 456, 4]}
            labels={["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]}
          />
        </Collapsible>
      </ScrollView>
    </View>
  );
};

export default WorkoutProgressionWindow;
