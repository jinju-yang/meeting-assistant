import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { useMeetings } from "../hooks/useMeetings";

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const HistoryContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(45, 45, 45, 0.8);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const HistoryItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 3px solid #4fc3f7;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  min-height: 60px;
  border: 2px solid rgba(79, 195, 247, 0.3); /* 디버깅용 경계선 */

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 195, 247, 0.2);
    border-color: #4fc3f7; /* 호버시 경계선 색상 변경 */
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const HistoryDate = styled.div`
  color: #4fc3f7;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
  pointer-events: none; /* 자식 요소가 마우스 이벤트를 차단하지 않도록 */
`;

const HistoryText = styled.div`
  color: #cccccc;
  line-height: 1.5;
  font-size: 0.9rem;
  pointer-events: none; /* 자식 요소가 마우스 이벤트를 차단하지 않도록 */
`;

const ActionItemsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActionItem = styled.li`
  background: rgba(255, 255, 255, 0.05);
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-radius: 0.25rem;
  border-left: 2px solid #4fc3f7;
  font-size: 0.85rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: #cccccc;
  font-size: 1.1rem;
  padding: 3rem;
`;

const ParticipantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ParticipantCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  border: 1px solid rgba(79, 195, 247, 0.3);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;

  &:hover {
    background: rgba(79, 195, 247, 0.1);
    border-color: #4fc3f7;
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 195, 247, 0.2);
  }

  ${(props) =>
    props.$isSelected &&
    `
    background: rgba(79, 195, 247, 0.2);
    border-color: #4fc3f7;
  `}
`;

const ParticipantName = styled.div`
  color: #ffffff;
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ParticipantStats = styled.div`
  color: #4fc3f7;
  font-size: 0.9rem;
`;

const BackButton = styled.button`
  background: rgba(79, 195, 247, 0.2);
  border: 1px solid #4fc3f7;
  color: #4fc3f7;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  cursor: pointer;
  margin-bottom: 1rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(79, 195, 247, 0.3);
  }
`;

const ParticipantMeetings = styled.div`
  margin-top: 1rem;
`;

const ActionItemsSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;
  border-left: 3px solid #4fc3f7;
`;

const ActionItemsTitle = styled.h3`
  color: #4fc3f7;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  margin-top: 0;
