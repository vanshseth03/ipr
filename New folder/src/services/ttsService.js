import { APP_CONFIG } from '../constants/config';
import { useAuthStore } from '../store/authStore';

/**
 * OmniVoice TTS Service
 * =====================
 * Primary: Calls /api/tts on the Kaggle server to get OmniVoice-synthesized WAV audio.
 * Fallback: Uses browser SpeechSynthesis (expo-speech) if server is unreachable.
 *
 * Returns a Promise that resolves when audio starts playing.
 */

let _currentAudio = null; // Track currently playing audio for stop()

/**
 * Speak text using OmniVoice server TTS.
 * @param {string} text - Text to speak
 * @param {Object} options - { language, onStart, onDone, onStopped, onError, onLoadingStart, onLoadingEnd }
 * @returns {Promise<void>}
 */
export async function speakText(text, options = {}) {
  if (!text || !text.trim()) return;

  // Stop any currently playing audio first
  stopSpeaking();

  const { onStart, onDone, onStopped, onError, onLoadingStart, onLoadingEnd } = options;

  // Signal loading started
  if (onLoadingStart) onLoadingStart();

  try {
    // Try OmniVoice server first
    const ttsUrl = `${APP_CONFIG.apiBaseUrl}/tts`;
    const token = useAuthStore.getState().accessToken;

    const response = await fetch(ttsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'bypass-tunnel-reminder': '1',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text: text.substring(0, 2000), // Server truncates at 2000 anyway
        language: options.language === 'hi-IN' ? 'hi' : 'en',
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS server returned ${response.status}`);
    }

    // Get audio blob
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    // Signal loading ended
    if (onLoadingEnd) onLoadingEnd();

    // Play using Web Audio API
    const audio = new Audio(audioUrl);
    _currentAudio = audio;

    audio.onplay = () => {
      if (onStart) onStart();
    };

    audio.onended = () => {
      _currentAudio = null;
      URL.revokeObjectURL(audioUrl);
      if (onDone) onDone();
    };

    audio.onerror = (err) => {
      _currentAudio = null;
      URL.revokeObjectURL(audioUrl);
      console.warn('[TTS] Audio playback error:', err);
      if (onError) onError(err);
    };

    await audio.play();
  } catch (err) {
    console.warn('[TTS] OmniVoice failed, falling back to browser TTS:', err.message);

    // Signal loading ended (even on error)
    if (onLoadingEnd) onLoadingEnd();

    // Fallback to browser SpeechSynthesis
    try {
      _fallbackBrowserTTS(text, options);
    } catch (fallbackErr) {
      console.warn('[TTS] Browser fallback also failed:', fallbackErr);
      if (onError) onError(fallbackErr);
    }
  }
}

/**
 * Fallback: Browser native SpeechSynthesis (expo-speech equivalent on web).
 */
function _fallbackBrowserTTS(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (options.onError) options.onError(new Error('No speech synthesis available'));
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options.language || 'en-IN';
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;

  utterance.onstart = () => {
    if (options.onStart) options.onStart();
  };
  utterance.onend = () => {
    if (options.onDone) options.onDone();
  };
  utterance.onerror = (e) => {
    if (options.onError) options.onError(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Stop any currently playing audio (OmniVoice or browser TTS).
 */
export function stopSpeaking() {
  // Stop OmniVoice audio
  if (_currentAudio) {
    try {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
      _currentAudio = null;
    } catch (err) {
      console.warn('[TTS] Stop error:', err.message);
    }
  }

  // Stop browser TTS
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (err) {
      console.warn('[TTS] Browser stop error:', err.message);
    }
  }
}

/**
 * Check if currently speaking.
 */
export function isSpeaking() {
  if (_currentAudio && !_currentAudio.paused && !_currentAudio.ended) {
    return true;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
