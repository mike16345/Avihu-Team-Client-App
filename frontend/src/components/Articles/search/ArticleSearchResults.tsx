import { FC, useMemo } from "react";
import { View, Pressable, Image } from "react-native";
import { Text } from "@/components/ui/Text";
import { IArticle } from "@/interfaces/IArticle";
import useStyles from "@/styles/useGlobalStyles";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ArticleStackParamsList } from "@/types/navigatorTypes";
import { buildPhotoUrl, extractVideoId, getYouTubeThumbnail } from "@/utils/utils";
import defaultImage from "@assets/icon.png";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const Highlight: FC<{ text: string; term: string; style?: any; numberOfLines?: number }> = ({
  text,
  term,
  style,
  numberOfLines,
}) => {
  const chunks = useMemo(() => {
    if (!term) return [{ text, hit: false }];
    const re = new RegExp(`(${escapeRegex(term)})`, "gi");
    return text.split(re).map((chunk) => ({ text: chunk, hit: re.test(chunk) }));
  }, [text, term]);

  return (
    <Text style={style} numberOfLines={numberOfLines} ellipsizeMode="tail">
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

const resolveImage = (article: IArticle): string | undefined => {
  if (article.imageUrl) return buildPhotoUrl(article.imageUrl);
  if (article.link) {
    const videoId = extractVideoId(article.link);
    if (videoId) return getYouTubeThumbnail(videoId);
  }
  return undefined;
};

interface Props {
  articles: IArticle[];
  term: string;
}

export const ArticleSearchResults: FC<Props> = ({ articles, term }) => {
  const { layout, spacing } = useStyles();
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
        const uri = resolveImage(article);
        return (
          <Pressable
            key={article._id}
            onPress={() => navigation.navigate("ViewArticle", { articleId: article._id })}
            style={({ pressed }) => [
              {
                borderRadius: 14,
                backgroundColor: pressed ? "#F7F9F8" : "#FFFFFF",
                borderWidth: 1,
                borderColor: "#EAECF0",
                padding: 10,
                flexDirection: "row-reverse",
                alignItems: "center",
                gap: 12,
                shadowColor: "#0F172A",
                shadowOpacity: 0.04,
                shadowRadius: 3,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              },
            ]}
          >
            {/* Right side (in RTL row-reverse) — text */}
            <View style={{ flex: 1, gap: 4 }}>
              <Highlight
                text={article.title}
                term={term}
                numberOfLines={2}
                style={{
                  fontFamily: "assistantSemibold",
                  fontSize: 15,
                  color: "#101828",
                  textAlign: "right",
                  lineHeight: 20,
                }}
              />
              {article.subtitle ? (
                <Text
                  fontSize={12}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{ color: "#667085", textAlign: "right" }}
                >
                  {article.subtitle}
                </Text>
              ) : null}
            </View>
            {/* Left side — image thumbnail */}
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                overflow: "hidden",
                backgroundColor: "#F2F4F7",
              }}
            >
              <Image
                source={uri ? { uri } : defaultImage}
                defaultSource={defaultImage}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export const ArticleSearchEmpty: FC<{ term: string }> = ({ term }) => {
  const { layout, spacing } = useStyles();
  return (
    <View style={[layout.widthFull, layout.center, spacing.gap12, { paddingVertical: 40 }]}>
      <Text fontSize={40}>🔎</Text>
      <Text fontVariant="semibold" fontSize={16} style={{ color: "#101828" }}>
        לא נמצאו מאמרים עבור "{term}"
      </Text>
      <Text fontSize={13} style={{ color: "#667085", textAlign: "center", paddingHorizontal: 20 }}>
        נסה מילת חיפוש אחרת
      </Text>
    </View>
  );
};
