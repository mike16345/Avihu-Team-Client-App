import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card } from "../ui/Card";
import { IBlogCount } from "@/interfaces/IBlog";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";

const ArticleGroup: React.FC<{ articleGroup: IBlogCount }> = ({
  articleGroup: { count, name, description },
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <TouchableOpacity style={layout.widthFull}>
      <Card
        variant="gray"
        style={[layout.widthFull, layout.itemsStart, common.roundedMd, spacing.pdMd]}
      >
        <Card.Header style={{ paddingBottom: 4 }}>
          <Text fontVariant="bold" fontSize={16}>
            {name}
          </Text>
        </Card.Header>
        <Card.Content style={[spacing.gapMd, layout.itemsStart]}>
          <ConditionalRender condition={description}>
            <Text fontSize={16} style={text.textLeft}>
              {description}
            </Text>
          </ConditionalRender>

          <View
            style={[
              colors.backgroundSurface,
              spacing.pdXs,
              common.roundedSm,
              layout.alignSelfStart,
            ]}
          >
            <Text fontSize={14} fontVariant="semibold">
              {count} מאמרים
            </Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

export default ArticleGroup;
