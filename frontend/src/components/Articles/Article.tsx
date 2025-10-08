import useAddViewer from "@/hooks/mutations/articles/useAddViewer";
import useOneArticleQuery from "@/hooks/queries/articles/useOneArticleQuery";
import ErrorScreen from "@/screens/ErrorScreen";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Text } from "../ui/Text";
import { Card } from "../ui/Card";
import RenderHTML from "react-native-render-html";
import ArticleImage from "./ArticleImage";
import BackButton from "../ui/BackButton";
import LikeButton from "./LikeButton";
import SpinningIcon from "../ui/loaders/SpinningIcon";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";

const Article = () => {
  const { colors, common, layout, spacing } = useStyles();
  const currentUserId = useUserStore((state) => state.currentUser?._id);
  const route = useRoute<RouteProp<ArticleStackParamsList, "ViewArticle">>();
  const { articleId } = route.params;
  const { isRefreshing, refresh } = usePullDownToRefresh();

  const { data, isLoading, isError, refetch } = useOneArticleQuery(articleId);
  const { mutate: addViewer } = useAddViewer(articleId, data?.group?._id);

  const isViewed = useMemo(() => {
    if (!currentUserId || !data?.views.length) return false;

    return !!data.views.find((viewer) => viewer === currentUserId);
  }, [currentUserId, data?.views]);

  useEffect(() => {
    if (isViewed) return;

    addViewer();
  }, [isViewed]);

  if (isError) return <ErrorScreen />;
  if (isLoading)
    return (
      <View style={[layout.flex1, layout.center]}>
        <SpinningIcon mode="light" />
      </View>
    );

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
      <BackButton<ArticleStackParamsList> />

      <Card style={[layout.flex1, common.roundedMd, spacing.pdMd]}>
        <Card.Header>
          <ArticleImage
            height={178}
            imageUrl={data?.imageUrl}
            linkToVideo={data?.link}
            isPlayable={!!data?.link}
          />
        </Card.Header>

        <Card.Content style={[{ gap: 4 }, layout.itemsStart, layout.flex1]}>
          <Text fontVariant="semibold" fontSize={16} style={{ textAlign: "left" }}>
            {data?.title}
          </Text>

          <ScrollView
            style={[layout.flex1]}
            nestedScrollEnabled
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
            }
          >
            <RenderHTML
              source={{ html: data!.content }}
              baseStyle={{
                color: colors.textPrimary.color,
                fontSize: 14,
                textAlign: `left`,
              }}
              tagsStyles={{
                b: { fontWeight: "bold" },
                strong: { fontWeight: "bold" },
              }}
            />
          </ScrollView>
        </Card.Content>
      </Card>

      <LikeButton articleId={articleId} likes={data?.likes || []} />
    </View>
  );
};

export default Article;
