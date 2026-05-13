"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface DoOfficer {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
}

interface District {
  name: string;
  doOfficer: DoOfficer | null;
  totalBlocks: number;
  activeBlocks: number;
}

function getFlags(d: District) {
  const flags: string[] = [];
  if (!d.doOfficer)             flags.push("No DO Officer");
  if (!d.doOfficer?.isActive)   flags.push("DO Inactive");
  if (d.totalBlocks === 0)      flags.push("No Blocks");
  if (d.activeBlocks < d.totalBlocks) flags.push("Inactive BOs");
  return flags;
}

export default function DashboardPage() {
  const router = useRouter();
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`/api/admin/dashboard`)
      .then(async (res) => {
        if (res.status === 401) { router.push("/admin/login"); return; }
        const data = await res.json();
        if (data.success) setDistricts(data.districts);
        else setError(data.error || "Failed to load dashboard.");
      })
      .catch(() => setError("Network error."))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = useMemo(() => {
    if (!search.trim()) return districts;
    const q = search.toLowerCase();
    return districts.filter(d => d.name.toLowerCase().includes(q));
  }, [districts, search]);

  const totalFlags = districts.reduce((s, d) => s + getFlags(d).length, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-xs text-gray-400 mt-0.5">{districts.length} districts · click a card for details</p>
        </div>

        {/* Stats strip */}
        {!loading && districts.length > 0 && (
          <div className="flex gap-3 flex-wrap">
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
              <p className="text-lg font-bold text-blue-700">{districts.length}</p>
              <p className="text-[10px] text-blue-500 font-medium uppercase">Districts</p>
            </div>
            <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
              <p className="text-lg font-bold text-teal-700">{districts.reduce((s, d) => s + d.totalBlocks, 0)}</p>
              <p className="text-[10px] text-teal-500 font-medium uppercase">Total Blocks</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
              <p className="text-lg font-bold text-green-700">{districts.reduce((s, d) => s + d.activeBlocks, 0)}</p>
              <p className="text-[10px] text-green-500 font-medium uppercase">Active Blocks</p>
            </div>
            {totalFlags > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 text-center min-w-[70px]">
                <p className="text-lg font-bold text-amber-600">{totalFlags}</p>
                <p className="text-[10px] text-amber-500 font-medium uppercase">Flags</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          placeholder="Search district…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <i className="fas fa-times text-xs" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-10">
          <i className="fas fa-circle-notch fa-spin" /> Loading districts…
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      {filtered.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <i className="fas fa-search text-3xl mb-2 block text-gray-200" />
          No districts match &ldquo;{search}&rdquo;
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((d) => {
          const flags = getFlags(d);
          const href = `/admin/dashboard/districts/${encodeURIComponent(d.name)}`;
          return (
            <Link key={d.name} href={href} className="group block">
              <div className={`bg-white rounded-xl shadow-sm border p-4 transition-all duration-200 cursor-pointer
                group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-blue-300
                ${flags.length > 0 ? 'border-amber-200' : 'border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-2 gap-2">
                  <h3 className="font-semibold text-gray-800 text-sm leading-tight group-hover:text-blue-700 transition-colors">
                    {d.name}
                  </h3>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {flags.length > 0 && (
                      <span className="flex items-center gap-0.5 bg-amber-100 text-amber-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        title={flags.join(', ')}>
                        <i className="fas fa-exclamation-triangle text-[8px]" /> {flags.length}
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      d.doOfficer?.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {d.doOfficer?.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3 truncate">
                  DO: {d.doOfficer?.name ?? <em className="text-gray-400">Not assigned</em>}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                  <span>Blocks</span>
                  <span className="font-semibold">{d.activeBlocks} / {d.totalBlocks} active</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: d.totalBlocks > 0 ? `${(d.activeBlocks / d.totalBlocks) * 100}%` : "0%" }}
                  />
                </div>

                {flags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {flags.slice(0, 3).map(f => (
                      <span key={f} className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                        {f}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end text-[11px] text-blue-500 font-semibold group-hover:gap-1.5 gap-1 transition-all">
                  View details <i className="fas fa-arrow-right text-[9px] transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
