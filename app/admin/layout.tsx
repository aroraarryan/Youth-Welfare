"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch(`${API}/admin/logout`, { method: "POST", credentials: "include" });
    router.push("/admin/login");
  };

  const navLink = (href: string, label: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <Link
        href={href}
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-blue-800 text-white flex flex-col">
        <div className="px-4 py-5 border-b border-blue-700">
          <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
          <p className="text-xs text-blue-300 mt-0.5">Yuva Shakti Portal</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navLink("/admin/dashboard", "Dashboard")}
          {navLink("/admin/officers", "Officers")}
        </nav>
        <div className="px-2 py-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full text-left block px-4 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  );
}
