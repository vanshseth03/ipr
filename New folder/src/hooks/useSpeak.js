import { useCallback, useEffect, useState } from 'react';
import { speakText, stopSpeaking } from '../services/ttsService';
import { useSettingsStore } from '../store/settingsStore';

export function useSpeak() {
  const [isSpeakingState, setIsSpeakingState] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const language = useSettingsStore((state) => state.language);

  // messageId is optional — pass the id of the message being read aloud so
  // MessageList can highlight the right per-response Speak button.
  const speak = useCallback(
    (text, options = {}, messageId = null) => {
      if (!text?.trim()) return;

      setSpeakingMessageId(messageId);
      setIsLoadingTTS(true);

      const langMap = {
        hi: 'hi-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        bn: 'bn-IN',
        en: 'en-IN',
      };
      const isDevanagari = /[\u0900-\u097F]/.test(text);
      const isTamil = /[\u0B80-\u0BFF]/.test(text);
      const isTelugu = /[\u0C00-\u0C7F]/.test(text);
      const isBengali = /[\u0980-\u09FF]/.test(text);

      const targetLang =
        options.language ||
        (isDevanagari ? 'hi-IN' : null) ||
        (isTamil ? 'ta-IN' : null) ||
        (isTelugu ? 'te-IN' : null) ||
        (isBengali ? 'bn-IN' : null) ||
        langMap[language] ||
        'en-IN';

      speakText(text, {
        ...options,
        language: targetLang,
        onLoadingStart: () => {
          setIsLoadingTTS(true);
        },
        onLoadingEnd: () => {
          setIsLoadingTTS(false);
        },
        onStart: () => {
          setIsSpeakingState(true);
          setIsLoadingTTS(false);
          options.onStart?.();
        },
        onDone: () => {
          setIsSpeakingState(false);
          setIsLoadingTTS(false);
          setSpeakingMessageId(null);
          options.onDone?.();
        },
        onStopped: () => {
          setIsSpeakingState(false);
          setIsLoadingTTS(false);
          setSpeakingMessageId(null);
          options.onStopped?.();
        },
        onError: (error) => {
          setIsSpeakingState(false);
          setIsLoadingTTS(false);
          setSpeakingMessageId(null);
          options.onError?.(error);
        },
      });
    },
    [language]
  );

  const stop = useCallback(() => {
    stopSpeaking();
    setIsSpeakingState(false);
    setIsLoadingTTS(false);
    setSpeakingMessageId(null);
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  return {
    isSpeaking: isSpeakingState,
    isLoadingTTS,
    speakingMessageId,
    speak,
    stop,
  };
}
