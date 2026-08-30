export const VOICE_STATES = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  ERROR: 'error',
};

export function createVoiceState(overrides = {}) {
  return {
    status: VOICE_STATES.IDLE,
    transcript: '',
    error: null,
    ...overrides,
  };
}
