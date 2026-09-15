'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageHero from '@/components/PageHero';
import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';
import { useCmTrophyLeaderboard } from '@/hooks/useLeaderboard';
import { CmTrophyMedalLevel } from '@/lib/api/adminCmTrophyApi';

const TABS: { level: CmTrophyMedalLevel; label: string }[] = [
  { level: 'DISTRICT', label: 'District' },
  { level: 'SANSAD', label: 'Sansad' },
  { level: 'VIDHAN_SABHA', label: 'Vidhan Sabha' },
  { level: 'NYAY_PANCHAYAT', label: 'Nyay Panchayat' },
];

export default function CmTrophyLeaderboardPage() {
  const [level, setLevel] = useState<CmTrophyMedalLevel>('DISTRICT');
  const { entries, loading, error } = useCmTrophyLeaderboard(level);
  const activeLabel = TABS.find((t) => t.level === level)!.label;

  return (
    <>
      <PageHero
        hindiTitle="सीएम चैंपियनशिप ट्रॉफी 2026-27 — मेडल तालिका"
        title="CM Championship Trophy 2026-27 — Medal Tally"
        subtitle="Medal tally ranking by District, Sansad, Vidhan Sabha and Nyay Panchayat"
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'CM Championship Trophy 2026-27 Leaderboard' },
        ]}
        stats={[
          { value: '13', label: 'Districts' },
          { value: '2026-27', label: 'Edition' },
        ]}
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-12">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex gap-1 border-b border-gray-200">
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
          <Link
            href="/cm-trophy/medals"
            className="text-sm font-semibold bg-[#1e3a8a] text-white px-4 py-2 rounded-lg hover:bg-[#1e2f6b] flex items-center gap-2"
          >
            <i className="fa-solid fa-medal text-xs" />
            View Player Medals
          </Link>
        </div>

        <p className="text-xs text-gray-400 mb-4">Click a row to see the sport-wise medal breakdown.</p>

        {loading ? (
          <div className="bg-white border border-gray-200 rounded-lg flex flex-col items-center justify-center py-20 text-gray-400">
            <i className="fas fa-circle-notch fa-spin text-2xl mb-2" />
            <p className="text-sm">Loading leaderboard…</p>
          </div>
        ) : error ? (
          <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        ) : (
          <CmTrophyLeaderboardTable entries={entries} entityLabel={activeLabel} level={level} expandable />
        )}
      </div>
    </>
  );
}
