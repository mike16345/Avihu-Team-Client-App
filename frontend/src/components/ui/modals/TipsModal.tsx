import { ScrollView, View } from "react-native";
import React from "react";
import { CustomModal, CustomModalProps } from "./Modal";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import { Text } from "../Text";

interface TipsModalProps extends CustomModalProps {
  tips: string[];
  noDataMessage?: string;
}

const TipsModal: React.FC<TipsModalProps> = ({
  tips,
  noDataMessage = "אין דגשים להצגה",
  ...props
}) => {
  const { colors, common, layout, spacing } = useStyles();

  return (
    <CustomModal {...props}>
      <CustomModal.Header>דגשים לאימון</CustomModal.Header>
      <CustomModal.Content>
        <ConditionalRender condition={tips.length == 0}>
          <View style={[layout.flex1, layout.center]}>
            <Text>{noDataMessage}</Text>
          </View>
        </ConditionalRender>

        <ConditionalRender condition={tips.length !== 0}>
          <ScrollView contentContainerStyle={[spacing.gapLg, spacing.pdVerticalLg]}>
            {tips.map((tip, i) => (
              <View key={i} style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
                <View
                  style={[colors.backgroundPrimary, common.roundedFull, { height: 5, width: 5 }]}
                ></View>
                <Text>{tip}</Text>
              </View>
            ))}
          </ScrollView>
        </ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

export default TipsModal;
