# Aichatter - 회의 AI 분석 서비스 API 명세서

## 개요

회의 파일(텍스트/오디오)을 업로드하여 AI가 분석하고, 참석자별 액션 아이템을 추출하며, 회의 내용을 요약하는 서비스의 API 명세서입니다.

## Base URL

```
https://api.aichatter.com/v1
```

## 인증

모든 API 요청에는 Authorization 헤더가 필요합니다.

```
Authorization: Bearer {access_token}
```

---

## 1. 파일 업로드 API

### 1.1 텍스트 파일 업로드

**POST** `/files/text/upload`

텍스트 형태의 회의 기록을 업로드합니다.

**Request**

```http
Content-Type: multipart/form-data

{
  "file": File, // .txt, .pdf, .doc, .docx
  "meeting_title": "string (optional)",
  "meeting_date": "YYYY-MM-DD (optional)",
  "meeting_time": "HH:MM (optional)"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "file_name": "string",
    "file_size": 1024,
    "upload_time": "2025-09-26T14:30:00Z",
    "status": "uploaded",
    "processing_estimated_time": 30
  }
}
```

### 1.2 오디오 파일 업로드

**POST** `/files/audio/upload`

오디오 형태의 회의 기록을 업로드합니다.

**Request**

```http
Content-Type: multipart/form-data

{
  "file": File, // .mp3, .wav, .m4a, .ogg
  "meeting_title": "string (optional)",
  "meeting_date": "YYYY-MM-DD (optional)",
  "meeting_time": "HH:MM (optional)"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "file_id": "uuid",
    "file_name": "string",
    "file_size": 1024,
    "upload_time": "2025-09-26T14:30:00Z",
    "duration": 1800,
    "status": "uploaded",
    "processing_estimated_time": 120
  }
}
```

---

## 2. 화자 분리 및 인식 API

### 2.1 화자 분리 시작

**POST** `/audio/speakers/detect`

업로드된 오디오 파일에서 화자를 분리하고 감지합니다.

**Request**

```json
{
  "file_id": "uuid"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "detection_id": "uuid",
    "status": "processing",
    "estimated_completion_time": "2025-09-26T14:32:00Z"
  }
}
```

### 2.2 화자 분리 결과 조회

**GET** `/audio/speakers/detect/{detection_id}`

**Response**

```json
{
  "success": true,
  "data": {
    "detection_id": "uuid",
    "status": "completed", // "processing" | "completed" | "failed"
    "speakers": [
      {
        "speaker_id": "speaker_1",
        "speaker_label": "화자 1",
        "sample_audio_url": "https://api.aichatter.com/audio/samples/speaker_1.wav",
        "sample_duration": 15,
        "total_speaking_time": 450,
        "segments": [
          {
            "start_time": 0,
            "end_time": 30,
            "text": "안녕하세요. 오늘 회의를 시작하겠습니다."
          }
        ]
      }
    ]
  }
}
```

### 2.3 화자 매핑 설정

**POST** `/audio/speakers/mapping`

감지된 화자를 실제 사원과 매핑합니다.

**Request**

```json
{
  "detection_id": "uuid",
  "mappings": [
    {
      "speaker_id": "speaker_1",
      "employee_name": "김철수",
      "employee_id": "EMP001 (optional)"
    },
    {
      "speaker_id": "speaker_2",
      "employee_name": "이영희",
      "employee_id": "EMP002 (optional)"
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "mapping_id": "uuid",
    "mapped_speakers": 2,
    "status": "completed"
  }
}
```

---

## 3. 사원 관리 API

### 3.1 사원 목록 조회

**GET** `/employees`

기존 등록된 사원 목록을 조회합니다.

**Response**

```json
{
  "success": true,
  "data": [
    {
      "employee_id": "EMP001",
      "name": "김철수",
      "department": "마케팅팀",
      "position": "팀장",
      "email": "kimcs@company.com"
    }
  ]
}
```

### 3.2 새 사원 등록

**POST** `/employees`

**Request**

```json
{
  "name": "박새로",
  "department": "개발팀",
  "position": "개발자",
  "email": "parksr@company.com"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "employee_id": "EMP006",
    "name": "박새로",
    "department": "개발팀",
    "position": "개발자",
    "email": "parksr@company.com",
    "created_at": "2025-09-26T14:30:00Z"
  }
}
```

---

## 4. 회의 분석 API

### 4.1 회의 분석 시작

**POST** `/meetings/analyze`

업로드된 파일을 분석하여 회의 내용을 요약하고 액션 아이템을 추출합니다.

**Request**

```json
{
  "file_id": "uuid",
  "mapping_id": "uuid (audio files only)",
  "analysis_options": {
    "extract_action_items": true,
    "generate_summary": true,
    "analyze_sentiment": true,
    "detect_key_topics": true
  }
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "status": "processing",
    "estimated_completion_time": "2025-09-26T14:35:00Z"
  }
}
```

### 4.2 회의 분석 결과 조회

