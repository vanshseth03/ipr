export const CHAT_STATES = {
  IDLE: 'idle',
  SENDING: 'sending',
  STREAMING: 'streaming',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export const VOICE_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  COMPLETE: 'complete',
  ERROR: 'error',
};

export function canTransition(current, next, transitions) {
  return transitions[current]?.includes(next) ?? false;
}
