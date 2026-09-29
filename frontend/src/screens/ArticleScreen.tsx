import ArticleGroupDisplay from "@/components/Articles/articleGroup/ArticleGroupDisplay";
import ArticleSkeleton from "@/components/ui/loaders/skeletons/ArticleSkeleton";
import { Text } from "@/components/ui/Text";
import useArticleCountQuery from "@/hooks/queries/articles/useArticleCountQuery";
import useArticleSearchQuery from "@/hooks/queries/articles/useArticleSearchQuery";
import usePullDownToRefresh from "@/hooks/usePullDownToRefresh";
import { useUserStore } from "@/store/userStore";
import useStyles from "@/styles/useGlobalStyles";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import {
  ArticleSearchEmpty,
  ArticleSearchResults,
} from "@/components/Articles/search/ArticleSearchResults";

const STAGGER_MS = 130;
const ITEM_DURATION_MS = 520;
const DEBOUNCE_MS = 300;

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
  const { colors, layout, spacing, text, common } = useStyles();
  const { isRefreshing, refresh } = usePullDownToRefresh();
  const planType = useUserStore((state) => state.currentUser?.planType || "");

  const [rawSearch, setRawSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(rawSearch.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawSearch]);

  const { data, isLoading, refetch } = useArticleCountQuery(planType);
  const { data: searchData, isFetching: isSearching } = useArticleSearchQuery(
    debouncedSearch,
    planType
  );

  const isSearchMode = debouncedSearch.length > 0;

  const articleGroups = useMemo(() => {
    if (!data || data.length === 0)
      return (
        <View style={[layout.widthFull, layout.flex1, layout.center, spacing.pdVertical20]}>
          <Text style={text.textCenter}>אין מאמרים להצגה</Text>
        </View>
      );

    return data.map((group, idx) => (
      <StaggeredItem key={group.id} index={idx} playKey={data.length}>
        <ArticleGroupDisplay articleGroup={group} />
      </StaggeredItem>
    ));
  }, [data]);

  const searchBody = useMemo(() => {
    if (isSearching && !searchData) {
      return (
        <View style={[layout.widthFull, layout.center, { paddingVertical: 40 }]}>
          <ActivityIndicator size="large" color="#0F5E3B" />
          <Text fontSize={13} style={{ color: "#667085", marginTop: 12 }}>
            מחפש "{debouncedSearch}"...
          </Text>
        </View>
      );
    }
    const results = searchData?.results ?? [];
    if (results.length === 0) {
      return <ArticleSearchEmpty term={debouncedSearch} />;
    }
    return <ArticleSearchResults articles={results} term={debouncedSearch} />;
  }, [searchData, isSearching, debouncedSearch]);

  if (isLoading) return <ArticleSkeleton />;

  return (
    <ScrollView
      style={[colors.background, layout.flex1]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        layout.itemsStart,
        spacing.gap20,
        spacing.pdLg,
        spacing.pdStatusBar,
        spacing.pdBottomBar,
        { flexGrow: 1 },
      ]}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => refresh(refetch)} />
      }
    >
      <View
        style={[
          layout.widthFull,
          layout.flexRow,
          layout.itemsCenter,
          spacing.gapSm,
          spacing.pdHorizontalLg,
          common.roundedLg,
          {
            borderWidth: 1,
            borderColor: isFocused ? "#A6F4C5" : "#EAECF0",
            backgroundColor: "#FFFFFF",
            paddingVertical: 12,
          },
        ]}
      >
        <Text fontSize={16}>🔍</Text>
        <TextInput
          value={rawSearch}
          onChangeText={setRawSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="חיפוש מאמר..."
          placeholderTextColor="#98A2B3"
          returnKeyType="search"
          style={{
            flex: 1,
            fontFamily: "assistantRegular",
            fontSize: 15,
            textAlign: "right",
            color: "#101828",
            padding: 0,
          }}
        />
        {rawSearch.length > 0 && (
          <Pressable
            onPress={() => {
              setRawSearch("");
              setDebouncedSearch("");
            }}
            hitSlop={10}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 999,
                backgroundColor: "#F2F4F7",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text fontSize={12} style={{ color: "#667085" }}>
                ✕
              </Text>
            </View>
          </Pressable>
        )}
      </View>

      {isSearchMode ? searchBody : articleGroups}
    </ScrollView>
  );
};

export default ArticleScreen;
