import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IArticleCount } from "@/interfaces/IArticle";
import { Text } from "../../ui/Text";
import BackButton from "@/components/ui/BackButton";

interface ArticleGroupHeaderProps {
  articleGroup: IArticleCount;
}

const ArticleGroupHeader: React.FC<ArticleGroupHeaderProps> = ({ articleGroup }) => {
  const { layout, spacing, text, colors, common } = useStyles();

  return (
    <View style={[spacing.gapLg, spacing.pdHorizontalLg]}>
      <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
        <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
          <BackButton />
          <Text fontSize={20} fontVariant="light">
            {articleGroup.name}
          </Text>
        </View>

        <View
          style={[
            spacing.pdVerticalXs,
            colors.backgroundSurface,
            common.roundedSm,
            {
              paddingHorizontal: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 2,
            },
          ]}
        >
          <Text fontSize={14} fontVariant="semibold">
            {articleGroup.count} מאמרים
          </Text>
        </View>
      </View>

      <Text fontSize={16} fontVariant="regular" style={text.textLeft}>
        {articleGroup.description}
      </Text>
    </View>
  );
};

export default ArticleGroupHeader;
