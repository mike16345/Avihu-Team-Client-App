import { semanticColors } from "@/themes/semanticColors";
import { IArticle } from "@/interfaces/IArticle";
import { Pressable, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Card } from "../ui/Card";
import { Text } from "../ui/Text";
import useStyles from "@/styles/useGlobalStyles";
import ArticleImage from "./ArticleImage";
import ArticleMetric from "./ArticleMetric";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import HtmlBlock from "../ui/HTMLBlock";
import { ConditionalRender } from "../ui/ConditionalRender";
import { usePinnedArticlesStore } from "@/store/pinnedArticlesStore";
import { selectionHaptic } from "@/utils/haptics";

const PIN_ACTIVE = semanticColors.app.brandStrong;
const PIN_INACTIVE = semanticColors.elevation.level5;

const PinIcon: React.FC<{ size?: number; color: string; filled: boolean }> = ({
  size = 20,
  color,
  filled,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M12 2.5 L14.7 9 L21.7 9.6 L16.4 14.2 L18 21 L12 17.3 L6 21 L7.6 14.2 L2.3 9.6 L9.3 9 Z"
      fill={filled ? color : "none"}
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </Svg>
);

interface ArticleCardProps {
  article: IArticle;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const { common, layout, spacing, text } = useStyles();

  const navigation = useNavigation<NativeStackNavigationProp<ArticleStackParamsList>>();
  const pinned = usePinnedArticlesStore((s) => s.pinnedIds.includes(article._id));
  const togglePin = usePinnedArticlesStore((s) => s.togglePin);

  const handlePress = () => {
    navigation.navigate("ViewArticle", { articleId: article._id });
  };

  const handleTogglePin = () => {
    selectionHaptic();
    togglePin(article._id);
  };

  return (
    <Pressable onPress={handlePress}>
      <Card style={[common.roundedMd, spacing.pdMd, spacing.gapLg]}>
        <Card.Header>
          <View style={pinStyles.headerRow}>
            <Text fontVariant="semibold" fontSize={16} style={[text.textLeft, pinStyles.title]}>
              {article.title}
            </Text>
            <Pressable
              onPress={handleTogglePin}
              hitSlop={10}
              style={pinStyles.pinBtn}
              accessibilityLabel={pinned ? "הסר נעץ" : "הוסף נעץ"}
            >
              <PinIcon color={pinned ? PIN_ACTIVE : PIN_INACTIVE} filled={pinned} />
            </Pressable>
          </View>

          <ConditionalRender condition={!!article.subtitle}>
            <Text style={{ textAlign: "left" }} fontSize={14}>
              {article.subtitle}
            </Text>
          </ConditionalRender>

          <ConditionalRender condition={!article.subtitle}>
            <HtmlBlock source={{ html: article.content.slice(0, 150) }} />
          </ConditionalRender>
        </Card.Header>
        <Card.Content>
          <ArticleImage imageUrl={article.imageUrl} linkToVideo={article.link} />
        </Card.Content>

        <Card.Footer style={[layout.flexRow, layout.itemsCenter, spacing.gapLg]}>
          <ArticleMetric icon="eye" value={article.views.length} />
          <ArticleMetric icon="like" value={article.likes.length} />
        </Card.Footer>
      </Card>
    </Pressable>
  );
};

const pinStyles = StyleSheet.create({
  headerRow: {
    position: "relative",
    paddingEnd: 30,
    paddingBottom: 4,
    minHeight: 24,
  },
  pinBtn: {
    position: "absolute",
    end: 0,
    top: 0,
    padding: 2,
    zIndex: 2,
  },
  title: {
    writingDirection: "rtl",
  },
});

export default ArticleCard;
