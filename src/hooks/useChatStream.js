import { useCallback, useEffect, useRef, useState } from 'react';
import { createSSEConnection } from '../api/sse';

export function useChatStream() {
  const connectionRef = useRef(null);
  const [streamingText, setStreamingText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);

  const startStream = useCallback((payload) => {
    if (connectionRef.current) {
      connectionRef.current.close();
    }

    setStreamingText('');
    setError(null);
    setIsStreaming(true);

    const connection = createSSEConnection('/chat/stream', {
      payload,
      onOpen: () => {
        setIsStreaming(true);
      },
      onMessage: (data) => {
        if (data?.done) {
          setIsStreaming(false);
          return;
        }

        if (data?.content) {
          setStreamingText(data.content);
        } else if (data?.chunk) {
          setStreamingText((prev) => prev + data.chunk);
        }
      },
      onError: (err) => {
        setError(err);
        setIsStreaming(false);
      },
      onComplete: () => {
        setIsStreaming(false);
      },
    });

    connectionRef.current = connection;
  }, []);

  const stopStream = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.close();
      }
    };
  }, []);

  return {
    streamingText,
    isStreaming,
    error,
    startStream,
    stopStream,
  };
}
