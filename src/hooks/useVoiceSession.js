import { useCallback, useEffect, useRef, useState } from 'react';
import { createVoiceSession } from '../services/voiceService';
import { VOICE_STATES } from '../models/voice';

export function useVoiceSession() {
  const sessionRef = useRef(null);
  const [status, setStatus] = useState(VOICE_STATES.IDLE);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  const connect = useCallback((url) => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setError(null);
    setStatus(VOICE_STATES.CONNECTING);

    sessionRef.current = createVoiceSession(url, {
      onOpen: () => {
        setStatus(VOICE_STATES.CONNECTED);
      },
      onMessage: (data) => {
        if (data?.status) {
          setStatus(data.status);
        }
        if (data?.transcript) {
          setTranscript(data.transcript);
        }
      },
      onError: (err) => {
        setError(err);
        setStatus(VOICE_STATES.ERROR);
      },
      onClose: () => {
        setStatus(VOICE_STATES.IDLE);
      },
    });
  }, []);

  const send = useCallback((data) => {
    sessionRef.current?.send(data);
  }, []);

  const disconnect = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setStatus(VOICE_STATES.IDLE);
  }, []);

  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.close();
      }
    };
  }, []);

  return {
    status,
    transcript,
    isConnected: status === VOICE_STATES.CONNECTED || status === VOICE_STATES.LISTENING || status === VOICE_STATES.PROCESSING,
    isListening: status === VOICE_STATES.LISTENING,
    isProcessing: status === VOICE_STATES.PROCESSING,
    error,
    connect,
    send,
    disconnect,
  };
}
