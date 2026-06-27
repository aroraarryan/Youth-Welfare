'use client';

import { usePathname } from 'next/navigation';

export default function FloatingElements() {
  const pathname = usePathname();
  
  // Hide on admin and officer dashboards
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/officer');
  
  if (isDashboard) return null;

  return (
    <>
      {/* Fixed social media sidebar */}
      <div className="fixed-social-media">
        {[
          { href: 'https://www.facebook.com/DepartmentofYouthWelfare?rdid=YciUTtsblIserOHt&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1Bfj54mfoK%2F%3Fref%3D1#', icon: 'fab fa-facebook-f', bg: '#1877f2', title: 'Facebook' },
          { href: 'https://x.com/officialukprd', icon: 'fa-brands fa-x-twitter', bg: '#000000', title: 'X (Twitter)' },
          { href: 'https://www.instagram.com/officialukprd?igsh=MWpvazJiZ2lxeDBvcQ%3D%3D', icon: 'fab fa-instagram', bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', title: 'Instagram' },
          { href: 'https://www.youtube.com/@yuvakalyanprd', icon: 'fab fa-youtube', bg: '#ff0000', title: 'YouTube' },
        ].map(s => (
          <a
            key={s.title}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            title={s.title}
            className="social-icon"
            style={{ background: s.bg }}
          >
            <i className={s.icon} />
          </a>
        ))}
      </div>

    </>
  );
}
