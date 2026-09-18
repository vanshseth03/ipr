import { APP_CONFIG, getBackendUrl, getLastKnownBackendUrl } from '../constants/config';
import { useAuthStore } from '../store/authStore';

/**
 * Clean Markdown and legal texts into natural, clear spoken prose.
 * Expands legal citations (e.g. Novartis v. Union of India -> Novartis versus Union of India),
 * cleans bullet points, numbered lists, section symbols, and collapses stray punctuation.
 */
export function cleanTextForSpeech(raw) {
  if (!raw) return '';
  return raw
    .replace(/^#+\s*(.+)$/gm, '$1. ') // Markdown headers -> full sentence
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold **text** -> text
    .replace(/\*([^*]+)\*/g, '$1') // Italic *text* -> text
    .replace(/__([^_]+)__/g, '$1') // Bold __text__ -> text
    .replace(/_([^_]+)_/g, '$1') // Italic _text_ -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links [text](url) -> text
    .replace(/\[[0-9]+\]/g, '') // Citations [1], [2] -> empty
    .replace(/\[(?:TKDL|Ref|Citation|Vol)[^\]]*\]/gi, '') // Brackets like [TKDL: ...] -> empty
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // Code blocks
    .replace(/^[*\-+•▪▫–—✦★✓\t ]+/gm, '') // List bullets at line start
    .replace(/[•▪▫✦★✓]/g, ' ') // Any standalone bullet symbols
    .replace(/^([0-9]+)\.\s+/gm, 'Point $1: ') // Numbered lists: 1. -> Point 1:
    .replace(/[§]/g, 'Section ') // Symbol § -> Section
    .replace(/\bSec\.\s*/gi, 'Section ') // Sec. -> Section
    .replace(/\bv\.\s+/gi, 'versus ') // Legal citations: Novartis v. Union of India -> Novartis versus Union of India
    .replace(/\bvs\.\s*/gi, 'versus ') // vs. -> versus
    .replace(/\be\.g\.,?\s*/gi, 'for example, ') // e.g. -> for example
    .replace(/\bi\.e\.,?\s*/gi, 'that is, ') // i.e. -> that is
    .replace(/\bw\.r\.t\.\s*/gi, 'with respect to ')
    .replace(/---|\*\*\*|___/g, '') // Dividers
    .replace(/[\r\n]+/g, '. ') // Line breaks -> periods
    .replace(/[:;]\s*\./g, '.') // e.g. ":." -> "."
    .replace(/\.{2,}/g, '.') // Double periods -> single period
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Split cleaned text into coherent, natural sentences for speech synthesis.
 */
export function splitIntoSpokenChunks(cleanText, maxChars = 320) {
  if (!cleanText) return [];
  const sentences = cleanText.split(/(?<=[.!?।])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxChars) {
      const clauses = trimmed.split(/(?<=[,;:\-])\s+/);
      for (const clause of clauses) {
        const ct = clause.trim();
        if (!ct) continue;
        if ((current + ' ' + ct).length <= maxChars) {
          current = current ? current + ' ' + ct : ct;
        } else {
          if (current) chunks.push(current.trim());
          current = ct;
        }
      }
    } else if ((current + ' ' + trimmed).length <= maxChars) {
      current = current ? current + ' ' + trimmed : trimmed;
    } else {
      if (current) chunks.push(current.trim());
      current = trimmed;
    }
  }
  if (current) chunks.push(current.trim());
  return chunks;
}

let _currentAudio = null;
let _userCancelled = false;
let _isSynthesizing = false;

/**
 * Resolve the exact OmniVoice endpoint on the Kaggle GPU server.
 */
async function resolveOmniVoiceEndpoint() {
  let base = APP_CONFIG.apiBaseUrl;
  if (!base) {
    const last = getLastKnownBackendUrl();
    if (last) base = last.endsWith('/api') ? last : `${last}/api`;
  }
  if (!base) {
    try {
      const discovered = await getBackendUrl();
      if (discovered) base = discovered.endsWith('/api') ? discovered : `${discovered}/api`;
    } catch (_) {}
  }
  if (!base && typeof window !== 'undefined' && window.localStorage) {
    const cached = window.localStorage.getItem('ayush_last_server_url');
    if (cached) base = cached.endsWith('/api') ? cached : `${cached}/api`;
  }
  if (!base) return null;
  base = base.replace(/\/+$/, '');
  return `${base}/tts`;
}

