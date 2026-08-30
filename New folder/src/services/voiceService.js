import { createWebSocket } from '../api/ws';
import { APP_CONFIG } from '../constants/config';

export function createVoiceSession(customUrl, options = {}) {
  const url = customUrl || APP_CONFIG.wsBaseUrl;
  return createWebSocket(url, options);
}
