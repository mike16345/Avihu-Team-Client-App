import { FC, useState } from "react";
import {
  View,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
  FlatList,
} from "react-native";
import RenderHTML from "react-native-render-html";
import useStyles from "@/styles/useGlobalStyles";
import useCardStyles from "@/styles/useCardStyles";
import { useBlogsApi } from "@/hooks/api/useBlogsApi";
import { useInfiniteQuery } from "@tanstack/react-query";
import { IBlog } from "@/interfaces/IBlog";
import { buildPhotoUrl } from "@/utils/utils";
import BlogImage from "@/components/Blog/BlogImage";
import DateUtils from "@/utils/dateUtils";
import { Text } from "@/components/ui/Text";
import Loader from "@/components/ui/loaders/Loader";

interface PostCardProps {
  blog: IBlog;
}

const PostCard: FC<PostCardProps> = ({ blog }) => {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions();
  const { colors, text, fonts, layout } = useStyles();
  const cardStyles = useCardStyles();

  const shouldTruncate = blog.content.length > 100;
  const displayContent =
    expanded || !shouldTruncate ? blog.content : `${blog.content.slice(0, 100)}...`;

  return (
    <View style={[cardStyles.card]}>
      <View style={[layout.flexRow, layout.itemsCenter, layout.justifyBetween]}>
        <Text style={[colors.textOnSecondaryContainer]}>{DateUtils.formatDate(blog.date)}</Text>
        <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>
          {blog.title.trimStart()}
        </Text>
      </View>

      <RenderHTML
        contentWidth={width}
        source={{ html: displayContent }}
        baseStyle={{
          color: colors.textOnSecondaryContainer.color,
        }}
      />

      {shouldTruncate && (
        <TouchableOpacity style={{ paddingBottom: 10 }} onPress={() => setExpanded(!expanded)}>
          <Text style={[colors.textOnSurfaceDisabled]}>{expanded ? "View Less" : "View More"}</Text>
        </TouchableOpacity>
      )}

      {blog.imageUrl && <BlogImage imageUrl={buildPhotoUrl(blog.imageUrl)} />}
    </View>
  );
};

const BlogScreen = () => {
  const { getPaginatedPosts } = useBlogsApi();
  const styles = useStyles();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery(
    ["posts"],
    ({ pageParam = 1 }) => getPaginatedPosts({ page: pageParam, limit: 5 }),
    {
      getNextPageParam: (lastPage) => {
        return lastPage.hasNextPage ? lastPage.currentPage + 1 : undefined;
      },
    }
  );

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading || isFetchingNextPage) return <Loader />;

  return (
    <FlatList
      data={data?.pages.flatMap((page) => page.results)} // Flatten paginated results
      keyExtractor={(item) => item._id} // Use MongoDB `_id` as the key
      renderItem={({ item }) => <PostCard blog={item} />}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      ListFooterComponent={
        isFetchingNextPage ? <ActivityIndicator size="large" color="#FFF" /> : null
      }
      contentContainerStyle={[
        styles.spacing.pdBottomBar,
        styles.spacing.pdStatusBar,
        styles.spacing.pdHorizontalDefault,
      ]}
    />
  );
};

export default BlogScreen;
