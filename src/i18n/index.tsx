import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import en from './en.json';
import hi from './hi.json';
import te from './te.json';
import ta from './ta.json';

type Language = 'en' | 'hi' | 'te' | 'ta';

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

const translations: Record<Language, TranslationObject> = {
  en,
  hi,
  te,
  ta,
};

export const languageNames: Record<Language, string> = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedValue = (obj: TranslationObject, path: string): string => {
  const keys = path.split('.');
  let result: string | TranslationObject = obj;
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the key if translation not found
    }
  }
  
  return typeof result === 'string' ? result : path;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return getNestedValue(translations[language], key);
  };

  useEffect(() => {
    const saved = localStorage.getItem('language');
    if (saved && saved in translations) {
      setLanguageState(saved as Language);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export type { Language };
