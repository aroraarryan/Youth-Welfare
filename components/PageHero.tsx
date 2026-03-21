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
    <div className="page-hero">
      <div className="max-w-[1300px] mx-auto relative z-10">
        {/* Breadcrumb */}
        {breadcrumb.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[13px] text-white/70 mb-4 flex-wrap">
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
          <p className="text-[26px] font-extrabold text-[#f7941d] mt-0 mb-1.5 tracking-wide">
            {hindiTitle}
          </p>
        )}

        {/* English title */}
        <h1 className="text-[32px] font-extrabold text-white mt-0 mb-3 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Subtitle */}
        <p className="text-[17px] text-white/80 mt-0 mb-0 font-normal">{subtitle}</p>

        {/* Stats */}
        {stats.length > 0 && (
          <div className="flex gap-8 mt-8 flex-wrap">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-sm text-white/70 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
