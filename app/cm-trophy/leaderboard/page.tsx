'use client';

import PageHero from '@/components/PageHero';
import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';
import { useCmTrophyLeaderboard } from '@/hooks/useLeaderboard';

export default function CmTrophyLeaderboardPage() {
  const { entries, loading, error } = useCmTrophyLeaderboard();

  return (
    <>
      <PageHero
        hindiTitle="सीएम चैंपियनशिप ट्रॉफी 2026-27 — जिला लीडरबोर्ड"
        title="CM Championship Trophy 2026-27 — District Leaderboard"
        subtitle="Medal tally ranking of all 13 districts of Uttarakhand"
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
          <CmTrophyLeaderboardTable entries={entries} />
        )}
      </div>
    </>
  );
}
