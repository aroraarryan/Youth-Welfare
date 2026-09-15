'use client';

import { Fragment, useEffect, useState } from 'react';
import { useEntitySportBreakdown } from '@/hooks/useLeaderboard';
import { CmTrophyMedalLevel } from '@/lib/api/adminCmTrophyApi';

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
  /** Required when expandable — which geo level entries belong to, for the sport-breakdown lookup. */
  level?: CmTrophyMedalLevel;
  /** Allow clicking a row to reveal its sport-wise medal breakdown. */
  expandable?: boolean;
}

const PAGE_SIZE = 15;

function SportBreakdownRow({ level, entityId }: { level: CmTrophyMedalLevel; entityId: string }) {
  const { rows, loading } = useEntitySportBreakdown(level, entityId);

  return (
    <tr>
      <td colSpan={7} className="p-0 bg-[#f8fafc]">
        {loading ? (
          <div className="py-6 text-center text-gray-400 text-sm">
            <i className="fas fa-circle-notch fa-spin mr-2" />
            Loading sport-wise breakdown…
          </div>
        ) : rows.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-sm">No medals recorded yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1e3a8a]/90 text-left">
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider w-16">Sr.</th>
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider">Sport</th>
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider text-center">🥇 Gold</th>
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider text-center">🥈 Silver</th>
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider text-center">🥉 Bronze</th>
                <th className="px-4 py-2 text-[10px] font-semibold text-white uppercase tracking-wider text-center">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((r, idx) => (
                <tr key={r.sportId} className="odd:bg-white even:bg-gray-50/60">
                  <td className="px-4 py-2 text-gray-500">{idx + 1}.</td>
                  <td className="px-4 py-2 text-gray-900 font-medium">{r.sportName}</td>
                  <td className="px-4 py-2 text-center">{r.gold}</td>
                  <td className="px-4 py-2 text-center">{r.silver}</td>
                  <td className="px-4 py-2 text-center">{r.bronze}</td>
                  <td className="px-4 py-2 text-center font-semibold text-gray-900">{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </td>
    </tr>
  );
}

export default function CmTrophyLeaderboardTable({ entries, limit, entityLabel = 'District', level, expandable = false }: Props) {
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Reset to page 1 whenever the tab (entity type) changes, not on every
  // parent re-render — entries is a fresh array reference each fetch.
  useEffect(() => {
    setPage(1);
    setExpandedId(null);
  }, [entityLabel]);

  const all = limit ? entries.slice(0, limit) : entries;
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const rows = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              {expandable && <th className="px-4 py-3 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={expandable ? 7 : 6} className="text-center py-10 text-gray-400 text-sm">No leaderboard data yet.</td>
              </tr>
            ) : (
              rows.map((r, idx) => {
                const isExpanded = expandable && expandedId === r.entityId;
                return (
                  <Fragment key={r.entityId}>
                    <tr
                      onClick={expandable ? () => setExpandedId(isExpanded ? null : r.entityId) : undefined}
                      className={`hover:bg-gray-50 transition-colors ${expandable ? 'cursor-pointer' : ''}`}
                    >
                      <td className="px-4 py-3 text-gray-900 font-semibold">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">{r.entityName}</td>
                      <td className="px-4 py-3 text-center">{r.gold}</td>
                      <td className="px-4 py-3 text-center">{r.silver}</td>
                      <td className="px-4 py-3 text-center">{r.bronze}</td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-900">{r.total}</td>
                      {expandable && (
                        <td className="px-4 py-3 text-center">
                          <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'} text-[10px] text-gray-400`} />
                        </td>
                      )}
                    </tr>
                    {isExpanded && level && <SportBreakdownRow level={level} entityId={r.entityId} />}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {all.length > PAGE_SIZE && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
          <span>Page {page} of {totalPages} ({all.length} total)</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Prev</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
