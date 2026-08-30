import { create } from 'zustand';

export const useUploadStore = create((set) => ({
  file: null,
  uploadProgress: 0,
  isUploading: false,
  error: null,

  setFile: (file) =>
    set({
      file,
      error: null,
      uploadProgress: 0,
    }),

  setUploadProgress: (uploadProgress) => set({ uploadProgress }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setError: (error) => set({ error }),

  clearUpload: () =>
    set({
      file: null,
      uploadProgress: 0,
      isUploading: false,
      error: null,
    }),
}));
