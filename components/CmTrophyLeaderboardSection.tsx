'use client';

import Link from 'next/link';
import { useCmTrophyLeaderboard } from '@/hooks/useLeaderboard';
import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';

export default function CmTrophyLeaderboardSection() {
  const { entries, loading } = useCmTrophyLeaderboard();

  return (
    <section className="py-12 px-4 sm:px-10 bg-[#f8fafc]">
      <div className="max-w-[1400px] mx-auto">
        <div className="rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
          <div className="bg-[#0f172a] px-6 py-4 flex items-center justify-between">
            <span className="text-white text-xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-trophy text-lg" />
              CM Championship Trophy 2026-27 — District Leaderboard
            </span>
            <div className="flex items-center gap-3">
              <Link
                href="/cm-trophy/leaderboard"
                className="border border-white/30 text-white/90 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                View All <i className="fa-solid fa-arrow-up-right-from-square text-xs" />
              </Link>
              <Link
                href="/cm-trophy/grievance"
                className="border border-white/30 text-white/90 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/10 flex items-center gap-2 transition-colors"
              >
                Grievance <i className="fa-solid fa-circle-exclamation text-xs" />
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="bg-white flex flex-col items-center justify-center py-16 text-gray-400">
              <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
              <p className="text-sm">Loading leaderboard…</p>
            </div>
          ) : (
            <CmTrophyLeaderboardTable entries={entries} limit={5} />
          )}
        </div>
      </div>
    </section>
  );
}
