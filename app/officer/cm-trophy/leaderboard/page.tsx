'use client';

import { useState } from 'react';
import CmTrophyLeaderboardTable from '@/components/CmTrophyLeaderboardTable';
import { useOfficerMedalLeaderboard } from '@/hooks/useOfficerCmTrophy';
import { usePortalSession } from '@/hooks/usePortalSession';
import { OfficerLeaderboardLevel } from '@/lib/api/officerCmTrophyApi';

// Block officers only have the Nyay Panchayat board; district officers get all three.
const LEVEL_TABS: { value: OfficerLeaderboardLevel; label: string }[] = [
  { value: 'nyay-panchayat', label: 'Nyay Panchayat' },
  { value: 'vidhan-sabha', label: 'Vidhan Sabha' },
  { value: 'sansad', label: 'Sansad' },
];

export default function OfficerLeaderboardPage() {
  const { session } = usePortalSession();
  const isDistrictOfficer = session?.kind === 'officer' && session.role === 'DO_PRD';
  const [level, setLevel] = useState<OfficerLeaderboardLevel>('nyay-panchayat');
  const activeLevel = isDistrictOfficer ? level : 'nyay-panchayat';
  const label = LEVEL_TABS.find((t) => t.value === activeLevel)!.label;

  const { data, isLoading, isError, error } = useOfficerMedalLeaderboard(activeLevel);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-gray-900 mb-1">CM Trophy — Leaderboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        {label}-level medal tally{isDistrictOfficer ? ' for players from your district.' : '.'}
      </p>

      {isDistrictOfficer && (
        <div className="flex gap-2 mb-4">
          {LEVEL_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setLevel(t.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium border ${
                level === t.value ? 'bg-[#1e3a8a] text-white border-[#1e3a8a]' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg flex items-center justify-center py-20 text-gray-400 text-sm">Loading…</div>
      ) : isError ? (
        <div className="bg-white border border-gray-200 rounded-lg text-center py-20 px-4 text-red-500 text-sm">{(error as Error).message}</div>
      ) : (
        <CmTrophyLeaderboardTable entries={data?.data ?? []} entityLabel={label} />
      )}
    </div>
  );
}
