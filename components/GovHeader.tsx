'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export default function GovHeader() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <div className="bg-[#1e3a8a] text-white py-2 px-5 flex justify-between items-center text-sm font-medium">
      <div className="flex items-center gap-2">
        <span className="text-base">🇮🇳</span>
        <span className="font-semibold">{t('gov_name')}</span>
      </div>
      <div className="flex gap-3 items-center">
        <button
          className="bg-transparent border-none text-white text-base cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
          title="Share"
        >
          <i className="fas fa-share-alt" />
        </button>
        <button
          className="bg-transparent border-none text-white text-base cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
          title="Theme Toggle"
        >
          <i className="fas fa-sun" />
        </button>
        <button
          className="bg-transparent border-none text-white text-base cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
          title="Accessibility"
        >
          <i className="fas fa-universal-access" />
        </button>
        <button
          onClick={toggleLang}
          className="bg-transparent border border-white/40 text-white text-sm px-3 py-1.5 rounded-md cursor-pointer flex items-center gap-1.5 hover:bg-white/10 transition-colors"
          title={lang === 'EN' ? 'Switch to Hindi' : 'Switch to English'}
        >
          <span>{lang === 'EN' ? 'हिं' : 'EN'}</span>
          <span className="text-white/50">|</span>
          <span className="text-white/60">{lang === 'EN' ? 'EN' : 'हिं'}</span>
        </button>
      </div>
    </div>
  );
}
