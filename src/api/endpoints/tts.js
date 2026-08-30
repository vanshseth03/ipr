import { apiRequest } from '../client';

export function requestTTS(payload) {
  return apiRequest('/tts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
