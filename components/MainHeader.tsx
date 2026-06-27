'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePortalSession } from '@/hooks/usePortalSession';

export default function MainHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { t } = useLanguage();
  const router = useRouter();
  const { session, loading: sessionLoading, refresh: refreshSession } = usePortalSession();

  const handlePortalLogout = async () => {
    if (!session) return;
    try { await fetch(session.logoutUrl, { method: 'POST', credentials: 'include' }); } catch {}
    setLoginOpen(false);
    refreshSession();
    router.push('/');
  };

  const navLinks = [
    { href: '/', label: t('nav_home') },
    { href: '/about', label: t('nav_about') },
    { href: '/gallery', label: t('nav_gallery') },
    { href: '/rti', label: t('nav_rti') },
    { href: '/downloads', label: t('nav_downloads') },
    { href: '/contact', label: t('nav_contact') },
  ];

  return (
    <header className="relative bg-white shadow-[0_2px_15px_rgba(0,0,0,0.08)] w-full z-[100]">
      <div className="max-w-[1500px] mx-auto flex justify-between items-center py-1.5 lg:py-4 px-1.5 sm:px-6 lg:px-10 gap-1.5 sm:gap-4">
        {/* Left: Logos + title */}
        <div className="flex items-center gap-1.5 lg:gap-5 min-w-0 flex-1">
          <div className="flex items-center gap-1 lg:gap-4 shrink-0">
            <div className="relative w-7 h-7 sm:w-9 sm:h-9 lg:w-[60px] lg:h-[60px]">
              <Image src="/images/gov-logo.png" alt="Ashoka Chakra" fill className="object-contain" />
            </div>
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 lg:w-[70px] lg:h-[70px]">
              <Image src="/images/logo.png" alt="Youth Welfare Logo" fill className="object-contain" />
            </div>
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h1 className="text-[9px] sm:text-sm lg:text-xl font-extrabold text-[#1e3a8a] m-0 leading-tight truncate sm:whitespace-normal">
              {t('dept_name')}
            </h1>
            <p className="text-[7px] sm:text-[9px] lg:text-xs text-[#666] m-0 font-medium uppercase tracking-tight truncate sm:whitespace-normal hidden xs:block">{t('dept_sub')}</p>
          </div>
        </div>

        {/* Center: Desktop Nav */}
        <nav className="hidden lg:flex flex-1 justify-center">
          <ul className="list-none p-0 m-0 flex gap-6 xl:gap-8">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="no-underline text-[#2c3e50] font-bold text-[13px] uppercase tracking-tight py-2 hover:text-[#1e3a8a] transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 lg:gap-5 shrink-0">
          {/* Login / Profile Dropdown */}
          <div className="relative" onMouseEnter={() => setLoginOpen(true)} onMouseLeave={() => setLoginOpen(false)}>
            {session ? (
              <>
                <button
                  onClick={() => setLoginOpen(!loginOpen)}
                  className={`${session.kind === 'admin' ? 'bg-blue-700 hover:bg-blue-800' : 'bg-teal-700 hover:bg-teal-800'} text-white font-bold text-[8px] sm:text-[9px] lg:text-sm py-1 lg:py-2.5 px-1.5 sm:px-3 lg:px-5 rounded-lg sm:rounded-xl transition-all flex items-center gap-1 lg:gap-2 shadow-lg max-w-[120px] sm:max-w-none`}
                  title={session.name}
                >
                  <i className={`fas ${session.kind === 'admin' ? 'fa-user-tie' : 'fa-user-shield'} text-[8px] lg:text-xs`} />
                  <span className="truncate hidden xs:inline">{session.name.split(' ')[0]}</span>
                  <i className={`fas fa-chevron-down text-[7px] lg:text-[10px] transition-transform duration-300 ${loginOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full right-0 mt-2 w-56 lg:w-64 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-3 transition-all duration-300 z-[100] backdrop-blur-xl ${loginOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="px-4 py-2 mb-2 border-b border-gray-50">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {session.kind === 'admin' ? 'Admin Portal' : 'Officer Portal'}
                    </p>
                    <p className="text-xs lg:text-sm font-bold text-[#1e293b] mt-0.5 truncate">{session.name}</p>
                  </div>
                  <Link
                    href={session.dashboardUrl}
                    onClick={() => setLoginOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs lg:text-sm font-bold text-[#1e293b] hover:bg-blue-50 hover:text-[#1e3a8a] transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1e3a8a]"><i className="fas fa-gauge-high text-xs" /></div>
                    Go to Dashboard
                  </Link>
                  <button
                    onClick={handlePortalLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs lg:text-sm font-bold text-[#1e293b] hover:bg-red-50 hover:text-red-600 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600"><i className="fas fa-right-from-bracket text-xs" /></div>
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setLoginOpen(!loginOpen)}
                  disabled={sessionLoading}
                  className="bg-[#1e3a8a] text-white font-bold text-[8px] sm:text-[9px] lg:text-sm py-1 lg:py-2.5 px-1.5 sm:px-3 lg:px-6 rounded-lg sm:rounded-xl hover:bg-[#1e40af] transition-all flex items-center gap-1 lg:gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-70"
                >
                  Login <i className={`fas fa-chevron-down text-[7px] lg:text-[10px] transition-transform duration-300 ${loginOpen ? 'rotate-180' : ''}`} />
                </button>

                <div className={`absolute top-full right-0 mt-2 w-48 lg:w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-gray-100 py-3 transition-all duration-300 z-[100] backdrop-blur-xl ${loginOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                  <div className="px-4 py-2 mb-2 border-b border-gray-50">
                    <p className="text-[9px] lg:text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Portal</p>
                  </div>
                  <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 text-xs lg:text-sm font-bold text-[#1e293b] hover:bg-blue-50 hover:text-[#1e3a8a] transition-all">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#1e3a8a]"><i className="fas fa-user text-xs" /></div>
                    Public Login
                  </Link>
                  <Link href="/officer/login" className="flex items-center gap-3 px-4 py-2.5 text-xs lg:text-sm font-bold text-[#1e293b] hover:bg-green-50 hover:text-green-600 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"><i className="fas fa-user-shield text-xs" /></div>
                    Officer Login
                  </Link>
                </div>
              </>
            )}
          </div>

          <button className="hidden lg:block text-gray-600 hover:text-[#1e3a8a] transition-colors p-1 lg:p-2">
            <i className="fas fa-search text-base lg:text-lg" />
          </button>

          {/* Mobile Hamburger */}
          <button
            id="menuToggle"
            onClick={() => setMenuOpen(o => !o)}
            className="text-xl lg:hidden z-[110] p-1 text-[#1e3a8a]"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Overlay & Drawer (unchanged logic) */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setMenuOpen(false)} />
      )}
      <nav className={`fixed top-0 right-0 h-full w-[280px] bg-white shadow-2xl z-[105] transform transition-transform duration-300 ease-in-out lg:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-8 pt-24">
          <ul className="list-none p-0 m-0 flex flex-col gap-6">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} onClick={() => setMenuOpen(false)} className="no-underline text-[#1e293b] font-bold text-lg block py-2 border-b border-gray-50 hover:text-[#1e3a8a]">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
