import { useCallback } from "react";
import { STREAM_ENABLED } from "@/constants/Constants";
import {
  IChatPausedState,
  IChatQuotaState,
  IRagQueryOverrides,
  IRagQueryResponse,
} from "@/interfaces/chat";
import { sendData } from "@/API/api";
import useChatStorage from "@/hooks/sessions/useChatStorage";

const RAG_QUERY_ENDPOINT = "rag/query";

interface BuildPayloadParams {
  userId: string;
  sessionId?: string;
  question: string;
  overrides?: IRagQueryOverrides;
}

export const buildRagQueryPayload = ({
  userId,
  sessionId,
  question,
  overrides,
}: BuildPayloadParams) => {
  const payload = {
    userId,
    sessionId,
    question,
    stream: STREAM_ENABLED,
    topK: overrides?.topK ?? 5,
    threshold: overrides?.threshold ?? 0.55,
    cacheThreshold: overrides?.cacheThreshold ?? 0.9,
    metadata: overrides?.metadata ?? {},
  };

  if (!sessionId) {
    delete (payload as any).sessionId;
  }

  return payload;
};

export const useChatApi = () => {
  const { setSessionQuota, setSessionPaused } = useChatStorage();

  const clearPausedState = useCallback(
    async (sessionId?: string) => {
      if (!sessionId) return;
      await setSessionPaused(sessionId, null);
    },
    [setSessionPaused]
  );

  const handleQuotaHit = useCallback(
    async (
      sessionId: string | undefined,
      payload: { limit?: number; resetAt?: string },
      context: { userId: string }
    ) => {
      if (!sessionId || !payload?.limit || !payload?.resetAt) return;

      const quotaState: IChatQuotaState = {
        active: true,
        limit: payload.limit,
        resetAt: payload.resetAt,
      };

      await setSessionQuota(sessionId, quotaState);

      console.info("[Telemetry] rag.daily_quota_hit", {
        userId: context.userId,
        sessionId,
        limit: quotaState.limit,
        resetAt: quotaState.resetAt,
      });
    },
    [setSessionQuota]
  );

  const handlePaused = useCallback(
    async (
      sessionId: string | undefined,
      payload: { message?: string },
      context: { userId: string }
    ) => {
      if (!sessionId || !payload?.message) return;

      const pausedState: IChatPausedState = {
        active: true,
        message: payload.message,
      };

      await setSessionPaused(sessionId, pausedState);

      console.info("[Telemetry] rag.service_paused", {
        userId: context.userId,
        sessionId,
        message: pausedState.message,
      });
    },
    [setSessionPaused]
  );

  const sendQuery = useCallback(
    async ({ userId, sessionId, question, overrides }: BuildPayloadParams) => {
      const payload = buildRagQueryPayload({
        userId,
        sessionId,
        question,
        overrides,
      });

      try {
        const response = await sendData<IRagQueryResponse>(RAG_QUERY_ENDPOINT, payload);

        if (sessionId) {
          await clearPausedState(sessionId);
        }

        return response;
      } catch (error: any) {
        const status = error?.response?.status;
        const data = error?.response?.data ?? {};
        const code = data?.code;

        if (status === 429 && code === "DAILY_LIMIT_REACHED") {
          await handleQuotaHit(sessionId, data, { userId });

          const quotaError = new Error("Daily quota reached");
          (quotaError as any).response = error?.response;
          (quotaError as any).ragError = {
            type: "quota",
            payload: {
              limit: data?.limit,
              resetAt: data?.resetAt,
            },
          };
          throw quotaError;
        }

        if (status === 503 && code === "SERVICE_PAUSED") {
          await handlePaused(sessionId, data, { userId });

          const pausedError = new Error("Service paused");
          (pausedError as any).response = error?.response;
          (pausedError as any).ragError = {
            type: "paused",
            payload: {
              message: data?.message,
            },
          };
          throw pausedError;
        }

        throw error;
      }
    },
    [clearPausedState, handlePaused, handleQuotaHit]
  );

  return {
    sendQuery,
  };
};

export default useChatApi;
