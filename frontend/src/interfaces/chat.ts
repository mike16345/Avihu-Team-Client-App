export type ChatReason =
  | "ANSWER_GENERATED"
  | "CACHE_HIT"
  | "CACHE_REFUSAL"
  | "NOT_FITNESS"
  | "RETRIEVAL_EMPTY"
  | "GREETING"
  | "BLOCKED";

export interface IChatCitation {
  marker: string;
  sourceId?: string;
  page?: number;
  score?: number;
}

export interface IChatMessage {
  id: string;
  variant: "response" | "prompt";
  text: string;
  createdAt: string;
  language?: "he" | "en";
  notice?: string;
  citations?: IChatCitation[];
  reason?: ChatReason;
  cached?: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  refusal?: boolean;
  greeting?: boolean;
  error?: boolean;
  loading?: boolean;
}

export interface IChatQuotaState {
  active: boolean;
  limit: number;
  resetAt: string;
}

export interface IChatPausedState {
  active: boolean;
  message: string;
}

export interface IChatSessionMeta {
  language?: string;
  notice?: string;
  lastReason?: ChatReason;
  cached?: boolean;
  refusal?: boolean;
  greeting?: boolean;
  updatedAt?: string;
  quota?: IChatQuotaState | null;
  paused?: IChatPausedState | null;
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
  refusal?: boolean;
  greeting?: boolean;
}
