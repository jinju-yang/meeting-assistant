import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useChat, getMessageType } from "../hooks/useChat";

const ChatContainer = styled.div`
  background: rgba(45, 45, 45, 0.8);
  border-radius: 1rem;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 600px;
  width: 100%;
  max-width: 800px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 1024px) {
    height: 500px;
  }

  @media (max-width: 768px) {
    height: 400px;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(26, 26, 26, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    color: #4fc3f7;
    font-size: 1.2rem;
    margin: 0;
  }
`;

const ClearButton = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(79, 195, 247, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(79, 195, 247, 0.5);
  }
`;

const MessageWrapper = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
`;

const MessageAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const BotAvatar = styled(MessageAvatar)`
  background: #4fc3f7;
  color: #ffffff;
  font-size: 0.8rem;
`;

const UserAvatar = styled(MessageAvatar)`
  background: #666666;
  color: #ffffff;
  font-size: 0.8rem;
`;

const MessageContent = styled.div`
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;

  p {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    line-height: 1.5;
    font-size: 0.9rem;
    margin: 0;
    color: #ffffff;
  }

  ${(props) =>
    props.isBot &&
    `
    p {
      background: rgba(79, 195, 247, 0.1);
    }
  `}
`;

const CopyButton = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.3s ease;
  margin-top: 0.75rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 1rem 1.5rem;
  background: rgba(26, 26, 26, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  gap: 0.75rem;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const ChatInput = styled.input`
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  color: #ffffff;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s ease;

  &::placeholder {
    color: #999999;
  }

  &:focus {
    border-color: #4fc3f7;
  }
`;

const SendButton = styled.button`
  background: #4fc3f7;
  border: none;
  color: #ffffff;
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;

  &:hover {
    background: #29b6f6;
  }
`;

const FileInfo = styled.div`
  background: rgba(79, 195, 247, 0.1);
  border: 1px solid rgba(79, 195, 247, 0.3);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
  color: #4fc3f7;
  text-align: center;

  .file-icon {
    margin-right: 0.5rem;
  }

  .file-name {
    font-weight: 600;
  }

  .file-type {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-top: 0.25rem;
  }
`;

const ChatInterface = ({ uploadedFile, fileType, meetingId = null }) => {
  const [inputValue, setInputValue] = useState("");

  // 일반 채팅 훅 사용 (meetingId가 있으면 회의 컨텍스트로 세션 생성)
  const {
    messages,
    loading,
    isTyping,
    createSession,
    sendChatMessage,
    clearMessages,
    currentSession,
  } = useChat();

  // 컴포넌트 마운트 시 세션 생성
  useEffect(() => {
    if (!currentSession) {
      const sessionData = meetingId
        ? {
            context_type: "meeting",
            meeting_id: meetingId,
          }
        : {
            context_type: "general",
          };

      createSession(sessionData).catch(console.error);
    }
  }, [currentSession, createSession, meetingId]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || loading) return;

    try {
      await sendChatMessage(inputValue);
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    clearMessages();
  };

  return (
    <ChatContainer>
      <ChatHeader>
        <h3>Logo</h3>
        <ClearButton onClick={clearChat}>Clear chat</ClearButton>
      </ChatHeader>

      {uploadedFile && (
        <FileInfo>
          <div className="file-icon">{fileType === "text" ? "📄" : "🎵"}</div>
          <div className="file-name">{uploadedFile.name}</div>
          <div className="file-type">
            {fileType === "text" ? "Text File" : "Audio File"} 업로드됨
          </div>
        </FileInfo>
      )}

      <ChatMessages>
        {messages.map((message, index) => {
          const messageType = getMessageType(message);
          return (
            <MessageWrapper key={message.id || index}>
              {messageType.isBot ? (
                <BotAvatar>🤖</BotAvatar>
              ) : (
                <UserAvatar>👤</UserAvatar>
              )}
              <MessageContent isBot={messageType.isBot}>
                <p>{message.content}</p>
                {messageType.isBot && (
                  <CopyButton
                    onClick={() =>
                      navigator.clipboard.writeText(message.content)
                    }
                  >
                    📋
                  </CopyButton>
                )}
                {messageType.hasSources && (
                  <div
                    style={{
                      marginTop: "0.5rem",
                      fontSize: "0.8rem",
                      opacity: 0.7,
                    }}
                  >
                    출처: {message.sources?.length || 0}개 문서
                  </div>
                )}
              </MessageContent>
            </MessageWrapper>
          );
        })}
        {isTyping && (
          <MessageWrapper>
            <BotAvatar>🤖</BotAvatar>
            <MessageContent isBot={true}>
              <p>답변을 작성 중입니다...</p>
            </MessageContent>
          </MessageWrapper>
        )}
      </ChatMessages>

      <ChatInputContainer>
        <ChatInput
          type="text"
          placeholder="Enter Your Message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <SendButton onClick={handleSendMessage}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SendButton>
      </ChatInputContainer>
    </ChatContainer>
  );
};

export default ChatInterface;
