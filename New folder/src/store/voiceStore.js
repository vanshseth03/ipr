import { create } from 'zustand';

export const useVoiceStore = create((set) => ({
  isConnected: false,
  isListening: false,
  isProcessing: false,

  setConnected: (isConnected) => set({ isConnected }),
  setListening: (isListening) => set({ isListening }),
  setProcessing: (isProcessing) => set({ isProcessing }),

  resetVoiceState: () =>
    set({
      isConnected: false,
      isListening: false,
      isProcessing: false,
    }),
}));
