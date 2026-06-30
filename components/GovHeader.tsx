'use client';

import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAccessibility } from '@/contexts/AccessibilityContext';

const BhashiniWidget = dynamic(() => import('./BhashiniWidget'), { ssr: false });

export default function GovHeader() {
  const { t } = useLanguage();
  const {
    fontSize, highContrast,
    decreaseFontSize, resetFontSize, increaseFontSize, toggleHighContrast,
  } = useAccessibility();

  return (
    <div className="bg-[#1e3a8a] text-white py-1.5 px-2 sm:px-10 z-[110] relative">
      <div className="max-w-[1500px] mx-auto flex justify-between items-center text-[9px] sm:text-xs font-medium gap-2">

        <div className="flex items-center gap-2 shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 900 600"
            className="w-4 h-3 sm:w-5 sm:h-3.5 shadow-sm rounded-[1px]"
            aria-hidden="true"
          >
            <rect width="900" height="200" fill="#FF9933"/>
            <rect width="900" height="200" y="200" fill="#FFFFFF"/>
            <rect width="900" height="200" y="400" fill="#128807"/>
            <g transform="translate(450,300)">
              <circle r="92.5" fill="none" stroke="#000080" strokeWidth="4"/>
              <circle r="15" fill="#000080"/>
              {Array.from({ length: 24 }).map((_, i) => (
                <line
                  key={i}
                  x1="0" y1="0" x2="0" y2="-92.5"
                  stroke="#000080" strokeWidth="2"
                  transform={`rotate(${(i * 360) / 24})`}
                />
              ))}
            </g>
          </svg>
          <span className="font-semibold uppercase tracking-wider truncate max-w-[150px] sm:max-w-none">
            {t('gov_name')}
          </span>
        </div>

        <div className="flex gap-1.5 sm:gap-3 items-center">

          <div
            className="flex items-center gap-0.5 sm:gap-1 border border-white/25 rounded px-1 py-0.5"
            role="group"
            aria-label={t('a11y_toolbar_label')}
          >
            <button
              onClick={decreaseFontSize}
              disabled={fontSize === 'normal'}
              aria-label={t('a11y_font_decrease')}
              title="A-"
              className="text-white text-[10px] sm:text-xs font-bold px-1 sm:px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              A<sup>-</sup>
            </button>
            <button
              onClick={resetFontSize}
              aria-label={t('a11y_font_normal')}
              aria-pressed={fontSize === 'normal'}
              title="A"
              className={`text-white text-[11px] sm:text-[13px] font-bold px-1 sm:px-1.5 py-0.5 rounded hover:bg-white/20 transition-colors ${fontSize === 'normal' ? 'underline underline-offset-2' : ''}`}
            >
              A
            </button>
            <button
              onClick={increaseFontSize}
              disabled={fontSize === 'larger'}
              aria-label={t('a11y_font_increase')}
              title="A+"
              className="text-white text-[13px] sm:text-[15px] font-bold px-1 sm:px-1.5 py-0.5 rounded hover:bg-white/20 disabled:opacity-40 transition-colors"
            >
              A<sup>+</sup>
            </button>
          </div>

          <button
            onClick={toggleHighContrast}
            aria-label={t('a11y_high_contrast')}
            aria-pressed={highContrast}
            title={t('a11y_high_contrast')}
            className={`bg-transparent border border-white/25 text-white text-base cursor-pointer p-1 rounded hover:bg-white/20 transition-colors ${highContrast ? 'bg-white/30' : ''}`}
          >
            <i className="fas fa-circle-half-stroke" aria-hidden="true" />
          </button>

          <button
            aria-label="Share this page"
            title="Share"
            className="bg-transparent border-none text-white text-base cursor-pointer p-1 rounded hover:bg-white/10 transition-colors"
          >
            <i className="fas fa-share-alt" aria-hidden="true" />
          </button>

          <BhashiniWidget />
        </div>
      </div>
    </div>
  );
}
