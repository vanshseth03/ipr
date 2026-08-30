export const CHAT_ROLES = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system',
};

export function createChatMessage({
  id,
  role = CHAT_ROLES.USER,
  content = '',
  citations = [],
  confidence = null,
  timestamp,
}) {
  return {
    id: id ?? `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    role,
    content: String(content),
    citations: Array.isArray(citations) ? citations : [],
    confidence: typeof confidence === 'number'
      ? (confidence <= 1 ? Math.round(confidence * 100) : confidence)
      : null,
    timestamp: timestamp ?? new Date().toISOString(),
  };
}