/**
 * Speak text using the OmniVoice model installed directly on the Kaggle GPU server.
 * This is the dedicated speech engine for all languages (Hindi, English, etc.).
 */
export async function speakText(text, options = {}) {
  if (!text || !text.trim()) return;

  // Stop any active audio
  stopSpeaking();
  _userCancelled = false;

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return;

  const { onStart, onDone, onStopped, onError, onLoadingStart, onLoadingEnd } = options;
  if (onLoadingStart) onLoadingStart();

  // 1. Pre-unlock Audio element synchronously within user gesture (avoids browser autoplay block)
  let preUnlockedAudio = null;
  if (typeof Audio !== 'undefined') {
    try {
      preUnlockedAudio = new Audio();
      preUnlockedAudio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
      const p = preUnlockedAudio.play();
      if (p && typeof p.then === 'function') {
        p.then(() => {
          preUnlockedAudio.pause();
          preUnlockedAudio.currentTime = 0;
        }).catch(() => {});
      }
    } catch (_) {}
  }

  // 2. Detect language: Devanagari Hindi vs English vs regional
  let apiLang = 'en';
  const optLang = (options.language || '').toLowerCase();
  const isDevanagari = /[\u0900-\u097F]/.test(cleaned);

  if (isDevanagari || optLang === 'hi' || optLang.startsWith('hi') || optLang === 'hindi') {
    apiLang = 'hi';
  } else if (/[\u0B80-\u0BFF]/.test(cleaned) || optLang === 'ta' || optLang.startsWith('ta') || optLang === 'tamil') {
    apiLang = 'ta';
  } else if (/[\u0C00-\u0C7F]/.test(cleaned) || optLang === 'te' || optLang.startsWith('te') || optLang === 'telugu') {
    apiLang = 'te';
  } else if (/[\u0980-\u09FF]/.test(cleaned) || optLang === 'bn' || optLang.startsWith('bn') || optLang === 'bengali') {
    apiLang = 'bn';
  } else if (optLang) {
    apiLang = optLang.split('-')[0];
  }

  // 3. Resolve OmniVoice endpoint
  const ttsUrl = await resolveOmniVoiceEndpoint();
  if (!ttsUrl) {
    if (onLoadingEnd) onLoadingEnd();
    const err = new Error('OmniVoice server is offline. Please start the Kaggle GPU server to use voice output.');
    console.error('[TTS]', err.message);
    onError?.(err);
    return;
  }

  _isSynthesizing = true;

  try {
    const token = useAuthStore.getState().accessToken;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    const response = await fetch(ttsUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Bypass-Tunnel-Reminder': 'true',
        'bypass-tunnel-reminder': '1',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        text: cleaned,
        language: apiLang,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      throw new Error(`OmniVoice server error (HTTP ${response.status}): ${errText || 'synthesis failed'}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);

    if (onLoadingEnd) onLoadingEnd();
    _isSynthesizing = false;

    if (_userCancelled) {
      URL.revokeObjectURL(audioUrl);
      onStopped?.();
      return;
    }

    // 4. Play OmniVoice audio
    const audio = preUnlockedAudio || new Audio();
    _currentAudio = audio;
    audio.src = audioUrl;
    audio.currentTime = 0;

    audio.onplay = () => {
      onStart?.();
    };

    audio.onended = () => {
      _currentAudio = null;
      URL.revokeObjectURL(audioUrl);
      onDone?.();
    };

    audio.onerror = (audioErr) => {
      _currentAudio = null;
      URL.revokeObjectURL(audioUrl);
      console.error('[TTS] Audio element playback error:', audioErr);
      onError?.(new Error('Audio playback failed in browser'));
    };

    await audio.play();
  } catch (err) {
    _isSynthesizing = false;
    if (onLoadingEnd) onLoadingEnd();
    if (_userCancelled) {
      onStopped?.();
      return;
    }
    console.error('[TTS] OmniVoice synthesis error:', err.message);
    onError?.(err);
  }
}

/**
 * Stop any currently playing OmniVoice audio.
 */
export function stopSpeaking() {
  _userCancelled = true;
  _isSynthesizing = false;

  if (_currentAudio) {
    try {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
      _currentAudio = null;
    } catch (_) {}
  }
}

/**
 * Check if OmniVoice is currently speaking or synthesizing.
 */
export function isSpeaking() {
  if (_isSynthesizing) return true;
  if (_currentAudio && !_currentAudio.paused && !_currentAudio.ended) {
    return true;
  }
  return false;
}
