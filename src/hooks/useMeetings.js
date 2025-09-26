import { useState, useEffect, useCallback } from "react";
import {
  getMeetings,
  createMeeting,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingSummary,
  analyzeMeeting,
  handleApiError,
} from "../services/apiService";
import { mockMeetings, isBackendAvailable } from "../services/mockData";

/**
 * 회의 관리를 위한 커스텀 훅
 */
export const useMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 회의 목록 조회
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 백엔드 연결 상태 확인
      const backendAvailable = await isBackendAvailable();

      if (backendAvailable) {
        const response = await getMeetings();
        setMeetings(response.data || []);
      } else {
        // 백엔드가 없으면 mock 데이터 사용
        console.log("Using mock data for meetings");
        setMeetings(mockMeetings);
      }
    } catch (err) {
      console.warn("API failed, falling back to mock data:", err);
      setMeetings(mockMeetings);
      setError(null); // mock 데이터를 사용하므로 에러 상태 해제
    } finally {
      setLoading(false);
    }
  }, []);

  // 새 회의 생성
  const addMeeting = useCallback(async (meetingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createMeeting(meetingData);
      setMeetings((prev) => [...prev, response.data]);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to create meeting:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 회의 정보 수정
  const editMeeting = useCallback(async (id, meetingData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await updateMeeting(id, meetingData);
      setMeetings((prev) =>
        prev.map((meeting) => (meeting.id === id ? response.data : meeting))
      );
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to update meeting:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 회의 삭제
  const removeMeeting = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((meeting) => meeting.id !== id));
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to delete meeting:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 회의 목록 로드
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return {
    meetings,
    loading,
    error,
    fetchMeetings,
    addMeeting,
    editMeeting,
    removeMeeting,
  };
};

/**
 * 특정 회의 상세 정보를 위한 커스텀 훅
 */
export const useMeeting = (meetingId) => {
  const [meeting, setMeeting] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 회의 상세 정보 조회
  const fetchMeeting = useCallback(async () => {
    if (!meetingId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getMeeting(meetingId);
      setMeeting(response.data);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch meeting:", err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  // 회의 요약 조회
  const fetchSummary = useCallback(async () => {
    if (!meetingId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getMeetingSummary(meetingId);
      setSummary(response.data);
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch meeting summary:", err);
    } finally {
      setLoading(false);
    }
  }, [meetingId]);

  // 회의 분석
  const performAnalysis = useCallback(
    async (analysisData) => {
      setLoading(true);
      setError(null);
      try {
        const response = await analyzeMeeting({
          meeting_id: meetingId,
          ...analysisData,
        });
        return response.data;
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to analyze meeting:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [meetingId]
  );

  useEffect(() => {
    fetchMeeting();
  }, [fetchMeeting]);

  return {
    meeting,
    summary,
    loading,
    error,
    fetchMeeting,
    fetchSummary,
    performAnalysis,
  };
};

/**
 * 회의 생성을 위한 헬퍼 함수들
 */
export const createMeetingFromFile = async (fileId, meetingData = {}) => {
  try {
    const backendAvailable = await isBackendAvailable();

    const newMeeting = {
      id: `meeting-${Date.now()}`,
      title: meetingData.title || "새 회의",
      file_id: fileId,
      status: "completed", // Mock에서는 바로 완료 상태
      date_ymd: new Date().toISOString().split("T")[0],
      time_hm: new Date().toTimeString().slice(0, 5),
      summary: "파일 업로드가 완료되었습니다. 회의 분석이 진행 중입니다.",
      participants: [],
      action_items: [],
      ...meetingData,
    };

    if (backendAvailable) {
      const response = await createMeeting(newMeeting);
      return response.data;
    } else {
      console.log("Creating mock meeting from file");
      return newMeeting;
    }
  } catch (error) {
    console.warn("API failed, creating mock meeting:", error);

    // Fallback meeting
    return {
      id: `fallback-meeting-${Date.now()}`,
      title: meetingData.title || "새 회의 (오프라인)",
      file_id: fileId,
      status: "completed",
      date_ymd: new Date().toISOString().split("T")[0],
      time_hm: new Date().toTimeString().slice(0, 5),
      summary:
        "오프라인 모드에서 생성된 회의입니다. 서버 연결 후 정상적인 분석이 가능합니다.",
      participants: [],
      action_items: [],
      ...meetingData,
    };
  }
};

/**
 * 회의 상태 확인을 위한 헬퍼
 */
export const getMeetingStatus = (meeting) => {
  if (!meeting) return "unknown";

  return {
    isProcessing: meeting.status === "processing",
    isCompleted: meeting.status === "completed",
    isFailed: meeting.status === "failed",
    hasTranscript: !!meeting.full_transcript,
    hasSummary: !!meeting.summary,
    hasAnalysis: !!(meeting.key_topics || meeting.sentiment_overall),
  };
};
