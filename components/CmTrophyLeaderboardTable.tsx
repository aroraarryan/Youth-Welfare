'use client';

export interface LeaderboardRow {
  districtId: string;
  districtName: string;
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

interface Props {
  entries: LeaderboardRow[];
  limit?: number;
  /** When provided, renders editable number inputs instead of static counts. */
  onChange?: (districtId: string, field: 'gold' | 'silver' | 'bronze', value: number) => void;
}

export default function CmTrophyLeaderboardTable({ entries, limit, onChange }: Props) {
  const rows = limit ? entries.slice(0, limit) : entries;
  const editable = !!onChange;

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1e3a8a] text-left">
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">Rank</th>
              <th className="px-4 py-3 text-[11px] font-semibold text-white uppercase tracking-wider">District</th>
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
                <tr key={r.districtId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-900 font-semibold">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium">{r.districtName}</td>
                  {(['gold', 'silver', 'bronze'] as const).map((field) => (
                    <td key={field} className="px-4 py-3 text-center">
                      {editable ? (
                        <input
                          type="number"
                          min={0}
                          value={r[field]}
                          onChange={(e) => onChange!(r.districtId, field, Math.max(0, Number(e.target.value)))}
                          className="w-16 text-center border border-gray-300 rounded px-2 py-1"
                        />
                      ) : (
                        r[field]
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center font-semibold text-gray-900">
                    {editable ? r.gold + r.silver + r.bronze : r.total}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
