import { TITLE, PARAGRAPHS, SIGNATURE } from '@/lib/trialNotice';

export default function ImportantNoticeSection() {
  return (
    <section lang="hi" aria-labelledby="important-notice-heading" className="pt-10 px-4 sm:px-10 bg-[#f8fafc]">
      <div className="max-w-[1400px] mx-auto rounded-2xl border border-amber-300 bg-amber-50 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 bg-amber-400 px-4 sm:px-6 py-2.5">
          <i className="fa-solid fa-bell text-slate-900 text-sm" aria-hidden="true" />
          <h2 id="important-notice-heading" className="text-slate-900 text-sm sm:text-base font-bold">
            Important Notice
          </h2>
        </div>
        <div className="px-4 sm:px-6 py-4 space-y-2 text-sm sm:text-base leading-relaxed text-slate-800">
          <p className="font-bold text-[#1e3a8a]">{TITLE}</p>
          {PARAGRAPHS.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="font-bold text-[#1e3a8a] pt-1">{SIGNATURE}</p>
        </div>
      </div>
    </section>
  );
}
