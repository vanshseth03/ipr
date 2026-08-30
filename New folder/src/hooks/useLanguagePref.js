import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export function useLanguagePref() {
  const language = useSettingsStore((state) => state.language);
  const setLanguageInStore = useSettingsStore((state) => state.setLanguage);

  const setLanguage = useCallback(
    (nextLanguage) => {
      setLanguageInStore(nextLanguage);
    },
    [setLanguageInStore]
  );

  return {
    language,
    setLanguage,
  };
}
