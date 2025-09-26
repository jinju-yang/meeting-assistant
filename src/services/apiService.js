// Backend API Service
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:5000/v1";

/**
 * API 호출을 위한 기본 함수
 * @param {string} endpoint - API 엔드포인트
 * @param {object} options - fetch 옵션
 * @returns {object} API 응답 데이터
 */
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message || `HTTP error! status: ${response.status}`
      );
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * 헬스 체크
 */
export const checkHealth = async () => {
  try {
    const response = await fetch("http://localhost:5000/health");
    return await response.json();
  } catch (error) {
    console.error("Health check failed:", error);
    throw error;
  }
};

// =============================================================================
// 직원 관리 API
// =============================================================================

/**
 * 직원 목록 조회
 */
export const getEmployees = async () => {
  return await apiCall("/employees");
};

/**
 * 새 직원 생성
 * @param {object} employeeData - 직원 정보
 */
export const createEmployee = async (employeeData) => {
  return await apiCall("/employees", {
    method: "POST",
    body: JSON.stringify(employeeData),
  });
};

/**
 * 특정 직원 조회
 * @param {string} id - 직원 ID
 */
export const getEmployee = async (id) => {
  return await apiCall(`/employees/${id}`);
};

/**
 * 직원 정보 수정
 * @param {string} id - 직원 ID
 * @param {object} employeeData - 수정할 직원 정보
 */
export const updateEmployee = async (id, employeeData) => {
  return await apiCall(`/employees/${id}`, {
    method: "PUT",
    body: JSON.stringify(employeeData),
  });
};

/**
 * 직원 삭제 (비활성화)
 * @param {string} id - 직원 ID
 */
export const deleteEmployee = async (id) => {
  return await apiCall(`/employees/${id}`, {
    method: "DELETE",
  });
};

// =============================================================================
// 파일 관리 API
// =============================================================================

/**
 * 파일 목록 조회
 */
export const getFiles = async () => {
  return await apiCall("/files");
};

/**
 * 특정 파일 조회
 * @param {string} id - 파일 ID
 */
export const getFile = async (id) => {
  return await apiCall(`/files/${id}`);
};

/**
 * 텍스트 파일 업로드
 * @param {FormData} formData - 파일 데이터
 */
export const uploadTextFile = async (formData) => {
  return await apiCall("/files/text/upload", {
    method: "POST",
    headers: {}, // FormData는 Content-Type을 자동 설정하므로 제거
    body: formData,
  });
};

/**
 * 오디오 파일 업로드
 * @param {FormData} formData - 파일 데이터
 */
export const uploadAudioFile = async (formData) => {
  return await apiCall("/files/audio/upload", {
    method: "POST",
    headers: {}, // FormData는 Content-Type을 자동 설정하므로 제거
    body: formData,
  });
};

/**
 * 파일 메타데이터 생성
 * @param {object} fileData - 파일 메타데이터
 */
export const createFileMetadata = async (fileData) => {
  return await apiCall("/files", {
    method: "POST",
    body: JSON.stringify(fileData),
  });
};

/**
 * 파일 메타데이터 수정
 * @param {string} id - 파일 ID
 * @param {object} fileData - 수정할 파일 메타데이터
 */
export const updateFileMetadata = async (id, fileData) => {
  return await apiCall(`/files/${id}`, {
    method: "PUT",
    body: JSON.stringify(fileData),
  });
};

/**
 * 파일 삭제
 * @param {string} id - 파일 ID
 */
export const deleteFile = async (id) => {
  return await apiCall(`/files/${id}`, {
    method: "DELETE",
  });
};

// =============================================================================
// 회의 관리 API
// =============================================================================

/**
 * 회의 목록 조회
 */
export const getMeetings = async () => {
  return await apiCall("/meetings");
};

/**
 * 새 회의 생성
 * @param {object} meetingData - 회의 정보
 */
export const createMeeting = async (meetingData) => {
  return await apiCall("/meetings", {
    method: "POST",
    body: JSON.stringify(meetingData),
  });
};

/**
 * 특정 회의 조회
 * @param {string} id - 회의 ID
 */
export const getMeeting = async (id) => {
  return await apiCall(`/meetings/${id}`);
};

/**
 * 회의 정보 수정
 * @param {string} id - 회의 ID
 * @param {object} meetingData - 수정할 회의 정보
 */
export const updateMeeting = async (id, meetingData) => {
  return await apiCall(`/meetings/${id}`, {
    method: "PUT",
    body: JSON.stringify(meetingData),
  });
};

/**
 * 회의 삭제
 * @param {string} id - 회의 ID
 */
export const deleteMeeting = async (id) => {
  return await apiCall(`/meetings/${id}`, {
    method: "DELETE",
  });
};

/**
 * 회의 요약 조회
 * @param {string} id - 회의 ID
 */
export const getMeetingSummary = async (id) => {
  return await apiCall(`/meetings/${id}/summary`);
};

/**
 * 회의 분석 (RAG 처리)
 * @param {object} analysisData - 분석 데이터
 */
export const analyzeMeeting = async (analysisData) => {
  return await apiCall("/meetings/analyze", {
    method: "POST",
    body: JSON.stringify(analysisData),
  });
};

// =============================================================================
// 채팅 & Q&A 시스템 API
// =============================================================================

/**
 * 채팅 세션 목록 조회
 */
export const getChatSessions = async () => {
  return await apiCall("/chat/sessions");
};

