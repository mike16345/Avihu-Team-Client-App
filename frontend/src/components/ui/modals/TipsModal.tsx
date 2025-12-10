import { Platform, ScrollView, StyleSheet, View } from "react-native";
import React, { ReactNode, useMemo } from "react";
import { CustomModal, CustomModalProps } from "./Modal";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ConditionalRender";
import { Text } from "../Text";
import { TextInput } from "react-native";
import HtmlBlock from "../HTMLBlock";

interface TipsModalProps extends CustomModalProps {
  tips?: string[];
  noDataMessage?: string;
  title?: ReactNode;
  useHtmlRenderer?: boolean;
}

const TipsModal: React.FC<TipsModalProps> = ({
  tips = [],
  noDataMessage = "אין דגשים להצגה",
  title,
  useHtmlRenderer = false,
  ...props
}) => {
  const { colors, common, layout, spacing } = useStyles();

  const Tips = useMemo(() => {
    if (useHtmlRenderer) {
      return tips.map((tip, i) => {
        return <HtmlBlock key={i} source={{ html: tip }} />;
      });
    }

    return tips.map((tip, i) => (
      <View key={tip + i} style={[layout.flexRow, layout.itemsCenter, spacing.gapDefault]}>
        <View style={[colors.backgroundPrimary, common.roundedFull, { height: 5, width: 5 }]} />
        <TextInput multiline style={styles.text} editable={false}>
          {tip}
        </TextInput>
      </View>
    ));
  }, [tips, useHtmlRenderer]);

  return (
    <CustomModal {...props}>
      <CustomModal.Header>{title}</CustomModal.Header>
      <CustomModal.Content>
        <ConditionalRender condition={tips.length == 0}>
          <View style={[layout.flex1, layout.center]}>
            <Text>{noDataMessage}</Text>
          </View>
        </ConditionalRender>

        <ConditionalRender condition={tips.length !== 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[spacing.pdVerticalMd]}
          >
            {Tips}
          </ScrollView>
        </ConditionalRender>
      </CustomModal.Content>
    </CustomModal>
  );
};

const styles = StyleSheet.create({
  text: {
    flexWrap: "wrap",
    fontFamily: "Assistant-Regular",
    fontSize: 16,
    ...(Platform.OS == "ios" ? { paddingTop: 0 } : {}),
  },
});

export default TipsModal;
