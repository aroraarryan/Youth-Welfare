"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleLogout = async () => {
    await fetch(`/api/admin/logout`, { method: "POST" });
    router.push("/admin/login");
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
        onClick={() => setSidebarOpen(false)}
        className={`block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          active
            ? "bg-blue-700 text-white"
            : "text-blue-100 hover:bg-blue-700 hover:text-white"
        }`}
      >
        {label}
      </Link>
    );
  };

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-blue-800 text-white p-4 flex items-center justify-between z-[110] shadow-md">
        <div>
          <h1 className="text-base font-bold leading-none">Admin Panel</h1>
          <p className="text-[10px] text-blue-300 mt-1">Yuva Shakti Portal</p>
        </div>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-xl p-2 hover:bg-blue-700 rounded-lg transition-colors"
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
        fixed inset-y-0 left-0 w-64 bg-blue-800 text-white flex flex-col z-[130] transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 md:w-56 md:flex
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:block px-4 py-5 border-b border-blue-700">
          <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
          <p className="text-xs text-blue-300 mt-0.5">Yuva Shakti Portal</p>
        </div>
        <nav className="flex-1 px-2 py-4 overflow-y-auto pt-20 md:pt-4 space-y-0.5">
          {navLink("/admin/dashboard", "Dashboard")}
          {navLink("/admin/officers",  "Officers")}
          {navLink("/admin/gallery",   "Gallery Approvals")}
          {navLink("/admin/downloads", "Downloads")}
          {navLink("/admin/rti",       "RTI")}
          {navLink("/admin/contact",   "Contact Messages")}

          {/* Mangal Dal */}
          <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
            Mangal Dal
          </p>
          {navLink("/admin/yuvak-mangal-dal",  "Yuvak Mangal Dal")}
          {navLink("/admin/mahila-mangal-dal", "Mahila Mangal Dal")}

          {/* Infrastructure */}
          <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-blue-300 uppercase tracking-widest">
            Infrastructure
          </p>
          {navLink("/admin/multipurpose-halls",           "Multipurpose Halls")}
          {navLink("/admin/mini-stadiums",                "Mini Stadiums")}
          {navLink("/admin/youth-hostels",                "Youth Hostels")}
          {navLink("/admin/vocational-training-centers",  "Vocational Centers")}
          {navLink("/admin/indoor-gym",                   "Indoor Gym")}
          {navLink("/admin/open-gym",                     "Open Gym")}
          {navLink("/admin/khel-maidaan",                 "Khel Maidaan")}
        </nav>
        <div className="px-2 py-4 border-t border-blue-700 mb-safe">
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto w-full">{children}</main>
    </div>
  );
}
