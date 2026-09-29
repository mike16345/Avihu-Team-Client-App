import { FC, useMemo } from "react";
import { View, Pressable } from "react-native";
import { Text } from "@/components/ui/Text";
import { IArticle } from "@/interfaces/IArticle";
import useStyles from "@/styles/useGlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticleStackParamsList } from "@/types/navigatorTypes";

const stripHtml = (html?: string) =>
  (html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight: FC<{ text: string; term: string; style?: any }> = ({ text, term, style }) => {
  const chunks = useMemo(() => {
    if (!term) return [{ text, hit: false }];
    const re = new RegExp(`(${escapeRegex(term)})`, "gi");
    return text.split(re).map((chunk) => ({ text: chunk, hit: re.test(chunk) }));
  }, [text, term]);

  return (
    <Text style={style}>
      {chunks.map((c, i) => (
        <Text
          key={i}
          style={
            c.hit
              ? { backgroundColor: "#F5F1B4", color: "#0F5E3B", fontWeight: "700" }
              : undefined
          }
        >
          {c.text}
        </Text>
      ))}
    </Text>
  );
};

const excerptAround = (text: string, term: string, size = 90) => {
  if (!term) return text.slice(0, size * 2);
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx < 0) return text.slice(0, size * 2);
  const start = Math.max(0, idx - size);
  const end = Math.min(text.length, idx + term.length + size);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
};

interface Props {
  articles: IArticle[];
  term: string;
}

export const ArticleSearchResults: FC<Props> = ({ articles, term }) => {
  const { colors, spacing, layout, common } = useStyles();
  const navigation = useNavigation<NativeStackNavigationProp<ArticleStackParamsList>>();

  return (
    <View style={[layout.widthFull, spacing.gap12]}>
      <View
        style={[
          layout.flexRow,
          layout.itemsCenter,
          spacing.gapSm,
          spacing.pdHorizontalXs,
          { paddingBottom: 2 },
        ]}
      >
        <Text fontVariant="semibold" fontSize={14} style={{ color: "#667085" }}>
          {articles.length} תוצאות עבור
        </Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 999,
            backgroundColor: "#ECFDF3",
          }}
        >
          <Text fontVariant="semibold" fontSize={13} style={{ color: "#067647" }}>
            "{term}"
          </Text>
        </View>
      </View>

      {articles.map((article) => {
        const plain = stripHtml(article.content);
        const excerpt = excerptAround(plain, term, 60);
        return (
          <Pressable
            key={article._id}
            onPress={() =>
              navigation.navigate("Article", { articleId: article._id, groupId: "" as any })
            }
            style={({ pressed }) => [
              {
                borderRadius: 14,
                backgroundColor: pressed ? "#F7F9F8" : "#FFFFFF",
                borderWidth: 1,
                borderColor: "#EAECF0",
                padding: 14,
              },
            ]}
          >
            <View style={[layout.flexRow, layout.justifyBetween, layout.itemsStart, spacing.gapSm]}>
              <View style={[layout.flex1, spacing.gapXs]}>
                <Highlight
                  text={article.title}
                  term={term}
                  style={{ fontFamily: "assistantSemibold", fontSize: 16, color: "#101828", textAlign: "right" }}
                />
                {article.subtitle && (
                  <Text fontSize={13} style={{ color: "#667085", textAlign: "right" }}>
                    {article.subtitle}
                  </Text>
                )}
                <Highlight
                  text={excerpt}
                  term={term}
                  style={{ fontFamily: "assistantRegular", fontSize: 13, color: "#475467", lineHeight: 20, textAlign: "right" }}
                />
              </View>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export const ArticleSearchEmpty: FC<{ term: string; suggestions?: string[]; onSuggestion?: (s: string) => void }> = ({
  term,
  suggestions,
  onSuggestion,
}) => {
  const { layout, spacing } = useStyles();
  return (
    <View style={[layout.widthFull, layout.center, spacing.gap12, { paddingVertical: 40 }]}>
      <Text fontSize={40}>🔎</Text>
      <Text fontVariant="semibold" fontSize={16} style={{ color: "#101828" }}>
        לא נמצאו מאמרים עבור "{term}"
      </Text>
      <Text fontSize={13} style={{ color: "#667085", textAlign: "center", paddingHorizontal: 20 }}>
        נסה מילת חיפוש אחרת או בחר אחת מההצעות למטה
      </Text>
      {suggestions && suggestions.length > 0 && (
        <View style={[layout.flexRow, spacing.gapXs, { flexWrap: "wrap", justifyContent: "center", marginTop: 8 }]}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => onSuggestion?.(s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#F2F4F7",
                borderWidth: 1,
                borderColor: "#EAECF0",
              }}
            >
              <Text fontSize={12} fontVariant="semibold" style={{ color: "#344054" }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

export const ArticleSearchSuggestions: FC<{
  suggestions: string[];
  onPick: (s: string) => void;
  recentSearches?: string[];
  onPickRecent?: (s: string) => void;
}> = ({ suggestions, onPick, recentSearches, onPickRecent }) => {
  const { layout, spacing } = useStyles();
  return (
    <View style={[layout.widthFull, spacing.gap14]}>
      {recentSearches && recentSearches.length > 0 && (
        <View style={spacing.gap12}>
          <Text fontVariant="semibold" fontSize={13} style={{ color: "#667085" }}>
            חיפושים אחרונים
          </Text>
          <View style={[layout.flexRow, spacing.gapXs, { flexWrap: "wrap" }]}>
            {recentSearches.map((s) => (
              <Pressable
                key={s}
                onPress={() => onPickRecent?.(s)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 999,
                  backgroundColor: "#F9FAFB",
                  borderWidth: 1,
                  borderColor: "#EAECF0",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text fontSize={12} style={{ color: "#667085" }}>🕐</Text>
                <Text fontSize={12} fontVariant="semibold" style={{ color: "#344054" }}>
                  {s}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}
      <View style={spacing.gap12}>
        <Text fontVariant="semibold" fontSize={13} style={{ color: "#667085" }}>
          חיפושים פופולריים
        </Text>
        <View style={[layout.flexRow, spacing.gapXs, { flexWrap: "wrap" }]}>
          {suggestions.map((s) => (
            <Pressable
              key={s}
              onPress={() => onPick(s)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: "#ECFDF3",
                borderWidth: 1,
                borderColor: "#A6F4C5",
              }}
            >
              <Text fontSize={12} fontVariant="semibold" style={{ color: "#067647" }}>
                #{s}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
};