**GET** `/meetings/analyze/{analysis_id}`

**Response**

```json
{
  "success": true,
  "data": {
    "analysis_id": "uuid",
    "meeting_id": "uuid",
    "status": "completed",
    "meeting_info": {
      "title": "Q3 마케팅 전략 회의",
      "date": "2025-09-26",
      "time": "14:30",
      "duration": 1800,
      "participants": ["김철수", "이영희", "박민수", "최지연"]
    },
    "summary": "신제품 출시 계획 논의 및 마케팅 예산 배정. 타겟 고객층 분석과 홍보 전략 수립.",
    "key_topics": ["신제품 출시 계획", "마케팅 예산 배정", "타겟 고객층 분석"],
    "sentiment_analysis": {
      "overall_sentiment": "positive",
      "confidence": 0.85
    },
    "action_items": [
      {
        "id": "action_001",
        "assignee": "김철수",
        "task": "시장 조사 보고서 작성",
        "due_date": "2025-09-30",
        "priority": "high",
        "status": "pending"
      }
    ],
    "participant_statistics": [
      {
        "name": "김철수",
        "speaking_time": 450,
        "speaking_percentage": 25.0,
        "sentiment": "neutral"
      }
    ]
  }
}
```

---

## 5. 회의 기록 관리 API

### 5.1 회의 목록 조회

**GET** `/meetings`

**Query Parameters**

- `sort`: "time" | "participant" (default: "time")
- `limit`: number (default: 20)
- `offset`: number (default: 0)
- `date_from`: "YYYY-MM-DD"
- `date_to`: "YYYY-MM-DD"
- `participant`: "participant_name"

**Response**

```json
{
  "success": true,
  "data": {
    "meetings": [
      {
        "meeting_id": "uuid",
        "title": "Q3 마케팅 전략 회의",
        "date": "2025-09-26",
        "time": "14:30",
        "duration": 1800,
        "participants": ["김철수", "이영희", "박민수", "최지연"],
        "action_items_count": 4,
        "status": "completed"
      }
    ],
    "total": 25,
    "has_more": true
  }
}
```

### 5.2 특정 회의 상세 조회

**GET** `/meetings/{meeting_id}`

**Response**

```json
{
  "success": true,
  "data": {
    "meeting_id": "uuid",
    "title": "Q3 마케팅 전략 회의",
    "date": "2025-09-26",
    "time": "14:30",
    "duration": 1800,
    "participants": ["김철수", "이영희", "박민수", "최지연"],
    "summary": "신제품 출시 계획 논의 및 마케팅 예산 배정. 타겟 고객층 분석과 홍보 전략 수립.",
    "action_items": [
      {
        "id": "action_001",
        "assignee": "김철수",
        "task": "시장 조사 보고서 작성",
        "due_date": "2025-09-30",
        "priority": "high",
        "status": "pending"
      }
    ],
    "full_transcript": "전체 회의 내용 텍스트...",
    "created_at": "2025-09-26T14:30:00Z",
    "updated_at": "2025-09-26T15:45:00Z"
  }
}
```

### 5.3 참석자별 회의 목록 조회

**GET** `/meetings/participants/{participant_name}`

**Response**

```json
{
  "success": true,
  "data": {
    "participant": {
      "name": "김철수",
      "total_meetings": 15,
      "total_action_items": 23
    },
    "meetings": [
      {
        "meeting_id": "uuid",
        "title": "Q3 마케팅 전략 회의",
        "date": "2025-09-26",
        "time": "14:30",
        "role": "participant",
        "speaking_time": 450,
        "action_items_assigned": 2
      }
    ],
    "action_items": [
      {
        "id": "action_001",
        "task": "시장 조사 보고서 작성",
        "due_date": "2025-09-30",
        "meeting_title": "Q3 마케팅 전략 회의",
        "status": "pending"
      }
    ]
  }
}
```

---

## 6. 챗봇 대화 API

### 6.1 대화 세션 시작

**POST** `/chat/sessions`

**Request**

```json
{
  "meeting_id": "uuid (optional)",
  "context_type": "meeting" | "general",
  "initial_message": "string (optional)"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "status": "active",
    "context": {
      "meeting_id": "uuid",
      "meeting_title": "Q3 마케팅 전략 회의"
    },
    "created_at": "2025-09-26T14:30:00Z"
  }
}
```

### 6.2 메시지 전송

**POST** `/chat/sessions/{session_id}/messages`

**Request**

```json
{
  "message": "이 회의의 주요 액션 아이템은 무엇인가요?",
  "message_type": "text"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "message_id": "uuid",
    "user_message": "이 회의의 주요 액션 아이템은 무엇인가요?",
    "bot_response": "Q3 마케팅 전략 회의의 주요 액션 아이템은 다음과 같습니다:\n1. 김철수: 시장 조사 보고서 작성 (9/30까지)\n2. 이영희: 광고 예산안 준비 (10/5까지)...",
    "response_time": 1.2,
    "timestamp": "2025-09-26T14:30:00Z"
  }
}
```

