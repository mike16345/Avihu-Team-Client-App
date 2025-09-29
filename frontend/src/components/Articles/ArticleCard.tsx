import { IArticle } from "@/interfaces/IArticle";
import { TouchableOpacity } from "react-native";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import RenderHTML from "react-native-render-html";
import ArticleImage from "./ArticleImage";
import ArticleMetric from "./ArticleMetric";

interface ArticleCardProps {
  article: IArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { colors, common, layout, spacing, text } = useStyles();

  return (
    <TouchableOpacity>
      <Card style={[common.roundedMd, spacing.pdLg, spacing.gapLg]}>
        <Card.Header>
          <Text fontVariant="semibold" fontSize={16} style={[text.textLeft, { paddingBottom: 4 }]}>
            {article.title}
          </Text>
          <RenderHTML
            source={{ html: article.content.slice(0, 100) }}
            baseStyle={{
              color: colors.textPrimary.color,
              textAlign: `left`,
            }}
          />
        </Card.Header>
        <Card.Content>
          <ArticleImage imageUrl={article.imageUrl} linkToVideo={article.link} />
        </Card.Content>

        <Card.Footer style={[layout.flexRow, layout.itemsCenter, spacing.gapLg]}>
          <ArticleMetric icon="eye" value={article.views.length} />
          <ArticleMetric icon="like" value={article.likes.length} />
        </Card.Footer>
      </Card>
    </TouchableOpacity>
  );
};

export default ArticleCard;
