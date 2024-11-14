import { Pressable, Text, View } from "react-native";
import { FC } from "react";
import useStyles from "@/styles/useGlobalStyles";

interface SetContainerProps {
  currentSetNumber: number;
  totalSets: number;
  handleViewSet: (setNumber: number) => void;
}

const SetContainer: FC<SetContainerProps> = ({ currentSetNumber, totalSets, handleViewSet }) => {
  const { colors, common, layout, text } = useStyles();

  return (
    <View>
      <View style={[layout.itemsCenter, layout.flexRowReverse]}>
        {Array.from({ length: totalSets }).map((_, index) => (
          <View key={index} style={{ flexDirection: "row-reverse", alignItems: "center" }}>
            <Pressable
              onPress={() => handleViewSet(index + 1)}
              style={[
                layout.center,
                common.rounded,
                {
                  width: 24,
                  height: 24,
                  zIndex: 1,
                },
                index < currentSetNumber
                  ? [colors.backgroundPrimary, colors.borderOnSecondary, common.borderSm]
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
            </Pressable>

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
