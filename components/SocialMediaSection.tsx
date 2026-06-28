'use client';

const INSTAGRAM_HANDLE = 'officialukprd';
const FACEBOOK_PAGE = 'DepartmentofYouthWelfare';

const YOUTUBE_VIDEOS = [
  'FOPOzwOJDhI',
  'aunnzhuQgLY',
  'hEZHpYWOTjM',
];

const PLATFORMS = [
  {
    id: 'instagram',
    label: 'Instagram',
    handle: '@officialukprd',
    icon: 'fa-brands fa-instagram',
    followLabel: 'Follow',
    href: 'https://www.instagram.com/officialukprd',
    iconBg: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    color: '#E1306C',
    dotClass: 'bg-pink-500',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    handle: '@yuvakalyanprd',
    icon: 'fa-brands fa-youtube',
    followLabel: 'Subscribe',
    href: 'https://www.youtube.com/@yuvakalyanprd',
    iconBg: '#FF0000',
    color: '#FF0000',
    dotClass: 'bg-red-500',
  },
  {
    id: 'facebook',
    label: 'Facebook',
    handle: 'DepartmentofYouthWelfare',
    icon: 'fa-brands fa-facebook-f',
    followLabel: 'Like Page',
    href: 'https://www.facebook.com/DepartmentofYouthWelfare',
    iconBg: '#1877F2',
    color: '#1877F2',
    dotClass: 'bg-blue-500',
  },
];

export default function SocialMediaSection() {
  const fbSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
    `https://www.facebook.com/${FACEBOOK_PAGE}`
  )}&tabs=timeline&width=500&height=600&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false&locale=en_US`;

  return (
    <section className="bg-white relative overflow-hidden py-20 px-4 sm:px-10">
      {/* Decorative orbs */}
      <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full bg-pink-50 blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-blue-50 blur-3xl opacity-60 pointer-events-none" />

      <div className="max-w-[1300px] mx-auto relative z-10">
        {/* Heading */}
        <div className="text-center mb-12">
          <span className="inline-block bg-[#1e3a8a]/[0.07] text-[#1e3a8a] text-[11px] font-bold uppercase tracking-[0.18em] px-4 py-1.5 rounded-full mb-4">
            Our Social Media
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a] leading-tight">
            Stay Connected With Us
          </h2>
          <p className="text-gray-400 font-medium mt-2 mb-6">Follow our official channels for the latest updates</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {PLATFORMS.map(p => (
              <a
                key={p.id}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-full px-3.5 py-1.5 transition-colors"
              >
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${p.dotClass}`} />
                {p.handle}
              </a>
            ))}
          </div>
        </div>

        {/* 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Instagram */}
          <div className="bg-white rounded-[1.75rem] shadow-[0_4px_30px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: PLATFORMS[0].iconBg }}
                >
                  <i className="fa-brands fa-instagram text-white text-base" />
                </div>
                <div>
                  <p className="font-black text-[#0f172a] text-[15px] leading-none">Instagram</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{PLATFORMS[0].handle}</p>
                </div>
              </div>
              <a
                href={PLATFORMS[0].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all hover:text-white"
                style={{
                  borderColor: 'rgba(225,48,108,0.35)',
                  color: PLATFORMS[0].color,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = PLATFORMS[0].color; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = PLATFORMS[0].color; }}
              >
                Follow →
              </a>
            </div>
            <iframe
              title="Instagram profile"
              src={`https://www.instagram.com/${INSTAGRAM_HANDLE}/embed`}
              width="100%"
              height="600"
              style={{ border: 0, display: 'block', width: '100%' }}
              allow="encrypted-media; clipboard-write; fullscreen; picture-in-picture"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* YouTube */}
          <div className="bg-white rounded-[1.75rem] shadow-[0_4px_30px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: PLATFORMS[1].iconBg }}
                >
                  <i className="fa-brands fa-youtube text-white text-base" />
                </div>
                <div>
                  <p className="font-black text-[#0f172a] text-[15px] leading-none">YouTube</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5">{PLATFORMS[1].handle}</p>
                </div>
              </div>
              <a
                href={PLATFORMS[1].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all"
                style={{
                  borderColor: 'rgba(255,0,0,0.35)',
                  color: PLATFORMS[1].color,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = PLATFORMS[1].color; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = PLATFORMS[1].color; }}
              >
                Subscribe →
              </a>
            </div>
            <div className="flex flex-col gap-3 p-4">
              {YOUTUBE_VIDEOS.map((vid, i) => (
                <div
                  key={`${vid}-${i}`}
                  className="relative w-full rounded-xl overflow-hidden"
                  style={{ paddingBottom: '56.25%', height: 0 }}
                >
                  <iframe
                    title={`YouTube video ${i + 1}`}
                    src={`https://www.youtube.com/embed/${vid}`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0, display: 'block' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Facebook */}
          <div className="bg-white rounded-[1.75rem] shadow-[0_4px_30px_rgba(0,0,0,0.07)] border border-gray-100/80 overflow-hidden">
            <div className="px-5 pt-5 pb-4 flex items-center justify-between border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: PLATFORMS[2].iconBg }}
                >
                  <i className="fa-brands fa-facebook-f text-white text-base" />
                </div>
                <div>
                  <p className="font-black text-[#0f172a] text-[15px] leading-none">Facebook</p>
                  <p className="text-[11px] text-gray-400 font-medium mt-0.5 truncate max-w-[120px]">{PLATFORMS[2].handle}</p>
                </div>
              </div>
              <a
                href={PLATFORMS[2].href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold px-3 py-1.5 rounded-full border transition-all whitespace-nowrap"
                style={{
                  borderColor: 'rgba(24,119,242,0.35)',
                  color: PLATFORMS[2].color,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = PLATFORMS[2].color; (e.currentTarget as HTMLAnchorElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.color = PLATFORMS[2].color; }}
              >
                Like Page →
              </a>
            </div>
            <iframe
              title="Facebook page"
              src={fbSrc}
              width="100%"
              height="600"
              style={{ border: 0, overflow: 'hidden', display: 'block', width: '100%' }}
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              loading="lazy"
              scrolling="no"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