### 6.3 대화 기록 조회

**GET** `/chat/sessions/{session_id}/messages`

**Response**

```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "messages": [
      {
        "message_id": "uuid",
        "type": "bot",
        "content": "회의 내용 요약, action item 추출, 회의 분위기 분석",
        "timestamp": "2025-09-26T14:30:00Z"
      },
      {
        "message_id": "uuid",
        "type": "user",
        "content": "이 회의의 주요 액션 아이템은 무엇인가요?",
        "timestamp": "2025-09-26T14:31:00Z"
      }
    ]
  }
}
```

---

## 7. 액션 아이템 관리 API

### 7.1 액션 아이템 목록 조회

**GET** `/action-items`

**Query Parameters**

- `assignee`: "participant_name"
- `status`: "pending" | "in_progress" | "completed" | "overdue"
- `priority`: "low" | "medium" | "high"
- `due_date_from`: "YYYY-MM-DD"
- `due_date_to`: "YYYY-MM-DD"

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "action_001",
      "assignee": "김철수",
      "task": "시장 조사 보고서 작성",
      "due_date": "2025-09-30",
      "priority": "high",
      "status": "pending",
      "meeting_id": "uuid",
      "meeting_title": "Q3 마케팅 전략 회의",
      "created_at": "2025-09-26T14:30:00Z",
      "updated_at": "2025-09-26T14:30:00Z"
    }
  ]
}
```

### 7.2 액션 아이템 상태 업데이트

**PATCH** `/action-items/{action_id}`

**Request**

```json
{
  "status": "completed",
  "completion_note": "보고서 작성 완료 및 제출"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "action_001",
    "status": "completed",
    "completion_note": "보고서 작성 완료 및 제출",
    "completed_at": "2025-09-28T10:15:00Z",
    "updated_at": "2025-09-28T10:15:00Z"
  }
}
```

---

## 8. 통계 및 분석 API

### 8.1 대시보드 통계

**GET** `/analytics/dashboard`

**Response**

```json
{
  "success": true,
  "data": {
    "total_meetings": 45,
    "total_participants": 12,
    "total_action_items": 156,
    "completed_action_items": 98,
    "pending_action_items": 45,
    "overdue_action_items": 13,
    "average_meeting_duration": 3600,
    "most_active_participants": [
      {
        "name": "김철수",
        "meeting_count": 35,
        "action_item_count": 28
      }
    ],
    "recent_meetings": [
      {
        "meeting_id": "uuid",
        "title": "Q3 마케팅 전략 회의",
        "date": "2025-09-26",
        "participants_count": 4
      }
    ]
  }
}
```

---

## 에러 응답 형식

모든 API에서 에러 발생 시 다음과 같은 형식으로 응답합니다:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details (optional)"
  },
  "timestamp": "2025-09-26T14:30:00Z"
}
```

### 주요 에러 코드

- `INVALID_REQUEST`: 잘못된 요청 형식
- `UNAUTHORIZED`: 인증 실패
- `FORBIDDEN`: 권한 없음
- `NOT_FOUND`: 리소스를 찾을 수 없음
- `FILE_TOO_LARGE`: 파일 크기 초과
- `UNSUPPORTED_FILE_TYPE`: 지원하지 않는 파일 형식
- `PROCESSING_FAILED`: 파일 처리 실패
- `RATE_LIMIT_EXCEEDED`: 요청 한도 초과
- `INTERNAL_SERVER_ERROR`: 서버 내부 오류

---

## 사용 예시

### 전체 워크플로우 예시

1. **파일 업로드**

```bash
curl -X POST "https://api.aichatter.com/v1/files/audio/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@meeting.mp3" \
  -F "meeting_title=Q3 마케팅 전략 회의"
```

2. **화자 분리**

```bash
curl -X POST "https://api.aichatter.com/v1/audio/speakers/detect" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"file_id": "uuid"}'
```

3. **화자 매핑**

```bash
curl -X POST "https://api.aichatter.com/v1/audio/speakers/mapping" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "detection_id": "uuid",
    "mappings": [
      {"speaker_id": "speaker_1", "employee_name": "김철수"},
      {"speaker_id": "speaker_2", "employee_name": "이영희"}
    ]
  }'
```

4. **회의 분석**

```bash
curl -X POST "https://api.aichatter.com/v1/meetings/analyze" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "file_id": "uuid",
    "mapping_id": "uuid",
    "analysis_options": {
      "extract_action_items": true,
      "generate_summary": true
    }
  }'
```

5. **챗봇 대화**

```bash
curl -X POST "https://api.aichatter.com/v1/chat/sessions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"meeting_id": "uuid", "context_type": "meeting"}'
```

---

이 API 명세서는 현재 프론트엔드 코드의 기능을 바탕으로 작성되었으며, 실제 구현 시 세부 사항은 조정될 수 있습니다.
