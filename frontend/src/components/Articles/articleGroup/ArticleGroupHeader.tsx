import { View } from "react-native";
import React from "react";
import useStyles from "@/styles/useGlobalStyles";
import { IArticleCount } from "@/interfaces/IArticle";
import { Text } from "../../ui/Text";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import BackButton from "@/components/ui/BackButton";

interface ArticleGroupHeaderProps {
  articleGroup: IArticleCount;
}

const ArticleGroupHeader: React.FC<ArticleGroupHeaderProps> = ({ articleGroup }) => {
  const { layout, spacing, text } = useStyles();

  return (
    <View style={[spacing.gapMd, spacing.pdHorizontalLg]}>
      <View style={[layout.flexRow, layout.justifyBetween, layout.itemsCenter]}>
        <View style={[layout.flexRow, spacing.gapDefault, layout.itemsCenter]}>
          <BackButton<ArticleStackParamsList> />
          <Text fontSize={20} fontVariant="light">
            {articleGroup.name}
          </Text>
        </View>

        <Text fontSize={14} fontVariant="bold">
          {articleGroup.count} מאמרים
        </Text>
      </View>

      <Text fontSize={16} fontVariant="regular" style={text.textLeft}>
        {articleGroup.description}
      </Text>
    </View>
  );
};

export default ArticleGroupHeader;
