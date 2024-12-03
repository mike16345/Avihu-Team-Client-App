import { FC, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
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

interface PostCardProps {
  blog: IBlog;
}

const PostCard: FC<PostCardProps> = ({ blog }) => {
  const [expanded, setExpanded] = useState(false);
  const { width } = useWindowDimensions(); // For responsive HTML rendering
  const { colors, text, fonts } = useStyles();
  const cardStyles = useCardStyles();

  const shouldTruncate = blog.content.length > 100;
  const displayContent =
    expanded || !shouldTruncate ? blog.content : `${blog.content.slice(0, 100)}...`;

  return (
    <View style={[cardStyles.card]}>
      <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>
        {blog.title.trimStart()}
      </Text>

      <RenderHTML
        contentWidth={width}
        source={{ html: displayContent }}
        baseStyle={{
          color: colors.textOnSecondaryContainer.color,
        }}
      />

      {shouldTruncate && (
        <TouchableOpacity onPress={() => setExpanded(!expanded)}>
          <Text style={[colors.textOnSurfaceDisabled]}>{expanded ? "View Less" : "View More"}</Text>
        </TouchableOpacity>
      )}

      {blog.imageUrl && (
        <Image
          source={{ uri: buildPhotoUrl(blog.imageUrl) }}
          style={{
            width: "100%",
            height: 200,
            marginTop: 12,
            borderRadius: 8,
          }}
          resizeMode="cover"
        />
      )}
    </View>
  );
};

const BlogScreen = () => {
  const { getPaginatedPosts } = useBlogsApi();
  const styles = useStyles();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
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
