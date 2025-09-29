import { TouchableOpacity, View } from "react-native";
import React from "react";
import { Card } from "../ui/Card";
import { IBlogCount } from "@/interfaces/IBlog";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import { ConditionalRender } from "../ui/ConditionalRender";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const ArticleGroupDisplay: React.FC<{ articleGroup: IBlogCount }> = ({
  articleGroup: { count, name, description, id },
}) => {
  const { colors, common, layout, spacing, text } = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<ArticleStackParamsList>>();

  const handlePress = () => {
    navigation.navigate("ArticleGroup", { articleGroup: { count, name, description, id } });
  };

  return (
    <TouchableOpacity style={layout.widthFull} onPress={handlePress}>
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

export default ArticleGroupDisplay;
