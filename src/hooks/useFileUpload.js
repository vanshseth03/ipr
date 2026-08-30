import { useCallback, useState } from 'react';
import {
  pickDocument,
  pickImage,
  uploadSelectedFile,
} from '../services/fileService';
import { useAuthStore } from '../store/authStore';

export function useFileUpload() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const token = useAuthStore((state) => state.accessToken);

  const selectDocument = useCallback(async () => {
    setError(null);
    try {
      const selected = await pickDocument();
      if (selected) {
        setFile(selected);
      }
      return selected;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  const selectImage = useCallback(async () => {
    setError(null);
    try {
      const selected = await pickImage();
      if (selected) {
        setFile(selected);
      }
      return selected;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  const upload = useCallback(async () => {
    if (!file) {
      throw new Error('No file selected');
    }

    // File size cap — 10MB
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size && file.size > MAX_SIZE) {
      const err = new Error(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum is 10MB.`);
      setError(err);
      throw err;
    }

    setIsUploading(true);
    setError(null);

    try {
      return await uploadSelectedFile(file, token);
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, [file, token]);

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
  }, []);

  const captureCameraPhoto = useCallback(async () => {
    setError(null);
    try {
      const selected = await capturePhoto();
      if (selected) {
        setFile(selected);
      }
      return selected;
    } catch (err) {
      setError(err);
      return null;
    }
  }, []);

  return {
    file,
    setFile,
    isUploading,
    error,
    selectDocument,
    selectImage,
    captureCameraPhoto,
    upload,
    clearFile,
  };
}
