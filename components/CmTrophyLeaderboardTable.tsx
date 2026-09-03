'use client';

export interface LeaderboardRow {
  entityId: string;
  entityName: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface Props {
  entries: LeaderboardRow[];
  limit?: number;
  /** Column header for the entity name (District, Nyay Panchayat, Vidhan Sabha, Sansad). */
  entityLabel?: string;
}

export default function CmTrophyLeaderboardTable({ entries, limit, entityLabel = 'District' }: Props) {
  const rows = limit ? entries.slice(0, limit) : entries;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e3a8a] text-left">
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">{entityLabel}</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider text-center">🥇 Gold</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider text-center">🥈 Silver</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider text-center">🥉 Bronze</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider text-center">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">No leaderboard data yet.</td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={r.entityId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-semibold">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.entityName}</td>
                  <td className="px-4 py-3 text-center">{r.gold}</td>
                  <td className="px-4 py-3 text-center">{r.silver}</td>
                  <td className="px-4 py-3 text-center">{r.bronze}</td>
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">{r.total}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
