import { APP_CONFIG } from '../constants/config';
import { useSettingsStore } from '../store/settingsStore';
import { VOICE_STATES } from '../models/voice';

let activeWebSocketInstance = null;

export function createWebSocket(customUrl, options = {}) {
  // Prevent multiple simultaneous voice sockets
  if (activeWebSocketInstance) {
    try {
      activeWebSocketInstance.close();
    } catch {
      // ignore
    }
    activeWebSocketInstance = null;
  }

  const isMock = options.mockMode ?? useSettingsStore.getState().mockMode;

  const {
    onOpen,
    onMessage,
    onError,
    onClose,
  } = options;

  if (isMock) {

    let mockInterval = null;
    if (onOpen) onOpen();

    let stepCount = 0;
    mockInterval = setInterval(() => {
      stepCount++;
      if (stepCount === 1) {
        if (onMessage) onMessage({ status: VOICE_STATES.LISTENING, listening: true });
      } else if (stepCount === 2) {
        if (onMessage) onMessage({ status: VOICE_STATES.PROCESSING, transcript: 'Analyzing Ashwagandha patentability...' });
      } else if (stepCount === 3) {
        if (onMessage) onMessage({ status: VOICE_STATES.CONNECTED, listening: false, done: true });
      }
    }, 2000);

    const mockSocket = {
      send(data) {
        console.log('[Mock Voice WS] Received client payload:', data);
      },
      close() {
        if (mockInterval) clearInterval(mockInterval);
        if (onClose) onClose();
      },
    };

    activeWebSocketInstance = mockSocket;
    return mockSocket;
  }

  const wsUrl = customUrl || APP_CONFIG.wsBaseUrl;
  const socket = new WebSocket(wsUrl);

  socket.onopen = (event) => {
    if (onOpen) onOpen(event);
  };

  socket.onmessage = (event) => {
    try {
      const parsed = JSON.parse(event.data);
      if (onMessage) onMessage(parsed);
    } catch {
      if (onMessage) onMessage(event.data);
    }
  };

  socket.onerror = (event) => {
    if (onError) onError(event);
  };

  socket.onclose = (event) => {
    if (activeWebSocketInstance === wrappedSocket) {
      activeWebSocketInstance = null;
    }
    if (onClose) onClose(event);
  };

  const wrappedSocket = {
    send(data) {
      if (socket.readyState === WebSocket.OPEN) {
        const payload = typeof data === 'string' ? data : JSON.stringify(data);
        socket.send(payload);
      }
    },
    close() {
      if (activeWebSocketInstance === wrappedSocket) {
        activeWebSocketInstance = null;
      }
      socket.close();
    },
  };

  activeWebSocketInstance = wrappedSocket;
  return wrappedSocket;
}
