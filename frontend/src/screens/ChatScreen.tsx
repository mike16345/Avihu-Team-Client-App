import {
  Clipboard,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { generateUniqueId } from "@/utils/utils";
import useChatApi from "@/hooks/api/useChatApi";
import SecondaryButton from "@/components/ui/buttons/SecondaryButton";

interface RetryContext {
  sessionId: string;
  messageId: string;
  prompt: string;
  userId: string;
}

const ChatScreen = () => {
  const { colors, layout, spacing, text } = useStyles();
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { currentUser } = useUserStore();
  const { sendQuery } = useChatApi();

  const {
    isLoading: storageLoading,
    activeSessionId,
    messages,
    meta,
    createSession,
    appendUserMessage,
    appendAssistantMessage,
    updateMessage,
    removeMessage,
    updateSessionMeta,
  } = useChatStorage();

  const [prompt, setPrompt] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = currentUser?._id;

  useEffect(() => {
    if (!storageLoading && !activeSessionId) {
      createSession();
    }
  }, [storageLoading, activeSessionId, createSession]);

  const conversation = useMemo<IChatMessage[]>(() => messages ?? [], [messages]);
  const hasVisibleMessages = useMemo(
    () =>
      conversation.some(
        (message) =>
          message.variant === "prompt" || (message.variant === "response" && !message.greeting)
      ),
    [conversation]
  );
  const chatInitiated = loading || hasVisibleMessages;

  const executeQuery = useCallback(
    async ({
      sessionId,
      question,
      messageId,
      userId,
    }: {
      sessionId: string;
      question: string;
      messageId: string;
      userId: string;
    }) => {
      setLoading(true);
      setRetryContext(null);

      await updateMessage(sessionId, messageId, { error: false });

      try {
        const response = await sendQuery({
          userId,
          sessionId,
          question,
        });

        const responseTimestamp = new Date().toISOString();

        const assistantMessage: IChatMessage = {
          id: generateUniqueId(),
          variant: "response",
          text: response.answer ?? "",
          createdAt: responseTimestamp,
          language: (response.language as IChatMessage["language"]) ?? "he",
          notice: response.notice,
          citations: response.citations ?? [],
          reason: response.reason,
          cached: response.cached,
          usage: response.usage,
          refusal: response.refusal,
          greeting: response.greeting,
        };

        await appendAssistantMessage(sessionId, assistantMessage);

        await updateSessionMeta(sessionId, {
          language: response.language,
          notice: response.notice,
          lastReason: response.reason,
          cached: response.cached,
          refusal: response.refusal,
          greeting: response.greeting,
          updatedAt: responseTimestamp,
        });

        if (response.notice && response.notice !== meta.notice) {
          triggerSuccessToast({
            title: "לתשומת לבך",
            message: response.notice,
          });
        }
      } catch (error: any) {
        console.log(JSON.stringify(error, undefined, 2));
        const status = error?.response?.status;
        const message = error?.response?.data?.message || "אירעה שגיאה בשליחת ההודעה";

        triggerErrorToast({ message });

        const shouldOfferRetry = !status || status >= 500;
        if (shouldOfferRetry) {
          await updateMessage(sessionId, messageId, { error: true });
          setRetryContext({ sessionId, messageId, prompt: question, userId });
        }
      } finally {
        setLoading(false);
      }
    },
    [
      appendAssistantMessage,
      meta.notice,
      sendQuery,
      triggerErrorToast,
      triggerSuccessToast,
      updateMessage,
      updateSessionMeta,
    ]
  );

  const handleSend = useCallback(async () => {
    const trimmedPrompt = prompt?.trim();
    if (!trimmedPrompt || loading || storageLoading) return;

    if (!currentUserId) {
      triggerErrorToast({ message: "אין משתמש" });
      return;
    }

    if (debounceRef.current) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
    }, 400);

    Keyboard.dismiss();

    const sessionId = activeSessionId ?? (await createSession());
    const now = new Date().toISOString();

    const userMessage: IChatMessage = {
      id: generateUniqueId(),
      variant: "prompt",
      text: trimmedPrompt,
      createdAt: now,
      language: "he",
    };

    setLoading(true);
    await appendUserMessage(sessionId, userMessage);
    setPrompt(undefined);

    await executeQuery({
      sessionId,
      question: trimmedPrompt,
      messageId: userMessage.id,
      userId: currentUserId,
    });
  }, [
    activeSessionId,
    appendUserMessage,
    createSession,
    currentUserId,
    executeQuery,
    loading,
    prompt,
    storageLoading,
    triggerErrorToast,
  ]);

  const handleRetry = useCallback(async () => {
    if (!retryContext || loading || storageLoading) return;

    await executeQuery({
      sessionId: retryContext.sessionId,
      question: retryContext.prompt,
      messageId: retryContext.messageId,
      userId: retryContext.userId,
    });
  }, [executeQuery, loading, retryContext, storageLoading]);

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

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const isSendDisabled = useMemo(() => {
    const trimmed = prompt?.trim();

    return !trimmed || loading || storageLoading;
  }, [loading, prompt, storageLoading]);

  return (
    <KeyboardAvoidingView style={layout.flex1} behavior="padding">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[spacing.pdXl, layout.flex1, spacing.gap20]}>
          <Text fontVariant="light" fontSize={14} style={text.textCenter}>
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
              onChangeText={(val) => setPrompt(val)}
              value={prompt ?? ""}
            />

            <SendButton disabled={isSendDisabled} onPress={handleSend} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
