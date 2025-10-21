import { STREAM_ENABLED } from "@/constants/Constants";
import { IRagQueryOverrides, IRagQueryResponse } from "@/interfaces/chat";
import { sendData } from "@/API/api";

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
  const sendQuery = async ({ userId, sessionId, question, overrides }: BuildPayloadParams) => {
    const payload = buildRagQueryPayload({
      userId,
      sessionId,
      question,
      overrides,
    });

    const response = await sendData<IRagQueryResponse>(RAG_QUERY_ENDPOINT, payload);

    return response;
  };

  return {
    sendQuery,
  };
};

export default useChatApi;
