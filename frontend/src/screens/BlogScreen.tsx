import { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import useStyles from "@/styles/useGlobalStyles";
import useCardStyles from "@/styles/useCardStyles";

const fetchPosts = async ({ pageParam = 1 }) => {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=5`
  );

  return response.data;
};

const BlogCard = ({ title, body }: { title: string; body: string }) => {
  const [expanded, setExpanded] = useState(false);
  const { colors, text, fonts } = useStyles();
  const cardStyles = useCardStyles();

  return (
    <View style={[cardStyles.card]}>
      <Text style={[colors.textOnSecondaryContainer, text.textBold, fonts.lg]}>{title}</Text>
      <Text style={[colors.textOnSecondaryContainer]}>
        {expanded ? body : `${body.slice(0, 100)}...`}
      </Text>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={[colors.textOnSurfaceDisabled]}>{expanded ? "View Less" : "View More"}</Text>
      </TouchableOpacity>
    </View>
  );
};

const BlogScreen = () => {
  const styles = useStyles();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["posts"],
    fetchPosts,
    {
      getNextPageParam: (_lastPage, pages) => (pages.length < 20 ? pages.length + 1 : undefined),
    }
  );

  const loadMore = () => {
    if (hasNextPage) {
      fetchNextPage();
    }
  };

  return (
    <FlatList
      data={data?.pages.flat()}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <BlogCard title={item.title} body={item.body} />}
      onEndReached={loadMore}
      ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      onEndReachedThreshold={0.5}
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