/**
 * 새 채팅 세션 생성
 * @param {object} sessionData - 세션 정보
 */
export const createChatSession = async (sessionData) => {
  return await apiCall("/chat/sessions", {
    method: "POST",
    body: JSON.stringify(sessionData),
  });
};

/**
 * 채팅 세션 히스토리 조회
 * @param {string} id - 세션 ID
 */
export const getChatSession = async (id) => {
  return await apiCall(`/chat/sessions/${id}`);
};

/**
 * 메시지 전송
 * @param {string} sessionId - 세션 ID
 * @param {object} messageData - 메시지 데이터
 */
export const sendMessage = async (sessionId, messageData) => {
  return await apiCall(`/chat/sessions/${sessionId}/messages`, {
    method: "POST",
    body: JSON.stringify(messageData),
  });
};

// =============================================================================
// 액션 아이템 관리 API
// =============================================================================

/**
 * 액션 아이템 목록 조회
 */
export const getActionItems = async () => {
  return await apiCall("/action-items");
};

/**
 * 새 액션 아이템 생성
 * @param {object} actionItemData - 액션 아이템 정보
 */
export const createActionItem = async (actionItemData) => {
  return await apiCall("/action-items", {
    method: "POST",
    body: JSON.stringify(actionItemData),
  });
};

/**
 * 액션 아이템 수정
 * @param {string} id - 액션 아이템 ID
 * @param {object} actionItemData - 수정할 액션 아이템 정보
 */
export const updateActionItem = async (id, actionItemData) => {
  return await apiCall(`/action-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(actionItemData),
  });
};

/**
 * 액션 아이템 삭제
 * @param {string} id - 액션 아이템 ID
 */
export const deleteActionItem = async (id) => {
  return await apiCall(`/action-items/${id}`, {
    method: "DELETE",
  });
};

// =============================================================================
// 분석 & 리포트 API
// =============================================================================

/**
 * 회의 분석 데이터 조회
 */
export const getMeetingAnalytics = async () => {
  return await apiCall("/analytics/meetings");
};

/**
 * 참석자 분석 데이터 조회
 */
export const getParticipantAnalytics = async () => {
  return await apiCall("/analytics/participants");
};

/**
 * 액션 아이템 분석 데이터 조회
 */
export const getActionItemAnalytics = async () => {
  return await apiCall("/analytics/action-items");
};

/**
 * 감정 분석 데이터 조회
 */
export const getSentimentAnalytics = async () => {
  return await apiCall("/analytics/sentiment");
};

// =============================================================================
// 오디오 처리 API
// =============================================================================

/**
 * 오디오 파일 업로드
 * @param {FormData} formData - 오디오 파일 데이터
 */
export const uploadAudio = async (formData) => {
  return await apiCall("/audio/upload", {
    method: "POST",
    headers: {}, // FormData는 Content-Type을 자동 설정
    body: formData,
  });
};

/**
 * 오디오 처리 상태 확인
 * @param {string} id - 오디오 ID
 */
export const getAudioStatus = async (id) => {
  return await apiCall(`/audio/${id}/status`);
};

/**
 * 오디오 전사 결과 조회
 * @param {string} id - 오디오 ID
 */
export const getAudioTranscription = async (id) => {
  return await apiCall(`/audio/${id}/transcription`);
};

// =============================================================================
// 유틸리티 함수들
// =============================================================================

/**
 * API 에러 처리 헬퍼
 * @param {Error} error - 에러 객체
 * @returns {string} 사용자 친화적 에러 메시지
 */
export const handleApiError = (error) => {
  if (error.message.includes("fetch")) {
    return "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
  }
  if (error.message.includes("400")) {
    return "잘못된 요청입니다. 입력 데이터를 확인해주세요.";
  }
  if (error.message.includes("401")) {
    return "인증이 필요합니다. 다시 로그인해주세요.";
  }
  if (error.message.includes("403")) {
    return "접근 권한이 없습니다.";
  }
  if (error.message.includes("404")) {
    return "요청한 리소스를 찾을 수 없습니다.";
  }
  if (error.message.includes("500")) {
    return "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
  return error.message || "알 수 없는 오류가 발생했습니다.";
};

/**
 * 파일 업로드를 위한 FormData 생성 헬퍼
 * @param {File} file - 업로드할 파일
 * @param {object} metadata - 추가 메타데이터
 * @returns {FormData}
 */
export const createFileFormData = (file, metadata = {}) => {
  const formData = new FormData();
  formData.append("file", file);

  Object.keys(metadata).forEach((key) => {
    formData.append(key, metadata[key]);
  });

  return formData;
};

const apiService = {
  // Health
  checkHealth,

  // Employee Management
  getEmployees,
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,

  // File Management
  getFiles,
  getFile,
  uploadTextFile,
  uploadAudioFile,
  createFileMetadata,
  updateFileMetadata,
  deleteFile,

  // Meeting Management
  getMeetings,
  createMeeting,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  getMeetingSummary,
  analyzeMeeting,

  // Chat System
  getChatSessions,
  createChatSession,
  getChatSession,
  sendMessage,

  // Action Items
  getActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,

  // Analytics
  getMeetingAnalytics,
  getParticipantAnalytics,
  getActionItemAnalytics,
  getSentimentAnalytics,

  // Audio Processing
  uploadAudio,
  getAudioStatus,
  getAudioTranscription,

  // Utilities
  handleApiError,
  createFileFormData,
};

export default apiService;
