import { Text, View } from "react-native";
import { FC } from "react";
import { ISet } from "@/interfaces/Workout";
import useStyles from "@/styles/useGlobalStyles";

interface SetContainerProps {
  currentSetNumber: number;
  totalSets: number;
}

const SetContainer: FC<SetContainerProps> = ({ currentSetNumber, totalSets }) => {
  const { colors, common, layout, text } = useStyles();

  return (
    <View>
      <View style={[layout.itemsCenter, layout.flexRowReverse]}>
        {Array.from({ length: totalSets }).map((_, index) => (
          <View key={index} style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <View
              style={[
                layout.center,
                common.rounded,
                {
                  width: 24,
                  height: 24,
                  zIndex: 1,
                },
                index < currentSetNumber
                  ? [colors.backgroundPrimary, colors.borderSuccess, common.borderXsm]
                  : [colors.backgroundSurface, colors.borderOnSurface, common.borderXsm],
              ]}
            >
              <Text
                style={[
                  text.textCenter,
                  index < currentSetNumber ? colors.textOnSuccess : colors.textOnPrimaryContainer,
                ]}
              >
                {index + 1}
              </Text>
            </View>

            {/* Connecting Bar between circles */}
            {index < totalSets - 1 && (
              <View
                style={{
                  width: 30, // Adjust the width for the connection bar length
                  height: 4,
                  backgroundColor:
                    index < currentSetNumber - 1
                      ? colors.backgroundSuccess.backgroundColor // Completed bar color
                      : colors.backgroundSurface.backgroundColor, // Incomplete bar color
                }}
              />
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

export default SetContainer;
