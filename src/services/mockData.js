// Mock data for development when backend is not available
export const mockMeetings = [
  {
    id: "mock-meeting-1",
    title: "Q3 마케팅 전략 회의",
    date_ymd: "2025-09-26",
    time_hm: "14:30",
    status: "completed",
    summary:
      "신제품 출시 계획 논의 및 마케팅 예산 배정. 타겟 고객층 분석과 홍보 전략 수립.",
    summary5: [
      "신제품 출시 계획 수립",
      "마케팅 예산 배정 논의",
      "타겟 고객층 분석",
      "홍보 전략 개발",
      "경쟁사 분석 완료",
    ],
    key_topics: ["신제품", "마케팅", "예산", "고객", "홍보"],
    sentiment_overall: "positive",
    participants: [
      { name: "김철수" },
      { name: "이영희" },
      { name: "박민수" },
      { name: "최지연" },
    ],
    action_items: [
      {
        assignee: "김철수",
        task: "시장 조사 보고서 작성",
        due_date: "2025-09-30",
      },
      {
        assignee: "이영희",
        task: "광고 예산안 준비",
        due_date: "2025-10-05",
      },
    ],
  },
  {
    id: "mock-meeting-2",
    title: "개발팀 스프린트 리뷰",
    date_ymd: "2025-09-25",
    time_hm: "10:00",
    status: "completed",
    summary:
      "2주 스프린트 완료 리뷰 및 다음 스프린트 계획. 버그 수정 현황 점검.",
    summary5: [
      "스프린트 완료 리뷰",
      "다음 스프린트 계획",
      "버그 수정 현황",
      "성능 개선 논의",
      "팀 목표 설정",
    ],
    key_topics: ["스프린트", "개발", "버그", "성능", "계획"],
    sentiment_overall: "neutral",
    participants: [{ name: "정현우" }, { name: "김철수" }, { name: "박민수" }],
    action_items: [
      {
        assignee: "정현우",
        task: "테스트 케이스 추가 작성",
        due_date: "2025-09-27",
      },
      {
        assignee: "김철수",
        task: "API 문서 업데이트",
        due_date: "2025-09-29",
      },
    ],
  },
];

export const mockChatSessions = [
  {
    id: "mock-session-1",
    context_type: "general",
    status: "active",
    created_at: new Date().toISOString(),
    messages: [
      {
        id: "msg-1",
        type: "bot",
        content:
          "안녕하세요! 회의 내용에 대해 궁금한 것이 있으시면 언제든 물어보세요.",
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export const mockFiles = [
  {
    id: "mock-file-1",
    kind: "text",
    file_name: "meeting-notes.txt",
    file_size: 1024,
    status: "uploaded",
    upload_time: new Date().toISOString(),
  },
];

// Check if backend is available
export const isBackendAvailable = async () => {
  try {
    const response = await fetch("http://localhost:5000/health", {
      method: "GET",
      timeout: 3000,
    });
    return response.ok;
  } catch (error) {
    console.warn("Backend not available, using mock data");
    return false;
  }
};
