'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { newsletterApi } from '@/lib/api/newsletter';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setNewsletterStatus('loading');
    try {
      await newsletterApi.subscribe(email);
      setNewsletterStatus('success');
      setEmail('');
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className="bg-[#1e3a8a] text-white pt-15 pb-10 px-10 w-full border-t-[3px] border-[#3b82f6] relative">
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)' }}
      />

      <div
        className="grid gap-8 max-w-[1400px] mx-auto items-start"
        style={{ gridTemplateColumns: '2.5fr 1fr 1fr 1fr' }}
      >
        {/* Logo + Description */}
        <div className="footer-section flex flex-col pr-5">
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-white/10 w-full">
            <Image
              src="/images/logo.png"
              alt="Yuva Sathi Logo"
              width={120}
              height={60}
              className="object-contain"
            />
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-white leading-none mb-0.5">Youth</span>
              <span className="text-xl font-bold text-white leading-none mb-1">
                Welfare And PRD Department
              </span>
              <span className="text-lg text-slate-200 font-semibold tracking-widest">
                Uttarakhand
              </span>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-slate-200 mb-6">
            A Single Platform for Youth of Uttarakhand to get information related to Jobs,
            Skill development, Vocational Training, Employment, Self-Employment, Higher
            Education, Competitive Examination, Carrier Counselling, Sports, Health,
            Secondary Education, Start-Up, Sewayojan etc.
          </p>

          {/* Newsletter */}
          <div className="mb-8">
            <h4 className="text-white text-base font-semibold mb-4">
              Stay Informed with the Latest Updates!
            </h4>
            {newsletterStatus === 'success' && (
              <p className="text-green-300 text-sm mb-3">Subscribed! Thank you.</p>
            )}
            {newsletterStatus === 'error' && (
              <p className="text-red-300 text-sm mb-3">Subscription failed. Please try again.</p>
            )}
            <div className="flex items-center gap-8 flex-wrap">
              <form onSubmit={handleNewsletter} className="flex flex-1 min-w-[140px] h-12">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email id"
                  required
                  className="flex-1 px-4 py-3 border-2 border-white/10 rounded-l-lg text-sm outline-none bg-white/10 text-white placeholder-white/60 focus:border-blue-400 focus:bg-white/15 transition-all"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === 'loading'}
                  className="bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-60 text-white font-semibold px-5 rounded-r-lg transition-colors text-sm"
                >
                  {newsletterStatus === 'loading' ? <i className="fas fa-spinner fa-spin" /> : 'Send'}
                </button>
              </form>
              {/* Social icons */}
              <div className="flex gap-2 flex-shrink-0">
                {[
                  { href: 'https://facebook.com', icon: 'fab fa-facebook-f', bg: '#1877f2', title: 'Facebook' },
                  { href: 'https://twitter.com',  icon: 'fab fa-twitter',     bg: '#1da1f2', title: 'Twitter' },
                  { href: 'https://instagram.com',icon: 'fab fa-instagram',   bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', title: 'Instagram' },
                  { href: 'https://youtube.com',  icon: 'fab fa-youtube',     bg: '#ff0000', title: 'YouTube' },
                  { href: 'https://linkedin.com', icon: 'fab fa-linkedin-in', bg: '#0077b5', title: 'LinkedIn' },
                ].map(s => (
                  <a
                    key={s.title}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.title}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm hover:scale-110 transition-transform"
                    style={{ background: s.bg }}
                  >
                    <i className={s.icon} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {[
              { href: '/about',   label: 'About Us' },
              { href: '#',        label: 'How To Register With Us' },
              { href: '#',        label: 'Who We Are' },
              { href: '/contact', label: 'Contact Us' },
              { href: '#',        label: 'FAQ' },
            ].map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-slate-300 no-underline text-sm hover:text-white hover:pl-1 transition-all"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Policies */}
        <div className="footer-section">
          <h3 className="text-white font-bold text-lg mb-4">Policies</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            {[
              { href: '#',          label: 'Press Release' },
              { href: '/gallery',   label: 'Photo Gallery' },
              { href: '#',          label: 'Terms & Conditions' },
              { href: '#',          label: 'Disclaimer' },
              { href: '#',          label: 'Privacy Policy' },
            ].map(l => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="text-slate-300 no-underline text-sm hover:text-white hover:pl-1 transition-all"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h3 className="text-white font-bold text-lg mb-4">Contact Us</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-2">
            <li>
              <span className="text-slate-300 text-sm">
                Uttarakhand Secretariat, Subhash Road, Dehradun – 248001
              </span>
            </li>
            <li>
              <a href="tel:+919634312465" className="text-slate-300 no-underline text-sm hover:text-white transition-colors">
                <strong>Phone: </strong>+91-9634312465
              </a>
            </li>
            <li>
              <a href="mailto:ywprd.uk@gmail.com" className="text-slate-300 no-underline text-sm hover:text-white transition-colors">
                <strong>Email: </strong>ywprd.uk@gmail.com
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-10 pt-6 border-t border-white/10 text-center">
        <p className="text-slate-300 text-sm m-0">
          &copy; 2025 Department of Youth Welfare and PRD, Uttarakhand Government. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
