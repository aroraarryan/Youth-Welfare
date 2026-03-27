'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL;

export default function OfficerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/officer/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch(`${API}/officer/logout`, { method: 'POST', credentials: 'include' });
    router.push('/officer/login');
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link
        href={href}
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
    <div className="min-h-screen flex">
      <aside className="w-56 bg-teal-800 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-teal-700">
          <h1 className="text-lg font-bold leading-tight">Officer Portal</h1>
          <p className="text-xs text-teal-300 mt-0.5">Yuva Shakti Portal</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLink('/officer/dashboard', 'Dashboard')}
        </nav>
        <div className="px-2 py-4 border-t border-teal-700">
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 rounded-md text-sm font-medium text-teal-100 hover:bg-teal-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
