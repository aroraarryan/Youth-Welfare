'use client';

import { useEffect, useState } from 'react';
import { TITLE, PARAGRAPHS, SIGNATURE } from '@/lib/trialNotice';

export default function NoticePopup() {
  const [open, setOpen] = useState(true); // shown on every full page load/reload
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      lang="hi"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notice-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-3 sm:p-6"
    >
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 bg-[#1e3a8a] px-4 py-4 sm:px-6 sm:py-5">
          <h2
            id="notice-popup-title"
            className="text-base font-bold leading-snug text-white sm:text-xl"
          >
            {TITLE}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="बंद करें"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25"
          >
            ×
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4 text-[15px] leading-relaxed text-slate-800 sm:space-y-4 sm:px-6 sm:py-6 sm:text-lg">
          {PARAGRAPHS.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="pt-1 font-bold text-[#1e3a8a]">{SIGNATURE}</p>
        </div>
        <div className="shrink-0 border-t px-4 py-3 sm:px-6 sm:py-4 sm:text-right">
          <button
            type="button"
            onClick={close}
            className="w-full rounded-lg bg-[#1e3a8a] px-6 py-3 font-semibold text-white hover:bg-[#1e3a8a]/90 sm:w-auto sm:py-2"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
}
