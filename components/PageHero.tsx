import Link from 'next/link';

interface Stat {
  value: string;
  label: string;
}

interface PageHeroProps {
  hindiTitle?: string;
  title: string;
  subtitle: string;
  breadcrumb?: { label: string; href?: string }[];
  stats?: Stat[];
}

export default function PageHero({ hindiTitle, title, subtitle, breadcrumb = [], stats = [] }: PageHeroProps) {
  return (
    <div className="page-hero px-4 lg:px-10 py-3.5 lg:py-16">
      <div className="max-w-[1300px] mx-auto relative z-10">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[10px] lg:text-[13px] text-white/70 mb-1.5 lg:mb-4 flex-wrap">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/45 text-[10px]">›</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="text-white/70 no-underline hover:text-white transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/90 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {/* Hindi title */}
        {hindiTitle && (
          <p className="text-base lg:text-[26px] font-extrabold text-[#f7941d] mt-0 mb-1 tracking-wide">
            {hindiTitle}
          </p>
        )}

        {/* English title */}
        <h1 className="text-base lg:text-[32px] font-extrabold text-white mt-0 mb-1.5 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-xs lg:text-[17px] text-white/80 mt-0 mb-0 font-normal">{subtitle}</p>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex gap-3 lg:gap-10 mt-3 lg:mt-10 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="relative group">
                <div className="flex items-baseline gap-1.5">
                  <div className="text-lg lg:text-4xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">{s.value}</div>
                  <div className="text-[8px] lg:text-[11px] font-black text-white/50 uppercase tracking-[0.15em] lg:tracking-[0.2em] mb-1">{s.label}</div>
                </div>
                <div className="w-6 lg:w-8 h-[2px] lg:h-[3px] bg-[#f7941d] mt-1 lg:mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
