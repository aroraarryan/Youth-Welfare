'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export type FontSize = 'normal' | 'large' | 'larger';

interface AccessibilityContextValue {
  fontSize: FontSize;
  highContrast: boolean;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  increaseFontSize: () => void;
  toggleHighContrast: () => void;
}

const FONT_SIZES: FontSize[] = ['normal', 'large', 'larger'];

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [highContrast, setHighContrast] = useState(false);

  // Restore preferences from localStorage on first render
  useEffect(() => {
    const storedSize = localStorage.getItem('a11y-font-size') as FontSize | null;
    const storedContrast = localStorage.getItem('a11y-high-contrast');
    if (storedSize && FONT_SIZES.includes(storedSize)) setFontSize(storedSize);
    if (storedContrast === 'true') setHighContrast(true);
  }, []);

  // Apply font-size class to <html>
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove('font-large', 'font-larger');
    if (fontSize === 'large') html.classList.add('font-large');
    if (fontSize === 'larger') html.classList.add('font-larger');
    localStorage.setItem('a11y-font-size', fontSize);
  }, [fontSize]);

  // Apply high-contrast data attribute to <html>
  useEffect(() => {
    document.documentElement.dataset.highContrast = String(highContrast);
    localStorage.setItem('a11y-high-contrast', String(highContrast));
  }, [highContrast]);

  const decreaseFontSize = () =>
    setFontSize(prev => FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(prev) - 1)]);

  const resetFontSize = () => setFontSize('normal');

  const increaseFontSize = () =>
    setFontSize(prev => FONT_SIZES[Math.min(FONT_SIZES.length - 1, FONT_SIZES.indexOf(prev) + 1)]);

  const toggleHighContrast = () => setHighContrast(c => !c);

  return (
    <AccessibilityContext.Provider
      value={{ fontSize, highContrast, decreaseFontSize, resetFontSize, increaseFontSize, toggleHighContrast }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
}
