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
    <div className="page-hero px-5 lg:px-10 py-5 lg:py-16">
      <div className="max-w-[1300px] mx-auto relative z-10">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs lg:text-[13px] text-white/70 mb-2 lg:mb-4 flex-wrap">
            {breadcrumb.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-white/45 text-xs">›</span>}
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
          <p className="text-lg lg:text-[26px] font-extrabold text-[#f7941d] mt-0 mb-1 tracking-wide">
            {hindiTitle}
          </p>
        )}

        {/* English title */}
        <h1 className="text-xl lg:text-[32px] font-extrabold text-white mt-0 mb-2 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-sm lg:text-[17px] text-white/80 mt-0 mb-0 font-normal">{subtitle}</p>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex gap-4 lg:gap-10 mt-5 lg:mt-10 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="relative group">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl lg:text-4xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-500">{s.value}</div>
                  <div className="text-[9px] lg:text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-1">{s.label}</div>
                </div>
                <div className="w-8 h-[3px] bg-[#f7941d] mt-1.5 rounded-full group-hover:w-16 transition-all duration-500" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
