import { useCallback, useEffect, useMemo, useRef } from "react";
import { CHAT_SESSIONS_STORAGE_KEY } from "@/constants/reactQuery";
import {
  IChatMessage,
  IChatPausedState,
  IChatQuotaState,
  IChatSession,
  IChatSessionMeta,
  IChatSessionsState,
} from "@/interfaces/chat";
import { generateUniqueId } from "@/utils/utils";
import useSession from "./useSession";

const INITIAL_STATE: IChatSessionsState = {
  sessions: {},
};

const createEmptySession = (id: string): IChatSession => {
  const now = new Date().toISOString();

  return {
    id,
    createdAt: now,
    updatedAt: now,
    messages: [],
    meta: {
      quota: null,
      paused: null,
    },
  };
};

const useChatStorage = () => {
  const { session, setLocal, removeLocal, isLoading } =
    useSession<IChatSessionsState>(CHAT_SESSIONS_STORAGE_KEY);

  const resolvedState = session ?? INITIAL_STATE;
  const latestStateRef = useRef<IChatSessionsState>(resolvedState);

  const persistState = useCallback(
    async (nextState: IChatSessionsState) => {
      latestStateRef.current = nextState;
      await setLocal(nextState);
    },
    [setLocal]
  );

  const upsertSession = useCallback((state: IChatSessionsState, sessionId: string) => {
    const existing = state.sessions[sessionId];

    if (existing) {
      return {
        ...state.sessions,
        [sessionId]: existing,
      };
    }

    return {
      ...state.sessions,
      [sessionId]: createEmptySession(sessionId),
    };
  }, []);

  const ensureSession = useCallback(
    async (sessionId?: string) => {
      const id = sessionId ?? generateUniqueId();
      const baseState = latestStateRef.current ?? INITIAL_STATE;

      const nextSessions = upsertSession(baseState, id);
      const nextState: IChatSessionsState = {
        ...baseState,
        activeSessionId: id,
        sessions: nextSessions,
      };

      await persistState(nextState);

      return id;
    },
    [persistState, upsertSession]
  );

  const createSession = useCallback(async () => {
    const id = generateUniqueId();
    const baseState = latestStateRef.current ?? INITIAL_STATE;

    const nextState: IChatSessionsState = {
      ...baseState,
      activeSessionId: id,
      sessions: {
        ...baseState.sessions,
        [id]: createEmptySession(id),
      },
    };

    await persistState(nextState);

    return id;
  }, [persistState]);

  const setActiveSession = useCallback(
    async (sessionId: string) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      const nextSessions = upsertSession(baseState, sessionId);

      await persistState({
        ...baseState,
        activeSessionId: sessionId,
        sessions: nextSessions,
      });
    },
    [persistState, upsertSession]
  );

  const appendMessage = useCallback(
    async (sessionId: string, message: IChatMessage) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      const currentSession = baseState.sessions[sessionId] ?? createEmptySession(sessionId);

      const nextSession: IChatSession = {
        ...currentSession,
        updatedAt: message.createdAt,
        messages: [message, ...(currentSession.messages ?? [])],
      };

      const nextState: IChatSessionsState = {
        ...baseState,
        activeSessionId: sessionId,
        sessions: {
          ...baseState.sessions,
          [sessionId]: nextSession,
        },
      };

      await persistState(nextState);
    },
    [persistState]
  );

  const updateMessage = useCallback(
    async (sessionId: string, messageId: string, partial: Partial<IChatMessage>) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      const currentSession = baseState.sessions[sessionId];
      if (!currentSession) return;

      const nextMessages = currentSession.messages.map((message) =>
        message.id === messageId ? { ...message, ...partial } : message
      );

      const nextSession: IChatSession = {
        ...currentSession,
        updatedAt: partial.createdAt ?? new Date().toISOString(),
        messages: nextMessages,
      };

      const nextState: IChatSessionsState = {
        ...baseState,
        sessions: {
          ...baseState.sessions,
          [sessionId]: nextSession,
        },
      };

      console.log("Next state ", JSON.stringify(nextState, null, 2));

      await persistState(nextState);
    },
    [persistState]
  );

  const removeMessage = useCallback(
    async (sessionId: string, messageId: string) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      const currentSession = baseState.sessions[sessionId];
      if (!currentSession) return;

      const nextMessages = currentSession.messages.filter((message) => message.id !== messageId);

      const nextSession: IChatSession = {
        ...currentSession,
        updatedAt: new Date().toISOString(),
        messages: nextMessages,
      };

      const nextState: IChatSessionsState = {
        ...baseState,
        sessions: {
          ...baseState.sessions,
          [sessionId]: nextSession,
        },
      };

      await persistState(nextState);
    },
    [persistState]
  );

  const updateSessionMeta = useCallback(
    async (sessionId: string, meta: Partial<IChatSessionMeta>) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      const currentSession = baseState.sessions[sessionId] ?? createEmptySession(sessionId);

      const nextSession: IChatSession = {
        ...currentSession,
        updatedAt: meta.updatedAt ?? currentSession.updatedAt,
        meta: {
          ...currentSession.meta,
          ...meta,
        },
      };

      const nextState: IChatSessionsState = {
        ...baseState,
        sessions: {
          ...baseState.sessions,
          [sessionId]: nextSession,
        },
      };

      await persistState(nextState);
    },
    [persistState]
  );

  const clearSession = useCallback(
    async (sessionId: string) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      if (!baseState.sessions[sessionId]) return;

      const nextState: IChatSessionsState = {
        ...baseState,
        sessions: {
          ...baseState.sessions,
          [sessionId]: createEmptySession(sessionId),
        },
      };

      await persistState(nextState);
    },
    [persistState]
  );

  const removeSession = useCallback(
    async (sessionId: string) => {
      const baseState = latestStateRef.current ?? INITIAL_STATE;
      if (!baseState.sessions[sessionId]) return;

      const { [sessionId]: _removed, ...rest } = baseState.sessions;
      const nextActiveId =
        baseState.activeSessionId === sessionId ? Object.keys(rest)[0] : baseState.activeSessionId;

      const nextState: IChatSessionsState = {
        activeSessionId: nextActiveId,
        sessions: rest,
      };

      if (!nextActiveId && Object.keys(rest).length === 0) {
        await removeLocal();
        latestStateRef.current = INITIAL_STATE;
        return;
      }

      await persistState(nextState);
    },
    [persistState, removeLocal]
  );

  const activeSession = useMemo(() => {
    if (!resolvedState.activeSessionId) return undefined;
    return resolvedState.sessions[resolvedState.activeSessionId];
  }, [resolvedState]);

  const messages = activeSession?.messages ?? [];
  const meta = activeSession?.meta ?? {};
  const resolvedMeta: IChatSessionMeta = {
    ...meta,
    quota: meta.quota ?? null,
    paused: meta.paused ?? null,
  };

  const appendUserMessage = useCallback(
    async (sessionId: string, message: IChatMessage) => {
      await appendMessage(sessionId, message);
    },
    [appendMessage]
  );

  const appendAssistantMessage = useCallback(
    async (sessionId: string, message: IChatMessage) => {
      await appendMessage(sessionId, message);
    },
    [appendMessage]
  );

  const setSessionPaused = useCallback(
    async (sessionId: string, paused: IChatPausedState | null) => {
      await updateSessionMeta(sessionId, { paused });
    },
    [updateSessionMeta]
  );

  useEffect(() => {
    latestStateRef.current = resolvedState;
  }, [resolvedState]);

  return {
    isLoading,
    state: resolvedState,
    activeSession,
    activeSessionId: resolvedState.activeSessionId,
    messages,
    meta: resolvedMeta,
    ensureSession,
    createSession,
    setActiveSession,
    appendUserMessage,
    appendAssistantMessage,
    updateMessage,
    removeMessage,
    updateSessionMeta,
    clearSession,
    removeSession,
    getSession: (sessionId: string) => resolvedState.sessions[sessionId],
    setSessionPaused,
  };
};

export default useChatStorage;
