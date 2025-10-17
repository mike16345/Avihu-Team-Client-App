import { Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, View } from "react-native";
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
    updateSessionMeta,
  } = useChatStorage();

  const [prompt, setPrompt] = useState<string>();
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserId = currentUser?._id;

  useEffect(() => {
    if (!storageLoading && !activeSessionId) {
      createSession();
    }
  }, [storageLoading, activeSessionId, createSession]);

  const conversation = useMemo<IChatMessage[]>(() => messages ?? [], [messages]);
  const chatInitiated = loading || conversation.length > 0;

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

    await appendUserMessage(sessionId, userMessage);
    setPrompt(undefined);
    setLoading(true);

    try {
      const response = await sendQuery({
        userId: currentUserId,
        sessionId,
        question: trimmedPrompt,
      });

      const responseText = response.answer || "";
      const responseTimestamp = new Date().toISOString();

      const assistantMessage: IChatMessage = {
        id: generateUniqueId(),
        variant: "response",
        text: responseText,
        createdAt: responseTimestamp,
        language: response.language,
        notice: response.notice,
        citations: response.citations ?? [],
        reason: response.reason,
        cached: response.cached,
      };

      await appendAssistantMessage(sessionId, assistantMessage);

      await updateSessionMeta(sessionId, {
        language: response.language,
        notice: response.notice,
        lastReason: response.reason,
        cached: response.cached,
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

      if (status === 429) {
        // Allow button re-enable after notifying
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  }, [
    activeSessionId,
    appendAssistantMessage,
    appendUserMessage,
    createSession,
    currentUserId,
    loading,
    meta.notice,
    prompt,
    sendQuery,
    storageLoading,
    triggerErrorToast,
    triggerSuccessToast,
    updateSessionMeta,
  ]);

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
            <ConversationContainer conversation={conversation} loading={loading} />
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
