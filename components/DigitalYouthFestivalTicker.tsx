const FESTIVAL_URL = 'https://khelouk.in/digital-youth-festival';
const REPEAT_COUNT = 4;

function TickerItem() {
  return (
    <span className="flex items-center gap-4 shrink-0 px-16">
      <span className="text-white font-bold text-sm tracking-tight">Digital Youth Festival</span>
      <span className="text-white/70">»</span>
      <a
        href={FESTIVAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="text-white font-semibold text-sm underline underline-offset-2 hover:text-white/80 transition-colors"
      >
        Click here
      </a>
      <span className="text-white/50 pl-10">•</span>
    </span>
  );
}

export default function DigitalYouthFestivalTicker() {
  return (
    <div className="w-full bg-[#1e3a8a] overflow-hidden">
      <div className="flex w-max motion-safe:animate-[marquee-scroll_60s_linear_infinite] hover:[animation-play-state:paused] py-2.5">
        <div className="flex shrink-0">
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <TickerItem key={`a-${i}`} />
          ))}
        </div>
        <div className="flex shrink-0" aria-hidden="true">
          {Array.from({ length: REPEAT_COUNT }).map((_, i) => (
            <TickerItem key={`b-${i}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
