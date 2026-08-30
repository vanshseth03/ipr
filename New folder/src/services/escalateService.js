import { escalateConversation } from '../api/endpoints/escalate';

export async function submitEscalation(payload) {
  return escalateConversation(payload);
}
