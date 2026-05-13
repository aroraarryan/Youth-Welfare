'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const API = process.env.NEXT_PUBLIC_BASE_URL;

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const queryClient = useQueryClient();

  if (pathname === '/officer/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch(`/api/officer/logout`, { method: 'POST' });
    queryClient.clear();
    router.push('/officer/login');
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? 'bg-teal-700 text-white'
            : 'text-teal-100 hover:bg-teal-700 hover:text-white'
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-teal-800 text-white p-4 flex items-center justify-between z-[110] shadow-md">
        <div>
          <h1 className="text-base font-bold leading-none">Officer Portal</h1>
          <p className="text-[10px] text-teal-300 mt-1">Yuva Shakti Portal</p>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-xl p-2 hover:bg-teal-700 rounded-lg transition-colors"
        >
          <i className={`fas ${sidebarOpen ? 'fa-times' : 'fa-bars'}`} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[120] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-teal-800 text-white flex flex-col z-[130] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-56 md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:block px-4 py-5 border-b border-teal-700">
          <h1 className="text-lg font-bold leading-tight">Officer Portal</h1>
          <p className="text-xs text-teal-300 mt-0.5">Yuva Shakti Portal</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto pt-20 md:pt-4">
          <div className="space-y-1">
            {navLink('/officer/dashboard', 'Dashboard')}
            {navLink('/officer/gallery', 'Gallery')}
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-2">Mangal Dal</h3>
            {navLink('/officer/mahila-mangal-dal', 'Mahila Mangal Dal')}
            {navLink('/officer/yuvak-mangal-dal', 'Yuvak Mangal Dal')}
          </div>

          <div className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold text-teal-300 uppercase tracking-widest mb-2">Infrastructure</h3>
            {navLink('/officer/multipurpose-halls', 'Multipurpose Halls')}
            {navLink('/officer/mini-stadiums', 'Mini Stadiums')}
            {navLink('/officer/youth-hostels', 'Youth Hostels')}
            {navLink('/officer/vocational-training-centers', 'Vocational Training Centers')}
            {navLink('/officer/indoor-gym', 'Indoor Gym')}
            {navLink('/officer/open-gym', 'Open Gym')}
            {navLink('/officer/khel-maidaan', 'Khel Maidaan')}
          </div>
        </nav>
        <div className="px-2 py-4 border-t border-teal-700 mb-safe">
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto w-full">{children}</main>
    </div>
  );
}
