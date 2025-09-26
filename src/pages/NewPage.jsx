import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ChatInterface from "../components/ChatInterface.jsx";
import styled from "styled-components";
import { useFileUpload } from "../hooks/useFileUpload";
import { useMeetings, createMeetingFromFile } from "../hooks/useMeetings";

const PageContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  color: #ffffff;
  font-size: 2.5rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  color: #cccccc;
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.5;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
`;

const UploadButton = styled.button`
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #ffffff;
  border: none;
  padding: 1.5rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 195, 247, 0.3);
  }

  svg {
    width: 2rem;
    height: 2rem;
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileStatus = styled.div`
  color: #4fc3f7;
  font-size: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(79, 195, 247, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(79, 195, 247, 0.3);
`;

const ProceedButton = styled.button`
  background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
  color: #ffffff;
  border: none;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-top: 1rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(79, 195, 247, 0.3);
  }
`;

// 화자 매핑 관련 스타일
const SpeakerMappingContainer = styled.div`
  width: 100%;
  max-width: 800px;
  background: rgba(45, 45, 45, 0.8);
  border-radius: 1rem;
  padding: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SpeakerMappingTitle = styled.h2`
  color: #ffffff;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const SpeakerMappingSubtitle = styled.p`
  color: #cccccc;
  font-size: 1rem;
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
`;

const SpeakerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const SpeakerItem = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const SpeakerLabel = styled.div`
  color: #4fc3f7;
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const MappingOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MappingOption = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SelectContainer = styled.div`
  flex: 1;
`;

const Select = styled.select`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    border-color: #4fc3f7;
    outline: none;
  }

  option {
    background: #2d2d2d;
    color: #ffffff;
  }
`;

const NewEmployeeInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: #ffffff;
  font-size: 1rem;

  &:focus {
    border-color: #4fc3f7;
    outline: none;
  }

  &::placeholder {
    color: #999999;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ffffff;
  cursor: pointer;

  input[type="radio"] {
    accent-color: #4fc3f7;
  }
`;

// 오디오 플레이어 관련 스타일
const AudioPlayerContainer = styled.div`
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const PlayButton = styled.button`
  background: #4fc3f7;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  color: #ffffff;

  &:hover {
    background: #29b6f6;
  }

  &:disabled {
    background: #666666;
    cursor: not-allowed;
  }
`;

const AudioInfo = styled.div`
  flex: 1;
  color: #4fc3f7;
`;

const AudioTitle = styled.div`
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const AudioDuration = styled.div`
  font-size: 0.9rem;
  opacity: 0.8;
`;

const WaveformContainer = styled.div`
  flex: 2;
  height: 30px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
`;

const WaveformBar = styled.div`
  display: inline-block;
  width: 2px;
  background: #4fc3f7;
  margin-right: 1px;
  border-radius: 1px;
  opacity: 0.7;
`;

const NewPage = () => {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState("upload"); // 'upload' | 'speaker-mapping' | 'chat'
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);

  // URL에서 회의 ID 가져오기
  const meetingIdFromUrl = searchParams.get("meetingId");

  // 파일 업로드 훅
  const {
    uploading,
    uploadProgress,
    error: uploadError,
    uploadFile,
    clearError,
  } = useFileUpload();

  // 회의 관리 훅
  const { meetings } = useMeetings();

  // URL에 회의 ID가 있으면 해당 회의로 바로 채팅 시작
  useEffect(() => {
    if (meetingIdFromUrl) {
      const meeting = meetings.find((m) => m.id === meetingIdFromUrl);
      if (meeting) {
        setCurrentMeeting(meeting);
        setStep("chat");
      }
    }
  }, [meetingIdFromUrl, meetings]);

  // 하드코딩된 데이터 (나중에 API로 대체)
  const detectedSpeakers = ["화자 1", "화자 2", "화자 3"]; // AI 모델에서 감지된 화자들
  const existingEmployees = ["김철수", "이영희", "박민수", "최지연", "정현우"]; // 기존 사원 목록

  // 하드코딩된 화자별 오디오 샘플 (실제로는 AI가 분리한 오디오 파일)
  const speakerAudioSamples = {
    "화자 1": {
      duration: "0:15",
      // 실제 환경에서는 분리된 오디오 파일 URL이 들어감
      audioUrl: null, // 임시로 null
    },
    "화자 2": {
      duration: "0:12",
      audioUrl: null,
    },
    "화자 3": {
      duration: "0:18",
      audioUrl: null,
    },
  };
  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    clearError();

    try {
      // 파일 업로드
      const uploadedFileData = await uploadFile(file, {
        title: `${type} 파일 - ${file.name}`,
        description: `사용자가 업로드한 ${type} 파일`,
      });

      // 업로드된 파일로 회의 생성
      const meeting = await createMeetingFromFile(uploadedFileData.id, {
        title: `${file.name} 분석`,
        description: `${type} 파일을 기반으로 한 회의 분석`,
      });

      setCurrentMeeting(meeting);

      if (type === "audio") {
        setStep("speaker-mapping");
      } else {
        setStep("chat");
      }
    } catch (error) {
      console.error("파일 업로드 실패:", error);
      alert("파일 업로드에 실패했습니다. 다시 시도해주세요.");
    }
  };

  const handleProceedToChat = () => {
    if (currentMeeting) {
      setStep("chat");
    }
  };

  const handleSpeakerMappingComplete = () => {
    setStep("chat");
  };

  const handleMappingTypeChange = (speakerIndex, type, event) => {
    const speakerItem = event.target.closest(".speaker-item");
    const selectElement = speakerItem.querySelector("select");
    const inputElement = speakerItem.querySelector('input[type="text"]');

    if (type === "existing") {
      selectElement.disabled = false;
      inputElement.disabled = true;
      inputElement.value = "";
    } else {
      selectElement.disabled = true;
      selectElement.value = "";
      inputElement.disabled = false;
    }
  };

  const handlePlayAudio = (speakerName) => {
    // 실제 환경에서는 분리된 오디오 파일을 재생
    // 현재는 하드코딩된 샘플로 시뮬레이션

    // 다른 오디오가 재생 중이면 중지
    if (currentlyPlaying && currentlyPlaying !== speakerName) {
      setCurrentlyPlaying(null);
    }

    if (currentlyPlaying === speakerName) {
      // 현재 재생 중인 오디오 중지
      setCurrentlyPlaying(null);
    } else {
      // 새 오디오 재생 시작
      setCurrentlyPlaying(speakerName);

      // 실제 환경에서는 여기서 오디오 파일을 재생
      // 화자별 다른 재생 시간으로 시뮬레이션
      const duration =
        speakerName === "화자 1"
          ? 15000
          : speakerName === "화자 2"
          ? 12000
          : 18000;

      setTimeout(() => {
        setCurrentlyPlaying(null);
      }, duration);
    }
  };

  const generateWaveform = () => {
    // 시뮬레이션을 위한 랜덤 웨이브폼 생성
    const bars = [];
    for (let i = 0; i < 50; i++) {
      const height = Math.random() * 20 + 5;
      bars.push(<WaveformBar key={i} style={{ height: `${height}px` }} />);
    }
    return bars;
  };

  const handleUploadButtonClick = (type) => {
    const input = document.getElementById(`${type}-input`);
    input.click();
  };

  if (step === "chat") {
    return (
      <PageContainer>
        <ChatInterface meetingId={currentMeeting?.id} />
      </PageContainer>
    );
  }

  if (step === "speaker-mapping") {
    return (
      <PageContainer>
        <SpeakerMappingContainer>
          <SpeakerMappingTitle>화자 매핑</SpeakerMappingTitle>
          <SpeakerMappingSubtitle>
            감지된 화자들을 실제 사원과 매핑해주세요
          </SpeakerMappingSubtitle>

          <SpeakerList>
            {detectedSpeakers.map((speaker, index) => (
              <SpeakerItem key={index} className="speaker-item">
                <SpeakerLabel>{speaker}</SpeakerLabel>

                <AudioPlayerContainer>
                  <PlayButton
                    onClick={() => handlePlayAudio(speaker)}
                    title={`${speaker} 음성 샘플 재생`}
                  >
                    {currentlyPlaying === speaker ? "⏸️" : "▶️"}
                  </PlayButton>

                  <AudioInfo>
                    <AudioTitle>{speaker} 음성 샘플</AudioTitle>
                    <AudioDuration>
                      재생 시간:{" "}
                      {speakerAudioSamples[speaker]?.duration || "0:00"}
                    </AudioDuration>
                  </AudioInfo>

                  <WaveformContainer>{generateWaveform()}</WaveformContainer>
                </AudioPlayerContainer>

                <RadioGroup>
                  <RadioOption>
                    <input
                      type="radio"
                      name={`speaker-${index}`}
                      value="existing"
                      defaultChecked
                      onChange={(e) =>
                        handleMappingTypeChange(index, "existing", e)
                      }
                    />
                    기존 사원 선택
                  </RadioOption>
                  <RadioOption>
                    <input
                      type="radio"
                      name={`speaker-${index}`}
                      value="new"
                      onChange={(e) => handleMappingTypeChange(index, "new", e)}
                    />
                    새 사원 추가
                  </RadioOption>
                </RadioGroup>

                <MappingOptions>
                  <MappingOption>
                    <SelectContainer>
                      <Select>
                        <option value="">사원을 선택하세요</option>
                        {existingEmployees.map((employee, empIndex) => (
                          <option key={empIndex} value={employee}>
                            {employee}
                          </option>
                        ))}
                      </Select>
                    </SelectContainer>
                  </MappingOption>

                  <MappingOption>
                    <NewEmployeeInput
                      type="text"
                      placeholder="새 사원 이름을 입력하세요"
                      disabled
                    />
                  </MappingOption>
                </MappingOptions>
              </SpeakerItem>
            ))}
          </SpeakerList>

          <ProceedButton onClick={handleSpeakerMappingComplete}>
            매핑 완료 및 채팅 시작
          </ProceedButton>
        </SpeakerMappingContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <UploadContainer>
        <Title>파일 업로드</Title>
        <Subtitle>
          텍스트 파일 또는 오디오 파일을 업로드하여 AI와 대화를 시작하세요
        </Subtitle>

        <ButtonGroup>
          <UploadButton onClick={() => handleUploadButtonClick("text")}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            Text 업로드
          </UploadButton>

          <UploadButton onClick={() => handleUploadButtonClick("audio")}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z" />
            </svg>
            Audio 업로드
          </UploadButton>
        </ButtonGroup>

        <FileInput
          id="text-input"
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={(e) => handleFileUpload(e, "text")}
        />

        <FileInput
          id="audio-input"
          type="file"
          accept=".mp3,.wav,.m4a,.ogg"
          onChange={(e) => handleFileUpload(e, "audio")}
        />

        {uploading && (
          <FileStatus>📤 파일 업로드 중... {uploadProgress}%</FileStatus>
        )}

        {uploadError && (
          <FileStatus style={{ color: "#ff6b6b" }}>
            ❌ 업로드 실패: {uploadError}
          </FileStatus>
        )}

        {currentMeeting && (
          <div>
            <FileStatus>
              ✅ 파일이 업로드되었습니다: {currentMeeting.title}
            </FileStatus>
            <ProceedButton onClick={handleProceedToChat}>
              채팅 시작하기
            </ProceedButton>
          </div>
        )}
      </UploadContainer>
    </PageContainer>
  );
};

export default NewPage;
