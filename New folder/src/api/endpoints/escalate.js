import { apiRequest } from '../client';

export function escalateConversation(payload) {
  return apiRequest('/escalate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
