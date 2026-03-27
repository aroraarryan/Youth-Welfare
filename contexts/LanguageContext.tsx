'use client';

import { createContext, useContext, useState } from 'react';
import { type Lang, type TranslationKey, translate } from '@/lib/translations';

interface LanguageContextValue {
  lang: Lang;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('EN');

  const toggleLang = () => setLang(l => (l === 'EN' ? 'HI' : 'EN'));
  const t = (key: TranslationKey) => translate(key, lang);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
