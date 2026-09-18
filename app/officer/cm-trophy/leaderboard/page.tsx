'use client';

import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';
import { useOfficerMedalLeaderboard } from '@/hooks/useOfficerCmTrophy';

export default function OfficerLeaderboardPage() {
  const { data, isLoading, isError, error } = useOfficerMedalLeaderboard();

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Leaderboard</h1>
      <p className="text-sm text-gray-500 mb-6">Nyay Panchayat-level medal tally.</p>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4 text-red-500 text-sm">{(error as Error).message}</div>
      ) : (
        <CmTrophyLeaderboardTable entries={data?.data ?? []} entityLabel="Nyay Panchayat" />
      )}
    </div>
  );
}
