import { apiRequest } from '../client';
import { APP_CONFIG } from '../../constants/config';

export function sendChatMessage(payload) {
  const query = payload.query || payload.message;
  return apiRequest('/chat', {
    method: 'POST',
    body: JSON.stringify({
      ...payload,
      query,
    }),
  });
}

export function getChatHistory() {
  return apiRequest('/chat/history');
}

export function getChatStreamUrl() {
  return APP_CONFIG.sseBaseUrl;
}

