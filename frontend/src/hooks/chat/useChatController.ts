import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useChatStorage from "@/hooks/sessions/useChatStorage";
import useChatApi from "@/hooks/api/useChatApi";
import { IChatMessage } from "@/interfaces/chat";
import { generateUniqueId } from "@/utils/utils";
import { useToast } from "@/hooks/useToast";

export interface RetryContext {
  sessionId: string;
  messageId: string;
  prompt: string;
  userId: string;
}

const DEBOUNCE_MS = 400;

const useChatController = (currentUserId?: string, activeSessionId?: string) => {
  const { triggerErrorToast, triggerSuccessToast } = useToast();
  const { sendQuery } = useChatApi();
  const {
    createSession,
    appendUserMessage,
    appendAssistantMessage,
    updateMessage,
    updateSessionMeta,
    meta,
    messages,
  } = useChatStorage();

  const [loading, setLoading] = useState(false);
  const [retryContext, setRetryContext] = useState<RetryContext | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestPrompt = useMemo(() => {
    return messages.find((message) => message.variant === "prompt" && !!message.text);
  }, [messages]);

  const clearDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearDebounce();
    };
  }, [clearDebounce]);

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
        const ragError = error?.ragError as
          | { type: "quota"; payload?: { limit?: number; resetAt?: string } }
          | { type: "paused"; payload?: { message?: string } }
          | undefined;

        if (!ragError || ragError.type === "paused") {
          triggerErrorToast({ message });
        }

        if (ragError?.type === "quota") {
          await updateMessage(sessionId, messageId, { error: true });
        } else {
          const shouldOfferRetry = ragError?.type === "paused" || !status || status >= 500;
          if (shouldOfferRetry) {
            await updateMessage(sessionId, messageId, { error: true });
            setRetryContext({ sessionId, messageId, prompt: question, userId });
          }
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

  const send = useCallback(
    async (rawPrompt: string) => {
      const trimmedPrompt = rawPrompt.trim();
      if (!trimmedPrompt) return;

      if (!currentUserId) {
        triggerErrorToast({ message: "אין משתמש" });
        return;
      }

      if (loading) {
        return;
      }

      if (debounceRef.current) {
        return;
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
      }, DEBOUNCE_MS);

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
      setRetryContext(null);
      await appendUserMessage(sessionId, userMessage);

      await executeQuery({
        sessionId,
        question: trimmedPrompt,
        messageId: userMessage.id,
        userId: currentUserId,
      });
    },
    [
      activeSessionId,
      appendUserMessage,
      createSession,
      currentUserId,
      executeQuery,
      loading,
      triggerErrorToast,
    ]
  );

  const retry = useCallback(async () => {
    if (!retryContext || loading) return;

    await executeQuery({
      sessionId: retryContext.sessionId,
      question: retryContext.prompt,
      messageId: retryContext.messageId,
      userId: retryContext.userId,
    });
  }, [executeQuery, loading, retryContext]);

  const clearRetry = useCallback(() => {
    setRetryContext(null);
  }, []);

  useEffect(() => {
    if (
      !meta.paused?.active ||
      retryContext ||
      !activeSessionId ||
      !currentUserId ||
      messages.length === 0
    ) {
      return;
    }

    if (!latestPrompt?.text) return;

    setRetryContext({
      sessionId: activeSessionId,
      messageId: latestPrompt.id,
      prompt: latestPrompt.text,
      userId: currentUserId,
    });
  }, [
    activeSessionId,
    currentUserId,
    latestPrompt,
    meta.paused?.active,
    messages.length,
    retryContext,
  ]);

  return {
    loading,
    retryContext,
    send,
    retry,
    clearRetry,
  };
};

export default useChatController;