`;

const HistoryPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const sortBy = searchParams.get("sort") || "time"; // 기본값은 시간순

  // 회의 데이터 가져오기
  const { meetings, loading, error, fetchMeetings } = useMeetings();

  // 컴포넌트 마운트 시 회의 목록 가져오기
  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // 회의 히스토리 데이터 (API에서 가져온 데이터 사용)
  const meetingHistory = meetings.map((meeting) => ({
    id: meeting.id,
    date: meeting.date_ymd || new Date().toISOString().split("T")[0],
    time: meeting.time_hm || "00:00",
    title: meeting.title || "제목 없음",
    summary:
      meeting.summary || meeting.summary5?.join(" ") || "요약 정보가 없습니다.",
    participants: meeting.participants?.map((p) => p.name) || [],
    actionItems:
      meeting.action_items?.map(
        (item) => `${item.assignee}: ${item.task} (${item.due_date}까지)`
      ) || [],
    status: meeting.status,
    keyTopics: meeting.key_topics || [],
    sentiment: meeting.sentiment_overall,
  }));

  // 로딩 및 에러 상태 처리
  if (loading) {
    return (
      <PageContainer>
        <Title>회의 히스토리 로딩 중...</Title>
        <HistoryContainer>
          <EmptyState>📊 회의 데이터를 불러오고 있습니다...</EmptyState>
        </HistoryContainer>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Title>오류 발생</Title>
        <HistoryContainer>
          <EmptyState style={{ color: "#ff6b6b" }}>
            ❌ 회의 데이터를 불러오는데 실패했습니다: {error}
          </EmptyState>
        </HistoryContainer>
      </PageContainer>
    );
  }

  const handleMeetingClick = (meetingId) => {
    // 특정 회의의 챗봇 페이지로 이동 (새 페이지에서 회의 ID와 함께)
    navigate(`/new?meetingId=${meetingId}`);
  };

  // 모든 참석자 목록 추출 (DB 시뮬레이션)
  const allParticipants = [
    ...new Set(meetingHistory.flatMap((meeting) => meeting.participants)),
  ];

  // 각 참석자별 통계 계산
  const participantStats = allParticipants.map((participant) => {
    const participatedMeetings = meetingHistory.filter((meeting) =>
      meeting.participants.includes(participant)
    );
    const actionItems = participatedMeetings.flatMap((meeting) =>
      meeting.actionItems.filter((item) => item.includes(participant))
    );

    return {
      name: participant,
      meetingCount: participatedMeetings.length,
      actionItemCount: actionItems.length,
      participatedMeetings,
      actionItems,
    };
  });

  // 정렬된 회의 데이터
  const sortedMeetingHistory = [...meetingHistory].sort((a, b) => {
    if (sortBy === "participant") {
      // 참석자 수로 정렬 (많은 순서대로)
      return b.participants.length - a.participants.length;
    } else {
      // 시간순 정렬 (최신순)
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB - dateA;
    }
  });

  // 페이지 제목 동적 생성
  const getPageTitle = () => {
    if (sortBy === "participant") {
      return "참석자별 회의 히스토리";
    } else {
      return "시간순 회의 히스토리";
    }
  };

  // 디버깅을 위한 로그
  console.log("HistoryPage rendered, hoveredItem:", hoveredItem);
  console.log("meetingHistory length:", meetingHistory.length);
  console.log("sortBy:", sortBy);

  return (
    <PageContainer>
      <Title>{getPageTitle()}</Title>
      <HistoryContainer>
        {sortBy === "participant" ? (
          selectedParticipant ? (
            // 선택된 참석자의 회의 및 액션 아이템 표시
            <div>
              <BackButton onClick={() => setSelectedParticipant(null)}>
                ← 참석자 목록으로 돌아가기
              </BackButton>
              <Title style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
                {selectedParticipant.name}님의 회의 기록
              </Title>

              <ParticipantMeetings>
                {selectedParticipant.participatedMeetings.map((meeting) => (
                  <HistoryItem
                    key={meeting.id}
                    onClick={() => handleMeetingClick(meeting.id)}
                  >
                    <HistoryDate>
                      {meeting.date} {meeting.time}
                    </HistoryDate>
                    <HistoryText>{meeting.title}</HistoryText>
                    <div
                      style={{
                        marginTop: "0.5rem",
                        color: "#cccccc",
                        fontSize: "0.8rem",
                        pointerEvents: "none",
                      }}
                    >
                      참석자: {meeting.participants.join(", ")}
                    </div>
                  </HistoryItem>
                ))}
              </ParticipantMeetings>

              <ActionItemsSection>
                <ActionItemsTitle>
                  {selectedParticipant.name}님의 액션 아이템
                </ActionItemsTitle>
                {selectedParticipant.actionItems.length > 0 ? (
                  <ActionItemsList>
                    {selectedParticipant.actionItems.map((item, index) => (
                      <ActionItem key={index}>{item}</ActionItem>
                    ))}
                  </ActionItemsList>
                ) : (
                  <div style={{ color: "#cccccc" }}>
                    할당된 액션 아이템이 없습니다.
                  </div>
                )}
              </ActionItemsSection>
            </div>
          ) : (
            // 참석자 목록 표시
            <div>
              <ParticipantGrid>
                {participantStats.map((participant) => (
                  <ParticipantCard
                    key={participant.name}
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <ParticipantName>{participant.name}</ParticipantName>
                    <ParticipantStats>
                      참석 회의: {participant.meetingCount}개<br />
                      액션 아이템: {participant.actionItemCount}개
                    </ParticipantStats>
                  </ParticipantCard>
                ))}
              </ParticipantGrid>
            </div>
          )
        ) : // Time 모드: 기존 회의 목록 표시
        sortedMeetingHistory.length > 0 ? (
          sortedMeetingHistory.map((meeting) => (
            <HistoryItem
              key={meeting.id}
              onMouseEnter={() => {
                console.log("Mouse entered:", meeting.id);
                setHoveredItem(meeting.id);
              }}
              onMouseLeave={() => {
                console.log("Mouse left");
                setHoveredItem(null);
              }}
              onClick={() => {
                console.log("Item clicked:", meeting.id);
                handleMeetingClick(meeting.id);
              }}
            >
              <HistoryDate>
                {meeting.date} {meeting.time}
                {sortBy === "participant" && (
                  <span
                    style={{
                      marginLeft: "1rem",
                      color: "#4fc3f7",
                      fontSize: "0.8rem",
                    }}
                  >
                    ({meeting.participants.length}명 참석)
                  </span>
                )}
              </HistoryDate>
              <HistoryText>{meeting.title}</HistoryText>
              {sortBy === "participant" && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    color: "#cccccc",
                    fontSize: "0.8rem",
                    pointerEvents: "none",
                  }}
                >
                  참석자: {meeting.participants.join(", ")}
                </div>
              )}
            </HistoryItem>
          ))
        ) : (
          <EmptyState>아직 회의 기록이 없습니다.</EmptyState>
        )}
      </HistoryContainer>
    </PageContainer>
  );
};

export default HistoryPage;
