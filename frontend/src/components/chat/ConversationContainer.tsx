import { View, FlatList } from "react-native";
import React, { useCallback } from "react";
import useStyles from "@/styles/useGlobalStyles";
import ChatBubble from "../ui/chat/ChatBubble";
import { IChatMessage } from "@/interfaces/chat";
import { ConditionalRender } from "../ui/ConditionalRender";
import Loader from "../ui/loaders/Loader";
import { Text } from "../ui/Text";

interface ConversationContainerProps {
  conversation: IChatMessage[];
  loading: boolean;
}

const ConversationContainer: React.FC<ConversationContainerProps> = ({ conversation, loading }) => {
  const { spacing, layout, colors, common, text } = useStyles();

  const renderCitations = useCallback(
    (item: IChatMessage) => {
      if (!item.citations || item.citations.length === 0) return null;

      const alignStyle = item.variant === "prompt" ? layout.alignSelfStart : layout.alignSelfEnd;

      return (
        <View
          style={[
            alignStyle,
            colors.backgroundSurfaceVariant,
            colors.outline,
            common.borderXsm,
            spacing.pdSm,
            spacing.gapXs,
            common.rounded,
            layout.flexColumn,
          ]}
        >
          {item.citations.map((citation) => {
            const details: string[] = [];
            if (citation.sourceId) details.push(citation.sourceId);
            if (typeof citation.page === "number") details.push(`page ${citation.page}`);
            if (typeof citation.score === "number") {
              details.push(`score ${citation.score.toFixed(2)}`);
            }

            return (
              <Text
                key={`${item.id}-${citation.marker}`}
                fontSize={12}
                style={[text.textLeft, { writingDirection: "ltr" }]}
              >
                {`${citation.marker} ${details.join(" · ")}`.trim()}
              </Text>
            );
          })}
        </View>
      );
    },
    [
      colors.backgroundSurfaceVariant,
      colors.outline,
      common.borderXsm,
      common.rounded,
      layout.alignSelfEnd,
      layout.alignSelfStart,
      layout.flexColumn,
      spacing.gapXs,
      spacing.pdSm,
      text.textLeft,
    ]
  );

  const renderNotice = useCallback(
    (item: IChatMessage) => {
      if (!item.notice) return null;

      const alignStyle = item.variant === "prompt" ? layout.alignSelfStart : layout.alignSelfEnd;

      return (
        <View
          style={[
            alignStyle,
            colors.backgroundWarningContainer,
            colors.outline,
            common.borderXsm,
            spacing.pdSm,
            common.rounded,
          ]}
        >
          <Text fontSize={12} style={[text.textRight, { lineHeight: 16 }]}>
            {item.notice}
          </Text>
        </View>
      );
    },
    [
      colors.backgroundWarningContainer,
      colors.outline,
      common.borderXsm,
      common.rounded,
      layout.alignSelfEnd,
      layout.alignSelfStart,
      spacing.pdSm,
      text.textRight,
    ]
  );

  const renderItem = useCallback(
    ({ item }: { item: IChatMessage }) => {
      const isRTL = (item.language ?? "he").toLowerCase().startsWith("he");
      const reasonStyle = isRTL ? text.textRight : text.textLeft;

      return (
        <View style={[spacing.gapXs]}>
          <ChatBubble variant={item.variant} language={item.language}>
            {item.text}
          </ChatBubble>
          <ConditionalRender condition={item.reason}>
            <Text
              fontSize={12}
              style={[reasonStyle, { writingDirection: isRTL ? "rtl" : "ltr" }]}
            >
              {item.reason}
            </Text>
          </ConditionalRender>
          <ConditionalRender condition={item.citations && item.citations.length > 0}>
            {renderCitations(item)}
          </ConditionalRender>
          <ConditionalRender condition={item.notice}>{renderNotice(item)}</ConditionalRender>
        </View>
      );
    },
    [renderCitations, renderNotice, spacing.gapXs, text.textLeft, text.textRight]
  );

  return (
    <>
      <FlatList
        data={conversation}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        nestedScrollEnabled
        contentContainerStyle={[spacing.gap20]}
        keyboardShouldPersistTaps="handled"
      />

      <ConditionalRender condition={loading}>
        <ChatBubble variant="response">
          <Loader />
        </ChatBubble>
      </ConditionalRender>
    </>
  );
};

export default ConversationContainer;
