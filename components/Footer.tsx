'use client';
// Refreshed to resolve hydration mismatch after phone number update

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
    <footer className="bg-[#1e3a8a] text-white pt-16 lg:pt-20 pb-10 px-6 sm:px-10 w-full relative">
      <div className="max-w-[1500px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 items-start mb-16">
          {/* Logo + Description + Newsletter (Spans 2 columns) */}
          <div className="footer-section lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-6 mb-8">
              <Image
                src="/images/logo.png"
                alt="Yuva Sathi Logo"
                width={120}
                height={75}
                className="object-contain"
              />
              <div className="flex flex-col">
                <span className="text-4xl font-black text-white leading-none mb-1 tracking-tight">Youth</span>
                <span className="text-xl font-bold text-white leading-tight">
                  Welfare And PRD Department
                </span>
                <span className="text-lg text-white font-semibold opacity-90">
                  Uttarakhand
                </span>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 mb-8" />

            <p className="text-[14px] leading-relaxed text-slate-100 mb-10 max-w-[500px] font-medium opacity-80">
              A Single Platform for Youth of Uttarakhand to get information related to Jobs,
              Skill development, Vocational Training, Employment, Self-Employment, Higher
              Education, Competitive Examination, Carrier Counselling, Sports, Health,
              Secondary Education, Start-Up, Sewayojan etc.
            </p>

            {/* Newsletter & Socials */}
            <div>
              <h4 className="text-white text-[16px] font-bold mb-6 tracking-wide">
                Stay Informed with the Latest Updates!
              </h4>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <form onSubmit={handleNewsletter} className="flex w-full max-w-[360px] h-[50px] rounded-xl overflow-hidden border border-white/20">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email id"
                    required
                    className="flex-1 px-5 bg-[#2d439a] text-white placeholder-white/40 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={newsletterStatus === 'loading'}
                    className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 font-bold text-sm transition-all whitespace-nowrap active:scale-95"
                  >
                    {newsletterStatus === 'loading' ? <i className="fas fa-spinner fa-spin" /> : 'Send'}
                  </button>
                </form>

                <div className="flex gap-2.5">
                  {[
                    { href: 'https://facebook.com', icon: 'fab fa-facebook-f', bg: '#1877f2' },
                    { href: 'https://twitter.com',  icon: 'fab fa-twitter',    bg: '#1da1f2' },
                    { href: 'https://instagram.com',icon: 'fab fa-instagram',  bg: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' },
                    { href: 'https://youtube.com',  icon: 'fab fa-youtube',    bg: '#ff0000' },
                    { href: 'https://linkedin.com', icon: 'fab fa-linkedin-in',bg: '#0077b5' },
                  ].map((s, i) => (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-base transition-all hover:scale-110"
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
            <h3 className="text-white font-black text-[18px] mb-8 relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-[2px] after:bg-blue-500">
              Quick Links
            </h3>
            <ul className="space-y-4">
              {[
                { href: '/about', label: 'About Us' },
                { href: '#',      label: 'How To Register With Us' },
                { href: '#',      label: 'Who We Are' },
                { href: '/contact', label: 'Contact Us' },
                { href: '#',      label: 'FAQ' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-slate-300 hover:text-white transition-all font-medium text-[14px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div className="footer-section">
            <h3 className="text-white font-black text-[18px] mb-8 relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-[2px] after:bg-blue-500">
              Policies
            </h3>
            <ul className="space-y-4">
              {[
                { href: '#',        label: 'Press Release' },
                { href: '/gallery', label: 'Photo Gallery' },
                { href: '#',        label: 'Terms & Conditions' },
                { href: '#',        label: 'Disclaimer' },
                { href: '#',        label: 'Privacy Policy' },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-slate-300 hover:text-white transition-all font-medium text-[14px]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-section">
            <h3 className="text-white font-black text-[18px] mb-8 relative inline-block pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-8 after:h-[2px] after:bg-blue-500">
              Contact Us
            </h3>
            <div className="space-y-6">
              <p className="text-slate-300 text-[14px] font-medium leading-relaxed">
                Uttarakhand Secretariat, Subhash Road, Dehradun – 248001
              </p>
              <div className="flex flex-col gap-2">
                <p className="text-slate-300 font-medium text-[14px]">
                  <strong className="text-white">Phone: </strong>+91 93687 76459
                </p>
                <p className="text-slate-300 font-medium text-[14px]">
                  <strong className="text-white">Email: </strong>ywprd.uk@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-slate-300 text-sm font-medium opacity-80">
            &copy; 2025 Department of Youth Welfare and PRD, Uttarakhand Government. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
