import { useState, useEffect, useCallback } from "react";
import {
  getChatSessions,
  createChatSession,
  getChatSession,
  sendMessage,
  handleApiError,
} from "../services/apiService";
import { isBackendAvailable } from "../services/mockData";

/**
 * 채팅 시스템을 위한 커스텀 훅
 */
export const useChat = (sessionId = null) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  // 채팅 세션 목록 조회
  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getChatSessions();
      setSessions(response.data || []);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch chat sessions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 새 채팅 세션 생성
  const createSession = useCallback(async (sessionData = {}) => {
    setLoading(true);
    setError(null);
    try {
      const backendAvailable = await isBackendAvailable();

      const newSession = {
        id: `session-${Date.now()}`,
        context_type: "general",
        status: "active",
        created_at: new Date().toISOString(),
        ...sessionData,
      };

      if (backendAvailable) {
        const response = await createChatSession(newSession);
        const session = response.data;
        setSessions((prev) => [session, ...prev]);
        setCurrentSession(session);
        setMessages([]);
        return session;
      } else {
        // Mock 모드: 로컬에서 세션 생성
        console.log("Using mock chat session");
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([
          {
            id: "welcome-msg",
            type: "bot",
            content:
              "안녕하세요! 회의 내용에 대해 궁금한 것이 있으시면 언제든 물어보세요. (현재 오프라인 모드)",
            created_at: new Date().toISOString(),
          },
        ]);
        return newSession;
      }
    } catch (err) {
      console.warn("API failed, creating local session:", err);
      // Fallback: 로컬 세션 생성
      const fallbackSession = {
        id: `local-session-${Date.now()}`,
        context_type: "general",
        status: "active",
        created_at: new Date().toISOString(),
        ...sessionData,
      };
      setCurrentSession(fallbackSession);
      setMessages([
        {
          id: "fallback-msg",
          type: "bot",
          content:
            "오프라인 모드입니다. 서버가 연결되면 정상적인 채팅이 가능합니다.",
          created_at: new Date().toISOString(),
        },
      ]);
      setError(null);
      return fallbackSession;
    } finally {
      setLoading(false);
    }
  }, []);

  // 특정 세션의 히스토리 조회
  const fetchSessionHistory = useCallback(async (id) => {
    if (!id) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getChatSession(id);
      const sessionData = response.data;

      setCurrentSession(sessionData);
      setMessages(sessionData.messages || []);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch session history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 메시지 전송
  const sendChatMessage = useCallback(
    async (content, sessionIdOverride = null) => {
      const targetSessionId = sessionIdOverride || currentSession?.id;

      if (!targetSessionId) {
        setError("채팅 세션이 필요합니다.");
        return;
      }

      if (!content.trim()) {
        return;
      }

      const userMessage = {
        type: "user",
        content: content.trim(),
        created_at: new Date().toISOString(),
      };

      // 사용자 메시지를 즉시 UI에 추가
      setMessages((prev) => [...prev, userMessage]);
      setIsTyping(true);
      setError(null);

      try {
        const backendAvailable = await isBackendAvailable();

        if (backendAvailable) {
          const response = await sendMessage(targetSessionId, {
            content: content.trim(),
            type: "user",
          });

          // 백엔드에서 봇 응답까지 함께 온다면
          if (response.data && response.data.bot_response) {
            const botMessage = {
              type: "bot",
              content: response.data.bot_response.content,
              created_at: response.data.bot_response.created_at,
              sources: response.data.bot_response.sources,
            };

            setMessages((prev) => [...prev, botMessage]);
          }

          return response.data;
        } else {
          // Mock 응답 생성
          console.log("Sending mock response");
          setTimeout(() => {
            const mockResponse = {
              type: "bot",
              content: `"${content.trim()}"에 대한 답변입니다. 현재 오프라인 모드로 실제 AI 응답을 받을 수 없습니다. 백엔드 서버를 실행하면 정상적인 응답을 받을 수 있습니다.`,
              created_at: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, mockResponse]);
            setIsTyping(false);
          }, 1000);

          return { message: "오프라인 모드 응답" };
        }
      } catch (err) {
        console.warn("Message send failed, using mock response:", err);

        // Fallback: Mock 응답
        setTimeout(() => {
          const fallbackResponse = {
            type: "bot",
            content:
              "죄송합니다. 현재 서버에 연결할 수 없어 정확한 답변을 드릴 수 없습니다. 잠시 후 다시 시도해주세요.",
            created_at: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, fallbackResponse]);
          setIsTyping(false);
        }, 1000);

        setError(null); // 에러 상태 초기화 (mock 응답을 제공하므로)
        return { message: "fallback 응답" };
      }
    },
    [currentSession]
  );

  // 특정 세션 선택
  const selectSession = useCallback(
    (session) => {
      setCurrentSession(session);
      fetchSessionHistory(session.id);
    },
    [fetchSessionHistory]
  );

  // 세션 삭제 (로컬에서만)
  const removeSession = useCallback(
    (sessionIdToRemove) => {
      setSessions((prev) =>
        prev.filter((session) => session.id !== sessionIdToRemove)
      );

      if (currentSession?.id === sessionIdToRemove) {
        setCurrentSession(null);
        setMessages([]);
      }
    },
    [currentSession]
  );

  // 메시지 지우기
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // sessionId가 제공된 경우 해당 세션 로드
  useEffect(() => {
    if (sessionId) {
      fetchSessionHistory(sessionId);
    }
  }, [sessionId, fetchSessionHistory]);

  return {
    // 상태
    sessions,
    currentSession,
    messages,
    loading,
    error,
    isTyping,

    // 액션
    fetchSessions,
    createSession,
    fetchSessionHistory,
    sendChatMessage,
    selectSession,
    removeSession,
    clearMessages,
  };
};

/**
 * 회의 기반 채팅을 위한 특화된 훅
 */
export const useMeetingChat = (meetingId) => {
  const chatHook = useChat();

  // 회의 기반 세션 생성
  const createMeetingSession = useCallback(async () => {
    if (!meetingId) {
      throw new Error("Meeting ID is required");
    }

    return await chatHook.createSession({
      context_type: "meeting",
      meeting_id: meetingId,
    });
  }, [meetingId, chatHook]);

  // 회의 관련 질문 전송
  const askAboutMeeting = useCallback(
    async (question) => {
      let session = chatHook.currentSession;

      // 세션이 없거나 다른 회의의 세션인 경우 새로 생성
      if (!session || session.meeting_id !== meetingId) {
        session = await createMeetingSession();
      }

      return await chatHook.sendChatMessage(question);
    },
    [meetingId, chatHook, createMeetingSession]
  );

  return {
    ...chatHook,
    createMeetingSession,
    askAboutMeeting,
  };
};

/**
 * 채팅 메시지 타입 체크 헬퍼
 */
export const getMessageType = (message) => {
  return {
    isUser: message.type === "user",
    isBot: message.type === "bot",
    hasSources: !!(message.sources && message.sources.length > 0),
    timestamp: new Date(message.created_at),
  };
};

/**
 * 채팅 세션 상태 헬퍼
 */
export const getSessionStatus = (session) => {
  if (!session) return "unknown";

  return {
    isActive: session.status === "active",
    isClosed: session.status === "closed",
    isMeetingContext: session.context_type === "meeting",
    isGeneralContext: session.context_type === "general",
    hasMessages: !!(session.messages && session.messages.length > 0),
  };
};
