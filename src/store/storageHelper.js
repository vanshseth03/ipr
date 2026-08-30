import { Platform } from 'react-native';

// ─── Cookie & LocalStorage Universal Storage Engine ─────────────
export const universalStorage = {
  getItem: (name) => {
    if (Platform.OS !== 'web') return null;

    try {
      // 1. Try localStorage first
      if (typeof localStorage !== 'undefined') {
        const item = localStorage.getItem(name);
        if (item) return item;
      }

      // 2. Fallback to document.cookie
      if (typeof document !== 'undefined' && document.cookie) {
        const cookies = document.cookie.split(';');
        for (const cookie of cookies) {
          const [key, value] = cookie.trim().split('=');
          if (key === encodeURIComponent(name)) {
            return decodeURIComponent(value);
          }
        }
      }
    } catch (e) {
      console.warn('[Storage] getItem error:', e);
    }
    return null;
  },

  setItem: (name, value) => {
    if (Platform.OS !== 'web') return;

    try {
      // 1. Store in localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }

      // 2. Also store in document.cookie (1 year expiration)
      if (typeof document !== 'undefined') {
        // Keep cookie size within standard browser limits (4KB)
        const serialized = encodeURIComponent(value);
        if (serialized.length < 3800) {
          document.cookie = `${encodeURIComponent(name)}=${serialized}; path=/; max-age=31536000; SameSite=Lax`;
        }
      }
    } catch (e) {
      console.warn('[Storage] setItem error:', e);
    }
  },

  removeItem: (name) => {
    if (Platform.OS !== 'web') return;

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
      }
      if (typeof document !== 'undefined') {
        document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; SameSite=Lax`;
      }
    } catch (e) {
      console.warn('[Storage] removeItem error:', e);
    }
  },
};
