import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card } from "../ui/Card";
import { IBlogCount } from "@/interfaces/IBlog";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";

const ArticleGroup: React.FC<{ articleGroup: IBlogCount }> = ({
  articleGroup: { count, name },
}) => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();

  return (
    <TouchableOpacity style={layout.widthFull}>
      <Card
        variant="gray"
        style={[layout.widthFull, layout.itemsStart, spacing.gapMd, common.roundedMd, spacing.pdMd]}
      >
        <Card.Header>
          <Text fontVariant="bold">{name}</Text>
        </Card.Header>
        <Card.Content>
          <View style={[colors.backgroundSurface, spacing.pdXs, common.roundedSm]}>
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
