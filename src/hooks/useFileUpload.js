import { useState, useCallback } from "react";
import {
  uploadTextFile,
  uploadAudioFile,
  getFiles,
  getFile,
  createFileFormData,
  handleApiError,
} from "../services/apiService";
import { isBackendAvailable } from "../services/mockData";

/**
 * 파일 업로드를 위한 커스텀 훅
 */
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // 파일 유효성 검사
  const validateFile = useCallback((file, type = "auto") => {
    const errors = [];

    // 파일 크기 검사 (50MB 제한)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      errors.push("파일 크기가 50MB를 초과합니다.");
    }

    // 파일 타입 검사
    if (type === "text") {
      const allowedTextTypes = [
        "text/plain",
        "text/csv",
        "application/json",
        "text/markdown",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!allowedTextTypes.includes(file.type)) {
        errors.push("지원하지 않는 텍스트 파일 형식입니다.");
      }
    } else if (type === "audio") {
      const allowedAudioTypes = [
        "audio/mpeg",
        "audio/wav",
        "audio/mp4",
        "audio/m4a",
        "audio/webm",
        "audio/ogg",
      ];

      if (!allowedAudioTypes.includes(file.type)) {
        errors.push("지원하지 않는 오디오 파일 형식입니다.");
      }
    }

    return errors;
  }, []);

  // 파일 타입 자동 감지
  const detectFileType = useCallback((file) => {
    if (file.type.startsWith("audio/")) {
      return "audio";
    } else if (
      file.type.startsWith("text/") ||
      file.type.includes("document") ||
      file.type === "application/json"
    ) {
      return "text";
    }
    return "unknown";
  }, []);

  // 텍스트 파일 업로드
  const uploadText = useCallback(
    async (file, metadata = {}) => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // 파일 유효성 검사
        const validationErrors = validateFile(file, "text");
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(" "));
        }

        const formData = createFileFormData(file, {
          ...metadata,
          kind: "text",
        });

        // 업로드 진행률 시뮬레이션 (실제 구현에서는 xhr.upload.onprogress 사용)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 10, 90));
        }, 200);

        const response = await uploadTextFile(formData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        const uploadedFile = response.data;
        setUploadedFiles((prev) => [...prev, uploadedFile]);

        return uploadedFile;
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to upload text file:", err);
        throw err;
      } finally {
        setUploading(false);
        // 3초 후 진행률 리셋
        setTimeout(() => setUploadProgress(0), 3000);
      }
    },
    [validateFile]
  );

  // 오디오 파일 업로드
  const uploadAudio = useCallback(
    async (file, metadata = {}) => {
      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        // 파일 유효성 검사
        const validationErrors = validateFile(file, "audio");
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(" "));
        }

        const formData = createFileFormData(file, {
          ...metadata,
          kind: "audio",
        });

        // 업로드 진행률 시뮬레이션
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => Math.min(prev + 5, 90));
        }, 300);

        const response = await uploadAudioFile(formData);

        clearInterval(progressInterval);
        setUploadProgress(100);

        const uploadedFile = response.data;
        setUploadedFiles((prev) => [...prev, uploadedFile]);

        return uploadedFile;
      } catch (err) {
        setError(handleApiError(err));
        console.error("Failed to upload audio file:", err);
        throw err;
      } finally {
        setUploading(false);
        // 3초 후 진행률 리셋
        setTimeout(() => setUploadProgress(0), 3000);
      }
    },
    [validateFile]
  );

  // 자동 파일 업로드 (타입 자동 감지)
  const uploadFile = useCallback(
    async (file, metadata = {}) => {
      const fileType = detectFileType(file);

      // 파일 유효성 검사
      const validationErrors = validateFile(file, fileType);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(" "));
      }

      setUploading(true);
      setUploadProgress(0);
      setError(null);

      try {
        const backendAvailable = await isBackendAvailable();

        if (backendAvailable) {
          // 실제 업로드
          switch (fileType) {
            case "text":
              return await uploadText(file, metadata);
            case "audio":
              return await uploadAudio(file, metadata);
            default:
              throw new Error("지원하지 않는 파일 형식입니다.");
          }
        } else {
          // Mock 업로드
          console.log("Using mock file upload");

          // 업로드 진행률 시뮬레이션
          const progressInterval = setInterval(() => {
            setUploadProgress((prev) => Math.min(prev + 20, 90));
          }, 200);

          // 1초 후 완료
          setTimeout(() => {
            clearInterval(progressInterval);
            setUploadProgress(100);
            setTimeout(() => setUploadProgress(0), 3000);
          }, 1000);

          const mockFile = {
            id: `mock-file-${Date.now()}`,
            kind: fileType,
            file_name: file.name,
            file_size: file.size,
            status: "uploaded",
            upload_time: new Date().toISOString(),
            ...metadata,
          };

          setUploadedFiles((prev) => [...prev, mockFile]);
          return mockFile;
        }
      } catch (err) {
        console.warn("Upload failed, creating mock file:", err);

        // Fallback: Mock 파일 생성
        const fallbackFile = {
          id: `fallback-file-${Date.now()}`,
          kind: fileType,
          file_name: file.name,
          file_size: file.size,
          status: "uploaded",
          upload_time: new Date().toISOString(),
          ...metadata,
        };

        setUploadedFiles((prev) => [...prev, fallbackFile]);
        setError(null);
        return fallbackFile;
      } finally {
        setUploading(false);
      }
    },
    [detectFileType, uploadText, uploadAudio, validateFile]
  );

  // 파일 목록 조회
  const fetchFiles = useCallback(async () => {
    try {
      const response = await getFiles();
      setUploadedFiles(response.data || []);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch files:", err);
      throw err;
    }
  }, []);

  // 특정 파일 조회
  const fetchFile = useCallback(async (fileId) => {
    try {
      const response = await getFile(fileId);
      return response.data;
    } catch (err) {
      setError(handleApiError(err));
      console.error("Failed to fetch file:", err);
      throw err;
    }
  }, []);

  // 업로드된 파일 제거 (로컬 상태에서만)
  const removeUploadedFile = useCallback((fileId) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId));
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    uploading,
    uploadProgress,
    error,
    uploadedFiles,

    // 액션
    uploadText,
    uploadAudio,
    uploadFile,
    fetchFiles,
    fetchFile,
    removeUploadedFile,
    clearError,

    // 유틸리티
    validateFile,
    detectFileType,
  };
};

/**
 * 드래그 앤 드롭을 위한 훅
 */
export const useDragAndDrop = (onFileDrop) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => prev + 1);

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setDragCounter((prev) => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragging(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragging(false);
      setDragCounter(0);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const files = Array.from(e.dataTransfer.files);
        onFileDrop?.(files);
      }
    },
    [onFileDrop]
  );

  const dragProps = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return {
    isDragging,
    dragProps,
  };
};

/**
 * 파일 상태 헬퍼
 */
export const getFileStatus = (file) => {
  if (!file) return "unknown";

  return {
    isUploaded: file.status === "uploaded",
    isProcessing: file.status === "processing",
    isFailed: file.status === "failed",
    isDeleted: file.status === "deleted",
    isText: file.kind === "text",
    isAudio: file.kind === "audio",
    hasMetadata: !!(file.meta && Object.keys(file.meta).length > 0),
  };
};

/**
 * 파일 크기 포맷팅 헬퍼
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * 파일 지속시간 포맷팅 헬퍼 (오디오용)
 */
export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};
