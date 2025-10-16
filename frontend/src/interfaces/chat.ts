export type ChatReason =
  | "ANSWER_GENERATED"
  | "CACHE_HIT"
  | "NOT_FITNESS"
  | "RETRIEVAL_EMPTY";

export interface IChatCitation {
  marker: string;
  sourceId: string;
  page?: number;
  score?: number;
}

export interface IChatMessage {
  id: string;
  variant: "response" | "prompt";
  text: string;
  createdAt: string;
  language?: string;
  notice?: string;
  citations?: IChatCitation[];
  reason?: ChatReason;
  cached?: boolean;
}

export interface IChatSessionMeta {
  language?: string;
  notice?: string;
  lastReason?: ChatReason;
  cached?: boolean;
  updatedAt?: string;
}

export interface IChatSession {
  id: string;
  messages: IChatMessage[];
  meta?: IChatSessionMeta;
  createdAt: string;
  updatedAt: string;
}

export interface IChatSessionsState {
  activeSessionId?: string;
  sessions: Record<string, IChatSession>;
}

export interface IRagQueryOverrides {
  topK?: number;
  threshold?: number;
  cacheThreshold?: number;
  metadata?: Record<string, unknown>;
}

export interface IRagQueryResponse {
  reason: ChatReason;
  answer: string;
  citations?: IChatCitation[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached?: boolean;
  notice?: string;
  language?: string;
}
