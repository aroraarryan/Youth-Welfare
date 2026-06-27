'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';

const BhashiniWidget = dynamic(() => import('./BhashiniWidget'), { ssr: false });

export default function GovHeader() {
  const { t } = useLanguage();

  return (
    <div className="bg-[#1e3a8a] text-white py-1.5 px-2 sm:px-10 z-[110] relative">
      <div className="max-w-[1500px] mx-auto flex justify-between items-center text-[9px] sm:text-xs font-medium gap-2">
        <div className="flex items-center gap-2 shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" className="w-4 h-3 sm:w-5 sm:h-3.5 shadow-sm rounded-[1px]">
            <rect width="900" height="200" fill="#FF9933"/>
            <rect width="900" height="200" y="200" fill="#FFFFFF"/>
            <rect width="900" height="200" y="400" fill="#128807"/>
            <g transform="translate(450,300)">
              <circle r="92.5" fill="none" stroke="#000080" strokeWidth="4"/>
              <circle r="15" fill="#000080"/>
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="-92.5"
                  stroke="#000080"
                  strokeWidth="2"
                  transform={`rotate(${(i * 360) / 24})`}
                />
              ))}
            </g>
          </svg>
          <span className="font-semibold uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">{t('gov_name')}</span>
        </div>
      <div className="flex gap-1.5 sm:gap-3 items-center">
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
        <BhashiniWidget />
      </div>
      </div>
    </div>
  );
}
