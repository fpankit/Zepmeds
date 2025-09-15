
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import { languageOptions, LanguageCode } from '@/locales/language-options';
import en from '@/locales/en.json';
import hi from '@/locales/hi.json';
import pa from '@/locales/pa.json';
import ta from '@/locales/ta.json';
import te from '@/locales/te.json';
import mr from '@/locales/mr.json';
import kn from '@/locales/kn.json';

const translations: Record<LanguageCode, any> = {
    en,
    hi,
    pa,
    ta,
    te,
    mr,
    kn,
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedLanguage = localStorage.getItem('app-language') as LanguageCode;
    if (storedLanguage && languageOptions.some(l => l.code === storedLanguage)) {
      setLanguageState(storedLanguage);
    }
    setIsMounted(true);
  }, []);

  const setLanguage = (lang: LanguageCode) => {
    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
  };
  
  const t = useCallback((key: string): string => {
      const keys = key.split('.');
      let result = translations[language];
      for (const k of keys) {
          result = result?.[k];
          if (result === undefined) {
              // Fallback to English if translation is missing
              let fallbackResult = translations.en;
              for (const fk of keys) {
                fallbackResult = fallbackResult?.[fk];
              }
              return fallbackResult || key;
          }
      }
      return result || key;
  }, [language]);


  const value = useMemo(() => ({
    language,
    setLanguage,
    t
  }), [language, t]);

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const useTranslation = () => {
    const { t } = useLanguage();
    return t;
}
