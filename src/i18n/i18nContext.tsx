import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { I18nManager } from 'react-native';
import { SupportedLanguage, translations, Translations } from './translations';

interface I18nContextType {
  language: SupportedLanguage;
  isRTL: boolean;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  setLanguage: (lang: SupportedLanguage) => void;
}

const I18nContext = createContext<I18nContextType>({
  language: 'en',
  isRTL: false,
  t: (key) => key,
  setLanguage: () => {},
});

interface I18nProviderProps {
  children: React.ReactNode;
  userLanguage?: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  userLanguage = 'en',
  onLanguageChange,
}) => {
  const language = userLanguage;
  const isRTL = language === 'ur';

  const t = useCallback(
    (key: keyof Translations, params?: Record<string, string | number>): string => {
      const dict = translations[language] || translations.en;
      let text = (dict[key] || translations.en[key] || key) as string;

      if (params) {
        Object.keys(params).forEach((paramKey) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(params[paramKey]));
        });
      }

      return text;
    },
    [language]
  );

  const setLanguage = useCallback(
    (lang: SupportedLanguage) => {
      if (onLanguageChange) {
        onLanguageChange(lang);
      }
    },
    [onLanguageChange]
  );

  const value = useMemo(
    () => ({
      language,
      isRTL,
      t,
      setLanguage,
    }),
    [language, isRTL, t, setLanguage]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useTranslation = (): I18nContextType => useContext(I18nContext);
