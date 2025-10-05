import useAddViewer from "@/hooks/mutations/articles/useAddViewer";
import useOneArticleQuery from "@/hooks/queries/articles/useOneArticleQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../ui/Text";
import Icon from "../Icon/Icon";
import { Card } from "../ui/Card";
import RenderHTML from "react-native-render-html";
import PrimaryButton from "../ui/buttons/PrimaryButton";
import ArticleImage from "./ArticleImage";

const Article = () => {
  const { colors, common, fonts, layout, spacing, text } = useStyles();
  const currentUserId = useUserStore((state) => state.currentUser?._id);
  const route = useRoute<RouteProp<ArticleStackParamsList, "ViewArticle">>();
  const { articleId } = route.params;

  const { data, isLoading, isError } = useOneArticleQuery(articleId);
  const { mutate: addViewer } = useAddViewer(articleId, data?.group?._id);

  useEffect(() => {
    if (!data) return;

    const hasViewedAlready = data.views.find((viewer) => viewer === currentUserId);

    if (hasViewedAlready) return;

    addViewer();
  }, [data]);

  if (isError) return <ErrorScreen />;
  if (isLoading) return <Text>loading...</Text>;

  return (
    <View
      style={[
        spacing.gap20,
        spacing.pdStatusBar,
        spacing.pdBottomBar,
        colors.background,
        spacing.pdHorizontalLg,
        layout.flex1,
      ]}
    >
      <TouchableOpacity>
        <Icon name="chevronRightBig" />
      </TouchableOpacity>

      <Card style={[layout.flex1, common.roundedMd, spacing.pdMd]}>
        <Card.Header>
          <ArticleImage
            height={178}
            imageUrl={data?.imageUrl}
            linkToVideo={data?.link}
            isPlayable={!!data?.link}
          />
        </Card.Header>

        <Card.Content style={[{ gap: 4 }, layout.itemsStart]}>
          <Text fontVariant="semibold" fontSize={16}>
            {data?.title}
          </Text>

          <RenderHTML
            source={{ html: data!.content }}
            baseStyle={{
              color: colors.textPrimary.color,
              fontSize: 14,
              textAlign: `left`,
            }}
          />
        </Card.Content>
      </Card>

      <PrimaryButton block mode="light">
        <View style={[layout.flexRow, layout.itemsCenter, { gap: 2 }]}>
          <Icon name="like" />
          <Text fontSize={16} fontVariant="bold">
            אהבתי
          </Text>
        </View>
      </PrimaryButton>
    </View>
  );
};

export default Article;
