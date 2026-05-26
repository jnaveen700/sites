// useLanguage Hook - Provides language switching and translation access
// Usage: const { t, language, switchLanguage } = useLanguage();

import { useContext } from 'react';
import LanguageContext from '../context/LanguageContext';
import translations from '../translations';

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }

  const { language, switchLanguage } = context;

  // Translation function - gets text in current language
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        // Fallback to English if translation missing
        value = translations.en;
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object') {
            value = value[fallbackKey];
          }
        }
        return key; // Return key if not found
      }
    }

    return value || key;
  };

  return {
    language,
    switchLanguage,
    t,
    isEnglish: language === 'en',
    isTelugu: language === 'te',
  };
};

export default useLanguage;
