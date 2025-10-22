import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, View } from "react-native";
import useStyles from "@/styles/useGlobalStyles";
import { IChatMessage } from "@/interfaces/chat";
import { ConditionalRender } from "../ui/ConditionalRender";
import ChatBubble from "../ui/chat/ChatBubble";
import Loader from "../ui/loaders/Loader";
import { Text } from "../ui/Text";
import MessageContextMenu from "./MessageContextMenu";
import { useUserStore } from "@/store/userStore";
import { greetUser } from "@/utils/chat-utils";

interface ConversationContainerProps {
  conversation: IChatMessage[];
  loading: boolean;
  onCopyMessage?: (message: IChatMessage) => void;
  onDeleteMessage?: (message: IChatMessage) => Promise<void> | void;
  statusBanner?: { variant: "quota" | "paused"; message: string } | null;
}

const REFUSAL_REASONS: Array<IChatMessage["reason"]> = ["BLOCKED", "NOT_FITNESS", "CACHE_REFUSAL"];

const ConversationContainer: React.FC<ConversationContainerProps> = ({
  conversation,
  loading,
  onCopyMessage,
  onDeleteMessage,
  statusBanner,
}) => {
  const user = useUserStore((state) => state.currentUser);
  const { spacing, layout, colors, common, text } = useStyles();

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<IChatMessage | null>(null);

  const handleCloseMenu = useCallback(() => {
    setMenuVisible(false);
    setSelectedMessage(null);
  }, []);

  const handleLongPress = useCallback((message: IChatMessage) => {
    setSelectedMessage(message);
    setMenuVisible(true);
  }, []);

  const handleCopy = useCallback(() => {
    if (selectedMessage && onCopyMessage) {
      onCopyMessage(selectedMessage);
    }
  }, [onCopyMessage, selectedMessage]);

  const handleDelete = useCallback(() => {
    if (selectedMessage && onDeleteMessage) {
      onDeleteMessage(selectedMessage);
    }
  }, [onDeleteMessage, selectedMessage]);

  const renderCitations = useCallback(
    (item: IChatMessage) => {
      if (!item.citations || item.citations.length === 0) return null;

      const alignStyle = item.variant === "prompt" ? layout.alignSelfStart : layout.alignSelfEnd;

      return (
        <View
          pointerEvents="none"
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
          pointerEvents="none"
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
      const isGreeting =
        item.variant === "response" && (item.greeting || item.reason === "GREETING");

      const isRefusal =
        item.variant === "response" && (item.refusal || REFUSAL_REASONS.includes(item.reason));

      const fallbackRefusalText =
        item.reason === "NOT_FITNESS"
          ? "אפשר לדבר רק על נושאים שקשורים לכושר."
          : "מצטער, איני יכול לעזור עם הבקשה הזו.";

      const bubbleText = isGreeting
        ? greetUser(user, item)
        : isRefusal
          ? item.text?.trim() || fallbackRefusalText
          : item.text;

      const shouldRenderBubble =
        item.variant === "prompt" || (bubbleText && bubbleText.trim().length > 0) || isRefusal;

      const isRTL = (item.language ?? "he").toLowerCase().startsWith("he");
      const alignmentStyle =
        item.variant === "prompt" ? layout.alignSelfStart : layout.alignSelfEnd;

      const shouldShowCitations =
        !isRefusal && item.variant === "response" && !!item.citations && item.citations.length > 0;

      return (
        <View style={[spacing.gapXs]}>
          <ConditionalRender condition={item.notice}>{renderNotice(item)}</ConditionalRender>

          <ConditionalRender condition={shouldRenderBubble}>
            <Pressable onLongPress={() => handleLongPress(item)} delayLongPress={200}>
              <ChatBubble variant={item.variant} language={item.language}>
                {bubbleText}
              </ChatBubble>
            </Pressable>
          </ConditionalRender>

          <ConditionalRender condition={item.error}>
            <Text
              fontSize={12}
              style={[
                alignmentStyle,
                colors.textDanger,
                { writingDirection: isRTL ? "rtl" : "ltr" },
              ]}
            >
              השליחה נכשלה, נסו שוב.
            </Text>
          </ConditionalRender>

          <ConditionalRender condition={shouldShowCitations}>
            {renderCitations(item)}
          </ConditionalRender>
        </View>
      );
    },
    [
      colors.textDanger,
      handleLongPress,
      layout.alignSelfEnd,
      layout.alignSelfStart,
      renderCitations,
      renderNotice,
      spacing.gapXs,
    ]
  );

  const listContentStyle = useMemo(() => [spacing.gap20], [spacing.gap20]);

  const bannerBackgroundStyle = useMemo(() => {
    if (!statusBanner) return null;

    return statusBanner.variant === "paused"
      ? colors.backgroundErrorContainer
      : colors.backgroundWarningContainer;
  }, [colors.backgroundErrorContainer, colors.backgroundWarningContainer, statusBanner]);

  const bannerTextStyle = useMemo(() => {
    if (!statusBanner) return null;

    return statusBanner.variant === "paused" ? colors.textOnErrorContainer : colors.textOnWarningContainer;
  }, [colors.textOnErrorContainer, colors.textOnWarningContainer, statusBanner]);

  return (
    <View style={[layout.flex1, spacing.gapDefault]} pointerEvents="box-none">
      <ConditionalRender condition={!!statusBanner?.message}>
        <View
          style={[
            bannerBackgroundStyle ?? colors.backgroundSurfaceVariant,
            colors.outline,
            common.borderXsm,
            common.rounded,
            spacing.pdDefault,
          ]}
        >
          <Text
            fontSize={12}
            style={[text.textRight, bannerTextStyle ?? colors.textOnSurface, { lineHeight: 18 }]}
          >
            {statusBanner?.message}
          </Text>
        </View>
      </ConditionalRender>

      <FlatList
        data={conversation}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted
        removeClippedSubviews
        windowSize={7} // 5–9 is a good range
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        contentContainerStyle={listContentStyle}
        keyboardShouldPersistTaps="handled"
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      />

      <ConditionalRender condition={loading}>
        <ChatBubble variant="response">
          <Loader />
        </ChatBubble>
      </ConditionalRender>

      <MessageContextMenu
        visible={menuVisible && !!selectedMessage}
        onClose={handleCloseMenu}
        onCopy={selectedMessage?.text ? handleCopy : undefined}
        onDelete={selectedMessage ? handleDelete : undefined}
      />
    </View>
  );
};

export default ConversationContainer;
