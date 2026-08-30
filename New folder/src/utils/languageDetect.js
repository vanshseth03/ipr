const LANGUAGE_PATTERNS = {
  hi: /[\u0900-\u097F]/,
  ta: /[\u0B80-\u0BFF]/,
};

export function detectLanguage(text = '') {
  if (LANGUAGE_PATTERNS.hi.test(text)) return 'hi';
  if (LANGUAGE_PATTERNS.ta.test(text)) return 'ta';
  return 'en';
}

export function isSupportedLanguage(language) {
  return ['en', 'hi', 'ta'].includes(language);
}
