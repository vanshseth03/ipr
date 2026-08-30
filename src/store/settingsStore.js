import { create } from 'zustand';
import { APP_CONFIG } from '../constants/config';
import { getSecureItem, setSecureItem } from '../utils/secureStore';
import i18n from '../i18n';

const SETTINGS_KEY = 'ayurveda_app_settings';

export const useSettingsStore = create((set, get) => ({
  language: APP_CONFIG.defaultLanguage,
  jurisdiction: APP_CONFIG.defaultJurisdiction,
  mockMode: APP_CONFIG.mockMode,
  disclaimerAccepted: false,

  setLanguage: async (language) => {
    set({ language });
    if (i18n.isInitialized) {
      i18n.changeLanguage(language);
    }
    await get().saveSettings();
  },

  setJurisdiction: async (jurisdiction) => {
    set({ jurisdiction });
    await get().saveSettings();
  },

  setMockMode: async (mockMode) => {
    set({ mockMode });
    await get().saveSettings();
  },

  setDisclaimerAccepted: async (disclaimerAccepted) => {
    set({ disclaimerAccepted });
    await get().saveSettings();
  },

  saveSettings: async () => {
    const { language, jurisdiction, mockMode, disclaimerAccepted } = get();
    await setSecureItem(
      SETTINGS_KEY,
      JSON.stringify({ language, jurisdiction, mockMode, disclaimerAccepted })
    );
  },

  loadSettings: async () => {
    try {
      const raw = await getSecureItem(SETTINGS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          language: parsed.language || APP_CONFIG.defaultLanguage,
          jurisdiction: parsed.jurisdiction || APP_CONFIG.defaultJurisdiction,
          mockMode: parsed.mockMode ?? APP_CONFIG.mockMode,
          disclaimerAccepted: parsed.disclaimerAccepted ?? false,
        });

        if (i18n.isInitialized && parsed.language) {
          i18n.changeLanguage(parsed.language);
        }
      }
    } catch (err) {
      console.warn('[SettingsStore] Failed to load settings:', err.message);
    }
  },
}));
