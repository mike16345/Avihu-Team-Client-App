import { Clipboard, Keyboard, View } from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import useStyles from "@/styles/useGlobalStyles";
import ChatInput from "@/components/ui/inputs/ChatInput";
import SendButton from "@/components/ui/chat/SendButton";
import { Text } from "@/components/ui/Text";
import InitialChatContainer from "@/components/chat/InitialChatContainer";
import { ConditionalRender } from "@/components/ui/ConditionalRender";
import ConversationContainer from "@/components/chat/ConversationContainer";
import { IChatMessage } from "@/interfaces/chat";
import useChatStorage from "@/hooks/sessions/useChatStorage";
import { useUserStore } from "@/store/userStore";
import { useToast } from "@/hooks/useToast";
import useQuotaPause from "@/hooks/chat/useQuotaPause";
import useChatController from "@/hooks/chat/useChatController";
import { KeyboardAvoidingView, KeyboardGestureArea } from "react-native-keyboard-controller";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";

const ChatScreen = () => {
  const { colors, layout, spacing, text } = useStyles();
  const { triggerErrorToast } = useToast();
  const currentUserId = useUserStore((state) => state.currentUser?._id);

  const {
    isLoading: storageLoading,
    activeSessionId,
    messages,
    createSession,
    removeMessage,
  } = useChatStorage();

  const { statusBanner, isComposerLocked } = useQuotaPause(activeSessionId);
  const { loading, retryContext, send, retry } = useChatController(currentUserId, activeSessionId);

  const [prompt, setPrompt] = useState<string>("");

  const conversation = useMemo<IChatMessage[]>(() => messages ?? [], [messages]);

  const handleCopyMessage = useCallback(
    async (message: IChatMessage) => {
      if (!message.text) return;

      try {
        if (Clipboard && typeof Clipboard.setString === "function") {
          Clipboard.setString(message.text);
        } else {
          const webClipboard = (globalThis as any)?.navigator?.clipboard;
          if (webClipboard?.writeText) {
            await webClipboard.writeText(message.text);
          }
        }
      } catch {
        triggerErrorToast({ message: "העתקה נכשלה" });
      }
    },
    [triggerErrorToast]
  );

  const handleDeleteMessage = useCallback(
    async (message: IChatMessage) => {
      if (!activeSessionId) return;
      await removeMessage(activeSessionId, message.id);
    },
    [activeSessionId, removeMessage]
  );

  const hasVisibleMessages = useMemo(
    () =>
      conversation.some(
        (message) =>
          message.variant === "prompt" || (message.variant === "response" && !message.greeting)
      ),
    [conversation]
  );

  const chatInitiated = loading || hasVisibleMessages;

  const isSendDisabled = useMemo(() => {
    const trimmed = prompt.trim();

    return !trimmed || loading || storageLoading || isComposerLocked;
  }, [isComposerLocked, loading, prompt, storageLoading]);

  const handleSend = useCallback(async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt || loading || storageLoading || isComposerLocked) return;

    Keyboard.dismiss();

    setPrompt("");
    await send(trimmedPrompt);
  }, [isComposerLocked, loading, prompt, send, storageLoading]);

  const handleRetry = useCallback(async () => {
    if (!retryContext || loading || storageLoading) return;

    await retry();
  }, [loading, retry, retryContext, storageLoading]);

  useEffect(() => {
    if (!storageLoading && !activeSessionId) {
      createSession();
    }
  }, [storageLoading, activeSessionId, createSession]);

  return (
    <KeyboardGestureArea interpolator="ios" style={layout.flex1}>
      <KeyboardAvoidingView
        keyboardVerticalOffset={80}
        behavior="translate-with-padding"
        style={[spacing.pdXl, layout.flex1]}
      >
        <View style={[layout.flex1, spacing.gapDefault]}>
          <Text
            fontVariant="light"
            fontSize={14}
            style={[text.textCenter, spacing.pdVerticalDefault]}
          >
            תשובות כלליות בלבד, פנו למאמן להכוונה מדויקת
          </Text>

          <ConditionalRender condition={!chatInitiated}>
            <InitialChatContainer />
          </ConditionalRender>
          <ConditionalRender condition={chatInitiated}>
            <ConversationContainer
              conversation={conversation}
              loading={loading}
              onCopyMessage={handleCopyMessage}
              onDeleteMessage={handleDeleteMessage}
              statusBanner={statusBanner}
            />
          </ConditionalRender>

          <ConditionalRender condition={!!retryContext && !loading}>
            <SecondaryButton onPress={handleRetry} alignStart>
              נסו שוב
            </SecondaryButton>
          </ConditionalRender>

          <View style={[layout.flexRow, spacing.gapDefault]}>
            <ChatInput
              style={[colors.backgroundSurface, layout.flex1]}
              placeholder="כתבו כאן"
              onChangeText={setPrompt}
              value={prompt}
              editable={!isComposerLocked}
            />

            <SendButton disabled={isSendDisabled} onPress={handleSend} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </KeyboardGestureArea>
  );
};

export default ChatScreen;
