import ArticleGroupDisplay from "@/components/Articles/articleGroup/ArticleGroupDisplay";
import ArticleSkeleton from "@/components/ui/loaders/skeletons/ArticleSkeleton";
import { Text } from "@/components/ui/Text";
import useArticleCountQuery from "@/hooks/queries/articles/useArticleCountQuery";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { useCallback, useMemo, useRef } from "react";
import { Animated, Easing, RefreshControl, ScrollView } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

const STAGGER_MS = 130;
const ITEM_DURATION_MS = 520;

const StaggeredItem: React.FC<{ index: number; playKey: number; children: React.ReactNode }> = ({
  index,
  playKey,
  children,
}) => {
  const progress = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      progress.setValue(0);
      const anim = Animated.timing(progress, {
        toValue: 1,
        duration: ITEM_DURATION_MS,
        delay: index * STAGGER_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      });
      anim.start();
      return () => anim.stop();
    }, [progress, index, playKey])
  );

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [16, 0] });

  return (
    <Animated.View style={{ width: "100%", opacity: progress, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};

const ArticleScreen = () => {
  const { colors, layout, spacing, text } = useStyles();
  const { isRefreshing, refresh } = usePullDownToRefresh();
  const planType = useUserStore((state) => state.currentUser?.planType || "");

  const { data, isLoading, refetch } = useArticleCountQuery(planType);

  const articleGroups = useMemo(() => {
    if (!data || data.length === 0)
      return (
        <Text style={[text.textCenter, layout.widthFull, spacing.pdVertical20]}>
          אין מאמרים להצגה
        </Text>
      );

    return data.map((group, idx) => (
      <StaggeredItem key={group.id} index={idx} playKey={data.length}>
        <ArticleGroupDisplay articleGroup={group} />
      </StaggeredItem>
    ));
  }, [data]);

  if (isLoading) return <ArticleSkeleton />;

  return (
    <ScrollView
      style={[colors.background, layout.flex1]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        layout.itemsStart,
        spacing.gap20,
        spacing.pdLg,
        spacing.pdStatusBar,
        spacing.pdBottomBar,
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
      }
    >
      <Text fontSize={24} fontVariant="light">
        מאמרים
      </Text>

      {articleGroups}
    </ScrollView>
  );
};

export default ArticleScreen;
