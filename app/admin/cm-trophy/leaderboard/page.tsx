'use client';

import { useState } from 'react';
import Link from 'next/link';
import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';
import { useAdminMedalLeaderboard } from '@/hooks/useAdminCmTrophy';
import { CmTrophyMedalLevel } from '@/lib/api/adminCmTrophyApi';

const TABS: { level: CmTrophyMedalLevel; label: string }[] = [
  { level: 'DISTRICT', label: 'District' },
  { level: 'NYAY_PANCHAYAT', label: 'Nyay Panchayat' },
  { level: 'VIDHAN_SABHA', label: 'Vidhan Sabha' },
  { level: 'SANSAD', label: 'Sansad' },
];

export default function AdminCmTrophyLeaderboardPage() {
  const [level, setLevel] = useState<CmTrophyMedalLevel>('DISTRICT');
  const { data, isLoading, isError, error } = useAdminMedalLeaderboard(level);
  const activeLabel = TABS.find((t) => t.level === level)!.label;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-xl font-bold text-gray-900">CM Trophy 2026-27 — Leaderboard</h1>
        <Link
          href="/admin/cm-trophy/medals"
          className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b]"
        >
          <i className="fas fa-plus mr-2" />
          Add Medal
        </Link>
      </div>

      <div className="flex gap-1 mb-4 border-b border-gray-200">
        {TABS.map((t) => (
          <button
            key={t.level}
            onClick={() => setLevel(t.level)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              level === t.level
                ? 'border-[#1e3a8a] text-[#1e3a8a]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400 mb-4">
        Computed from individual medal records. Add or bulk-upload records on the{' '}
        <Link href="/admin/cm-trophy/medals" className="underline">Add Medal</Link> page.
      </p>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
          <p className="text-sm">Loading leaderboard…</p>
        </div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4">
          <p className="text-red-500 text-sm">{(error as Error).message}</p>
        </div>
      ) : (
        <CmTrophyLeaderboardTable entries={data?.data ?? []} entityLabel={activeLabel} />
      )}
    </div>
  );
}
